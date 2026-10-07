import type { ExpoConfig } from 'expo/config';
import { readDevelopmentOrigins } from './configuration/development-origin.cjs';

/** Configure only the local development app; validate public host settings without adding server secrets. */
export default function developmentConfig(): ExpoConfig {
  readDevelopmentOrigins(process.env);
  return {
    name: 'Holdlog Development', slug: 'holdlog-development', version: '0.0.0', scheme: 'holdlog-dev',
    platforms: ['ios', 'android'],
    ios: { bundleIdentifier: 'com.holdlog.development', infoPlist: { NSAppTransportSecurity: { NSAllowsArbitraryLoads: false, NSAllowsLocalNetworking: true } } },
    android: { package: 'com.holdlog.development' },
    // SDK57 opts into the scene lifecycle required by Xcode27/iOS27.
    plugins: ['expo-dev-client', ['expo-build-properties', { ios: { enableSceneSupport: true } }]],
  };
}
