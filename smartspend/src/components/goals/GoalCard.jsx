import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateGoal } from '../../services/goals/calculator';
import { formatPulaShort } from '../../utils/currency';
import COLORS from '../../constants/colors';

export default function GoalCard({ goal, onView, onEdit, onDelete }) {
  const { amountNeeded, requiredMonthly, percentComplete } = calculateGoal(goal);

  return (
    <TouchableOpacity style={styles.card} onPress={onView} activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.name}>{goal.name}</Text>
        <Text style={styles.sub}>Deadline: {goal.deadline}</Text>
      </View>
      <View style={styles.body}>
        <Row label="Target" value={formatPulaShort(goal.target)} />
        <Row label="Saved" value={formatPulaShort(goal.saved)} color={COLORS.green} />
        <Row label="Remaining" value={formatPulaShort(amountNeeded)} color={COLORS.red} />
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentComplete}%` }]} />
        </View>
        <View style={styles.pctRow}>
          <Text style={styles.pctTxt}>{percentComplete}% complete</Text>
          <Text style={styles.pctTxt}>Need {formatPulaShort(requiredMonthly)}/month</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onView}>
          <Text style={styles.btnPrimaryTxt}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onEdit}>
          <Text style={styles.btnTxt}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={onDelete}>
          <Text style={styles.btnDangerTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function Row({ label, value, color }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, color && { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.blue,
    padding: 10,
    paddingBottom: 8,
  },
  name: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sub: { color: 'rgba(255,255,255,0.65)', fontSize: 9, marginTop: 1 },
  body: { padding: 8, paddingHorizontal: 14, paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  rowLabel: { fontSize: 10, color: COLORS.muted },
  rowValue: { fontSize: 10, fontWeight: '700', color: COLORS.text },
  track: { height: 7, backgroundColor: '#eee', borderRadius: 4, marginVertical: 7 },
  fill: { height: 7, borderRadius: 4, backgroundColor: COLORS.teal },
  pctRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 6 },
  pctTxt: { fontSize: 9, color: COLORS.muted },
  actions: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
  },
  btn: {
    flex: 1,
    padding: 6,
    borderRadius: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  btnPrimary: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  btnPrimaryTxt: { fontSize: 10, fontWeight: '600', color: '#fff' },
  btnTxt: { fontSize: 10, fontWeight: '600', color: COLORS.text },
  btnDanger: { borderColor: '#ffcdd2' },
  btnDangerTxt: { fontSize: 10, fontWeight: '600', color: COLORS.red },
});