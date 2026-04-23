import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function MonthSwitcher({ label, onPrev, onNext, hasPrev, hasNext, diff }) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={[styles.arrow, !hasPrev && styles.arrowDisabled]}
        onPress={hasPrev ? onPrev : undefined}
        activeOpacity={hasPrev ? 0.7 : 1}
      >
        <Text style={[styles.arrowTxt, !hasPrev && styles.arrowTxtDisabled]}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.monthTxt}>{label}</Text>

      <TouchableOpacity
        style={[styles.arrow, !hasNext && styles.arrowDisabled]}
        onPress={hasNext ? onNext : undefined}
        activeOpacity={hasNext ? 0.7 : 1}
      >
        <Text style={[styles.arrowTxt, !hasNext && styles.arrowTxtDisabled]}>›</Text>
      </TouchableOpacity>

      {diff !== null && diff !== undefined && (
        <View style={[styles.badge, diff > 0 ? styles.badgeUp : styles.badgeDown]}>
          <Text style={[styles.badgeTxt, diff > 0 ? styles.badgeTxtUp : styles.badgeTxtDown]}>
            {diff > 0 ? `▲ +${Math.abs(diff).toFixed(1)}%` : `▼ ${Math.abs(diff).toFixed(1)}%`} vs last month
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: 'wrap',
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: { opacity: 0.3 },
  arrowTxt: { fontSize: 16, color: COLORS.teal, lineHeight: 20 },
  arrowTxtDisabled: { color: COLORS.muted },
  monthTxt: { fontSize: 12, fontWeight: '700', color: COLORS.text, minWidth: 100, textAlign: 'center' },
  badge: { marginLeft: 'auto', borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8 },
  badgeDown: { backgroundColor: COLORS.tealFade },
  badgeUp: { backgroundColor: '#fce4ec' },
  badgeTxt: { fontSize: 9, fontWeight: '600' },
  badgeTxtDown: { color: COLORS.tealDark },
  badgeTxtUp: { color: '#b71c1c' },
});
