
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { isAuthenticated } from '@/services/authService';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const isAuth = await isAuthenticated();
        if (!isAuth) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Root auth check error:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Disable headers globally, customize per screen
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
