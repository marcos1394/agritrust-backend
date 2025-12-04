import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../constants/TokenCache';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// ⚠️ PEGA AQUÍ TU LLAVE PÚBLICA DE CLERK (La misma del .env.local del frontend)
const CLERK_PUBLISHABLE_KEY = "pk_test_cG9wdWxhci1saW9uZXNzLTkyLmNsZXJrLmFjY291bnRzLmRldiQ"; 

// Componente para proteger rutas
const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(auth)'; // Grupo opcional si usaras carpetas
    
    if (isSignedIn) {
        // Si está logueado y trata de ir al login, mándalo al home
        // router.replace('/'); 
    } else if (!isSignedIn) {
        // Si NO está logueado, mándalo al login
        router.replace('/login');
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large" /></View>;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="application" options={{ headerShown: true, title: 'Fitosanidad' }} />
      <Stack.Screen name="harvest" options={{ headerShown: true, title: 'Cosecha' }} />
    </Stack>
  );
};

export default function Layout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
       <InitialLayout />
       <StatusBar style="light" />
    </ClerkProvider>
  );
}