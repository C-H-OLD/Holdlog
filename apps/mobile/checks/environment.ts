import { Platform } from 'react-native';
/**
 * Read the React Native platform identifier to verify mobile dependency/type resolution.
 * @returns The platform identifier supplied by React Native; does not prove a device build ran.
 */
export const platform = (): string => Platform.OS;
