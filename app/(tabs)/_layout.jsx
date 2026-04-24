import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import THEME from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.dark,
          borderTopColor: '#ffffff10',
          paddingTop: 8,
          minHeight: 60,
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', paddingBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights', href: '/smartspend/recommendations', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="lightbulb-on" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-bar" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="goals"
        options={{ title: 'Goals', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bullseye-arrow" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="menu" size={26} color={color} /> }}
      />
    </Tabs>
  );
}
