import type { CapacitorConfig } from '@capacitor/cli';

/**
 * IMPORTANT:
 * - webDir: 'out' — points to Next.js static export (run `pnpm mobile:build` to generate)
 * - server.url: When set, the native WebView loads this URL instead of bundled files.
 *   Use for DEVELOPMENT only (e.g., Mac + iOS Simulator with live reload).
 *   For PRODUCTION App Store builds, comment out the `server` block so the
 *   bundled `out/` directory is used. API calls will route to the live server
 *   via the absolute URLs configured in your app's fetch calls.
 *
 * To switch environments:
 *   Dev:  uncomment server.url below, set to your local IP
 *   Prod: comment out server block (uses bundled `out/` + live API URL)
 */
const config: CapacitorConfig = {
  appId: 'com.setpoint.pr',
  appName: 'Set Point',
  webDir: 'out',
  // server: {
  //   url: 'http://YOUR_LOCAL_IP:3000',  // Dev only — replace with your machine IP
  //   cleartext: true,
  // },
  plugins: {
    // Add Capacitor plugin configs here as needed (e.g., PushNotifications, Camera)
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;

