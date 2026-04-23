import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function RecommendationCard({ rec }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>
          {rec.icon === 'phone' ? '📱' : rec.icon === 'card' ? '💳' : '🍔'}
        </Text>
        <View>
          <Text style={styles.title}>{rec.title}</Text>
          <Text style={styles.subtitle}>{rec.subtitle}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Row label="Issue" value={rec.issue} />
        <Row label="Est. fees paid" value={rec.estFees} />
        <Row label="Better option" value={rec.betterOption} />
        <Row label="Potential saving" value={rec.saving} green />
      </View>
    </View>
  );
}

function Row({ label, value, green }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, green && styles.green]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffddb0',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  icon: {
    fontSize: 15,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 9,
    color: COLORS.muted,
  },
  body: {
    padding: 6,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    color: COLORS.muted,
  },
  value: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '500',
  },
  green: {
    color: COLORS.green,
    fontWeight: '700',
  },
});