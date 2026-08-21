// Import React hooks for the shared snapshot subscription used by every route.
import { useEffect, useState } from 'react';

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
} {
  // Begin with an honest loading state until preload returns its current snapshot.
  const [snapshot, setSnapshot] = useState<OverviewSnapshot>(() =>
    createLoadingOverviewSnapshot(null),
  );

  // Track only local button feedback; the privileged controller owns refresh deduplication.
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe before reading so an immediate refresh update cannot be missed.
  useEffect(() => {
    // Prevent a late initial promise from updating an unmounted renderer.
    let isMounted = true;

    // Subscribe to pushed snapshots through the frozen preload bridge.
    const unsubscribe = window.tokenTrail.onOverviewChanged((nextSnapshot) => {
      if (isMounted) setSnapshot(nextSnapshot);
    });

    // Read the controller's current snapshot without initiating another refresh.
    void window.tokenTrail.getOverviewSnapshot().then((currentSnapshot) => {
      if (isMounted) setSnapshot(currentSnapshot);
    });

    // Remove the exact preload listener and reject late updates during unmount.
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Request one purpose-specific refresh with immediate local feedback.
  const refresh = async (): Promise<void> => {
    // Ignore duplicate activation while the first bridge promise is unresolved.
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      setSnapshot(await window.tokenTrail.refreshOverview());
    } finally {
      setIsRefreshing(false);
    }
  };

  return { snapshot, refresh, isRefreshing };
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
 * never contains usage-derived values because the preferences schema itself excludes them.
 */
export function usePreferences(): {
  readonly preferences: Preferences;
  readonly savePreferences: (next: Preferences) => Promise<void>;
} {
  // Start from reviewed defaults so first render never waits on IPC.
  const [preferences, setPreferences] = useState<Preferences>(createDefaultPreferences);

  // Load the persisted document once after mount.
  useEffect(() => {
    let isMounted = true;
    void window.tokenTrail.getPreferences().then((loaded) => {
      if (isMounted) setPreferences(loaded);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist a complete replacement and adopt the stored validated result.
  const savePreferences = async (next: Preferences): Promise<void> => {
    setPreferences(await window.tokenTrail.setPreferences(next));
  };

  return { preferences, savePreferences };
}
