import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'home', route: '/(tabs)' },
  { label: 'Insights', icon: 'lightbulb-on', route: '/smartspend/recommendations' },
  { label: 'Analytics', icon: 'chart-bar', route: '/analytics' },
  { label: 'Goals', icon: 'bullseye-arrow', route: '/goals' },
  { label: 'More', icon: 'menu', route: '/more' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.tab}
            onPress={() => router.push(item.route)}
          >
            <View>
              <MaterialCommunityIcons name={item.icon} size={26} color={isActive ? COLORS.teal : '#555'} />
              {item.badge && <View style={styles.dot} />}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 7,
    paddingBottom: 5,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  labelActive: {
    color: COLORS.teal,
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 5,
    height: 5,
    backgroundColor: COLORS.orange,
    borderRadius: 3,
  },
});