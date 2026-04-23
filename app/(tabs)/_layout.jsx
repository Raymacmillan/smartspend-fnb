import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import THEME from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.dark,
          borderTopColor: '#ffffff10',
          paddingBottom: 6,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text> }}
      />
      <Tabs.Screen
        name="goals"
        options={{ title: 'Goals', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🎯</Text> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>☰</Text> }}
      />
    </Tabs>
  );
}
