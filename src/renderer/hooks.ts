// Import React hooks for the shared snapshot subscription used by every route.
import { useCallback, useEffect, useRef, useState } from 'react';

// Import the honest initial state factory and public snapshot type.
import {
  createLoadingOverviewSnapshot,
  type OverviewSnapshot,
} from '../shared/contracts/overview-snapshot';

// Import the validated preferences contract for theme and clock presentation.
import type { Preferences } from '../shared/contracts/preferences';
import { createDefaultPreferences } from '../shared/contracts/preferences';

/**
 * Subscribe once to validated preload snapshots and expose the current state plus a manual refresh function.
 * Every route renders from this single normalized store so no screen can hold divergent privileged data.
 */
export function useOverviewSnapshot(): {
  readonly snapshot: OverviewSnapshot;
  readonly refresh: () => Promise<void>;
  readonly isRefreshing: boolean;
  readonly error: string | null;
} {
  // Begin with an honest loading state until preload returns its current snapshot.
  const [snapshot, setSnapshot] = useState<OverviewSnapshot>(() =>
    createLoadingOverviewSnapshot(null),
  );

  // Track only local button feedback; the privileged controller owns refresh deduplication.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revision = useRef(0);
  const refreshing = useRef(false);
  const mounted = useRef(false);

  // Subscribe before reading so an immediate refresh update cannot be missed.
  useEffect(() => {
    // Prevent a late initial promise from updating an unmounted renderer.
    let isMounted = true;
    mounted.current = true;
    const initialRevision = revision.current;

    // Subscribe to pushed snapshots through the frozen preload bridge.
    const unsubscribe = window.tokenTrail.onOverviewChanged((nextSnapshot) => {
      revision.current += 1;
      if (isMounted) {
        setSnapshot(nextSnapshot);
        setError(null);
      }
    });

    // Read the controller's current snapshot without initiating another refresh.
    void window.tokenTrail
      .getOverviewSnapshot()
      .then((currentSnapshot) => {
        if (isMounted && revision.current === initialRevision) setSnapshot(currentSnapshot);
      })
      .catch(() => {
        if (isMounted && revision.current === initialRevision)
          setError('Could not load account data. Try refreshing.');
      });

    // Remove the exact preload listener and reject late updates during unmount.
    return () => {
      isMounted = false;
      mounted.current = false;
      unsubscribe();
    };
  }, []);

  // Request one purpose-specific refresh with immediate local feedback.
  const refresh = useCallback(async (): Promise<void> => {
    if (refreshing.current) return;
    refreshing.current = true;
    setIsRefreshing(true);
    setError(null);
    const requestedRevision = revision.current;
    try {
      const next = await window.tokenTrail.refreshOverview();
      if (mounted.current && revision.current === requestedRevision) setSnapshot(next);
    } catch {
      if (mounted.current) setError('Could not refresh account data. Try again.');
    } finally {
      refreshing.current = false;
      if (mounted.current) setIsRefreshing(false);
    }
  }, []);

  return { snapshot, refresh, isRefreshing, error };
}

/**
 * Expose the current Unix time in seconds as render-safe state. The value refreshes on a bounded interval so
 * countdowns and timeline classifications stay current without impure calls during React rendering.
 */
export function useCurrentUnixSeconds(intervalMilliseconds = 30_000): number {
  // Start at zero so the first paint classifies conservatively until the effect samples the real clock.
  const [nowSeconds, setNowSeconds] = useState(0);

  // Sample the clock immediately and then on the bounded interval only while mounted.
  useEffect(() => {
    const update = (): void => setNowSeconds(Math.floor(Date.now() / 1_000));
    update();
    const timer = setInterval(update, intervalMilliseconds);
    return () => clearInterval(timer);
  }, [intervalMilliseconds]);

  return nowSeconds;
}

/**
 * Load persisted preferences once and expose an updater that persists complete replacements. Renderer state
 * never contains usage-derived values because the preferences schema itself excludes them. A separate
 * adoption path applies already-validated state without persisting, for flows such as clear-data where
 * the privileged side already deleted the document and returned reviewed defaults.
 */
export function usePreferences(): {
  readonly preferences: Preferences;
  readonly savePreferences: (next: Preferences) => Promise<void>;
  readonly adoptPreferences: (next: Preferences) => void;
  readonly isSaving: boolean;
  readonly error: string | null;
} {
  // Start from reviewed defaults so first render never waits on IPC.
  const [preferences, setPreferences] = useState<Preferences>(createDefaultPreferences);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const editRevision = useRef(0);
  const confirmed = useRef(preferences);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const revision = editRevision.current;
    void window.tokenTrail
      .getPreferences()
      .then((loaded) => {
        if (mounted.current && revision === editRevision.current) {
          confirmed.current = loaded;
          setPreferences(loaded);
        }
      })
      .catch(() => {
        if (mounted.current && revision === editRevision.current)
          setError('Could not load preferences. Please try again.');
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  // Render intended edits immediately, but serialize persistence and roll back only the latest failed edit.
  const savePreferences = async (next: Preferences): Promise<void> => {
    const revision = ++editRevision.current;
    setIsSaving(true);
    setPreferences(next);
    setError(null);
    const operation = queue.current.then(() => window.tokenTrail.setPreferences(next));
    queue.current = operation.catch(() => undefined);
    try {
      const stored = await operation;
      confirmed.current = stored;
      if (mounted.current && revision === editRevision.current) setPreferences(stored);
    } catch {
      if (mounted.current && revision === editRevision.current) {
        setPreferences(confirmed.current);
        setError('Could not save preferences. Your last saved settings have been restored.');
      }
    } finally {
      if (mounted.current && revision === editRevision.current) setIsSaving(false);
    }
  };

  const adoptPreferences = (next: Preferences): void => {
    editRevision.current += 1;
    confirmed.current = next;
    setPreferences(next);
    setError(null);
  };

  return { preferences, savePreferences, adoptPreferences, error, isSaving };
}
