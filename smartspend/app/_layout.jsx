import React from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { StoreProvider, useStore } from '../src/store';
import COLORS from '../src/constants/colors';

function RootNav() {
  const { user, authLoading } = useStore();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (authLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, authLoading, segments]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.black }}>
        <ActivityIndicator color={COLORS.teal} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="smartspend/index" />
      <Stack.Screen name="smartspend/category" />
      <Stack.Screen name="smartspend/recommendations" />
      <Stack.Screen name="smartspend/health-score" />
      <Stack.Screen name="smartspend/goals" />
      <Stack.Screen name="smartspend/add-goal" />
      <Stack.Screen name="smartspend/goal-detail" />
      <Stack.Screen name="smartspend/charges" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <RootNav />
      </StoreProvider>
    </SafeAreaProvider>
  );
}