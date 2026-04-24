import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatPulaShort } from '../../utils/currency';
import COLORS from '../../constants/colors';

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const createPieSlice = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
    "Z"
  ].join(" ");
};

export default function DonutChart({ categories, total, monthTime, basePath = '/category' }) {
  const router = useRouter();
  const radius = 120;
  const center = radius;
  let currentAngle = 0;

  const getIcon = (key) => {
    switch(key) {
      case 'dining': return 'food-fork-drink';
      case 'groceries': return 'cart-outline';
      case 'airtime': return 'cellphone';
      case 'atm': return 'cash-multiple';
      case 'fuel': return 'gas-station';
      case 'bankCharges': return 'bank-outline';
      case 'electricity': return 'lightning-bolt';
      default: return 'tag-outline';
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>SPENDING BREAKDOWN</Text>
        <Text style={styles.totalText}>{formatPulaShort(total)}</Text>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width={center * 2} height={center * 2}>
          <G>
            {categories.map((cat, idx) => {
              const percentage = total > 0 ? (cat.amount / total) : 0;
              if (percentage === 0) return null; // Skip drawing slices for 0%

              const sliceAngle = percentage * 360;
              const isFullCircle = percentage === 1;

              if (isFullCircle) {
                return (
                  <Circle
                    key={cat.key}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill={cat.color || COLORS.teal}
                    onPress={() => router.push({ pathname: basePath, params: { idx, time: monthTime } })}
                  />
                );
              }

              const pathData = createPieSlice(center, center, radius, currentAngle, currentAngle + sliceAngle);
              currentAngle += sliceAngle;

              return (
                <Path
                  key={cat.key}
                  d={pathData}
                  fill={cat.color || COLORS.teal}
                  onPress={() => router.push({ pathname: basePath, params: { idx, time: monthTime } })}
                />
              );
            })}
          </G>
        </Svg>
      </View>

      <View style={styles.legend}>
        {categories.map((cat, idx) => {
          const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
          return (
            <TouchableOpacity 
              key={cat.key} 
              style={styles.item}
              onPress={() => router.push({ pathname: basePath, params: { idx, time: monthTime } })}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name={getIcon(cat.key)} size={14} color={cat.color} style={{ marginRight: 4 }} />
              <Text style={styles.itemName}>{cat.name}</Text>
              <Text style={[styles.itemPct, { color: cat.color }]}>{pct}%</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 10, color: COLORS.muted, letterSpacing: 0.5, fontWeight: '700' },
  totalText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%', paddingVertical: 4 },
  itemName: { flex: 1, fontSize: 11, color: COLORS.text },
  itemPct: { fontSize: 11, fontWeight: '700' },
});
