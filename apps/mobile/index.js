import { registerRootComponent } from 'expo';
import App from './App';
import { installDevelopmentChecks } from './src/development/diagnostics';

if (__DEV__) installDevelopmentChecks();
registerRootComponent(App);
