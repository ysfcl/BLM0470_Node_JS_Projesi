import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/services/AuthContext';
import { SensorProvider } from './src/services/SensorContext';

enableScreens(false);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SensorProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <StatusBar style="light" />
        </SensorProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}