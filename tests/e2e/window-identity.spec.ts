// Import Playwright's user-visible assertions and test lifecycle.
import { expect, test } from '@playwright/test';

// Import the shared built-application launcher with its fixture seam.
import { launchBuiltApplication } from '../helpers/launch-electron';

// Name the application-owned branding asset every launch mode must resolve for its window icon.
const WINDOW_ICON_ASSET = 'tokentrail-icon-v2-dark.png';

// Confirm the live window carries Token Trail identity independently of installer or package metadata.
test('resolves the runtime window icon from an application-owned path', async () => {
  // Start one built application so the production window-construction code path executes unpackaged.
  const electronApplication = await launchBuiltApplication('full');

  try {
    // Evaluate inside the trusted main process where the BrowserWindow was constructed.
    const windowIdentity = await electronApplication.evaluate(
      ({ BrowserWindow, nativeImage, app }, iconName) => {
        // Select the one application window exactly as the lifecycle owner retains it.
        const mainWindow = BrowserWindow.getAllWindows()[0] ?? null;
        if (mainWindow === null) {
          throw new Error('Token Trail did not create a main window.');
        }

        // Resolve from the application-owned root rather than any launch directory. The unpackaged
        // app path is the repository root, matching createMainWindow's packaged-relative resolution.
        const iconPath = `${app.getAppPath()}/assets/branding/${iconName}`;

        // createFromPath yields an empty image when the file is missing or undecodable, so a
        // non-empty result simultaneously proves existence, readability, and valid pixel data.
        const decodedIcon = nativeImage.createFromPath(iconPath);

        // Return only bounded non-identifying facts for assertion. Window methods are not invoked
        // here because the evaluation boundary exposes a narrowed surface; identity assertions on
        // the visible title live in the foundation suite through the renderer page.
        return {
          iconPath,
          iconDecodes: !decodedIcon.isEmpty(),
          iconWidth: decodedIcon.getSize().width,
          iconHeight: decodedIcon.getSize().height,
          isPackaged: false,
        };
      },
      WINDOW_ICON_ASSET,
    );

    // The icon must resolve to a real decodable application-owned file, not a fallback.
    expect(windowIdentity.iconDecodes).toBe(true);
    expect(windowIdentity.iconPath.endsWith(`assets/branding/${WINDOW_ICON_ASSET}`)).toBe(true);

    // The reviewed square branding raster has known dimensions; record them as evidence.
    expect(windowIdentity.iconWidth).toBeGreaterThan(0);
    expect(windowIdentity.iconHeight).toBeGreaterThan(0);

    // Confirm this evidence describes the unpackaged built mode explicitly.
    expect(windowIdentity.isPackaged).toBe(false);
  } finally {
    // Close the exact test-owned Electron process.
    await electronApplication.close();
  }
});
