import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import COLORS from '../../constants/colors';

const NAV_ITEMS = [
  { label: 'Home', icon: '🏠', route: '/' },
  { label: 'Bank', icon: '💳', route: '/bank' },
  { label: 'Message', icon: '💬', route: '/messages', badge: true },
  { label: 'My profile', icon: '👤', route: '/profile' },
  { label: 'Menu', icon: '☰', route: '/menu' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.tab}
            onPress={() => router.push(item.route)}
          >
            <View>
              <Text style={styles.icon}>{item.icon}</Text>
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
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 9,
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