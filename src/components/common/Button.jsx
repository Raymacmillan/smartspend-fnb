import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';

export default function Button({ label, onPress, variant = 'primary', loading = false, disabled = false }) {
  const isOutline = variant === 'outline';
  const isDark = variant === 'dark';
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isOutline && styles.outline,
        isDark && styles.dark,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled || loading}
    >
      {loading
        ? <ActivityIndicator color={isOutline ? COLORS.teal : '#fff'} size="small" />
        : <Text style={[styles.txt, isOutline && styles.outlineTxt]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 12,
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    alignItems: 'center',
  },
  outline: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.teal },
  dark: { backgroundColor: COLORS.black },
  disabled: { opacity: 0.5 },
  txt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  outlineTxt: { color: COLORS.teal },
});
