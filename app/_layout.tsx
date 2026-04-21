import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Importante: Importe o Provider que criamos
import { GameProvider } from '@/contexts/GameContext';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      {/* O GameProvider precisa abraçar a Stack para que todas as telas acessem o socket */}
      <GameProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="arena" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="victory" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
        <StatusBar style="light" />
      </GameProvider>
    </ThemeProvider>
  );
}