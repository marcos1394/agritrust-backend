import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#f1f5f9' }
        }}
      >
        {/* Definimos los títulos de cada ruta */}
        <Stack.Screen name="index" options={{ title: "AgriTrust Inicio", headerShown: false }} />
        <Stack.Screen name="application" options={{ title: "Bitácora Fitosanitaria" }} />
        <Stack.Screen name="harvest" options={{ title: "Escáner de Cosecha" }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}