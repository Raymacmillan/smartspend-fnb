import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../src/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="smartspend/index" />
          <Stack.Screen name="smartspend/category" />
          <Stack.Screen name="smartspend/recommendations" />
          <Stack.Screen name="smartspend/health-score" />
          <Stack.Screen name="smartspend/goals" />
          <Stack.Screen name="smartspend/add-goal" />
          <Stack.Screen name="smartspend/goal-detail" />
          <Stack.Screen name="smartspend/charges" />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}