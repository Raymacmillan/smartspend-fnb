import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store';
import THEME from '../src/constants/theme';

const TYPE_CONFIG = {
  warning: { icon: '⚠️', color: THEME.warning, bg: THEME.warningFade, label: 'Warning' },
  alert: { icon: '🔴', color: THEME.danger, bg: THEME.dangerFade, label: 'Alert' },
  success: { icon: '✅', color: THEME.success, bg: THEME.successFade, label: 'Info' },
  info: { icon: '💡', color: THEME.info, bg: THEME.infoFade, label: 'Tip' },
};

export default function Notifications() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const { notifications } = state;

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const markRead = (id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });

  const markAll = () => notifications.forEach((n) => !n.read && markRead(n.id));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.sub}>Alerts & spending warnings</Text>
        </View>
        {unread.length > 0 && (
          <TouchableOpacity onPress={markAll} style={styles.markAllBtn}>
            <Text style={styles.markAllTxt}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {unread.length > 0 && (
          <>
            <Text style={styles.groupLabel}>NEW · {unread.length} UNREAD</Text>
            {unread.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              return (
                <TouchableOpacity key={n.id} style={[styles.notifCard, styles.notifUnread]} onPress={() => markRead(n.id)} activeOpacity={0.85}>
                  <View style={[styles.notifIconWrap, { backgroundColor: cfg.bg }]}>
                    <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.notifTopRow}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.typeBadgeTxt, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.notifBody}>{n.body}</Text>
                    <Text style={styles.notifTime}>{n.time} · Tap to dismiss</Text>
                  </View>
                  <View style={styles.unreadDot} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {read.length > 0 && (
          <>
            <Text style={[styles.groupLabel, { marginTop: unread.length > 0 ? 8 : 0 }]}>EARLIER</Text>
            {read.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              return (
                <View key={n.id} style={styles.notifCard}>
                  <View style={[styles.notifIconWrap, { backgroundColor: THEME.bg }]}>
                    <Text style={{ fontSize: 18, opacity: 0.5 }}>{cfg.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.notifTopRow}>
                      <Text style={[styles.notifTitle, { color: THEME.textSub }]}>{n.title}</Text>
                    </View>
                    <Text style={[styles.notifBody, { color: THEME.textLight }]}>{n.body}</Text>
                    <Text style={styles.notifTime}>{n.time}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {notifications.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTxt}>No notifications yet.</Text>
          </View>
        )}

        <View style={styles.consentNote}>
          <Text style={styles.consentNoteTxt}>🔒 Notifications require your consent. Manage preferences in Security & Privacy Centre.</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.dark, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 26, lineHeight: 30 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900' },
  sub: { color: THEME.textLight, fontSize: 10, marginTop: 1 },
  markAllBtn: { backgroundColor: '#ffffff15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  markAllTxt: { color: THEME.primary, fontSize: 10, fontWeight: '700' },
  scroll: { padding: 14, gap: 8 },
  groupLabel: { fontSize: 9, color: THEME.textLight, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 2, marginBottom: 4 },
  notifCard: { backgroundColor: THEME.card, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  notifUnread: { borderWidth: 1, borderColor: THEME.primary + '33' },
  notifIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  notifTitle: { fontSize: 12, fontWeight: '800', color: THEME.text, flex: 1 },
  typeBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  typeBadgeTxt: { fontSize: 8, fontWeight: '700' },
  notifBody: { fontSize: 11, color: THEME.textSub, lineHeight: 17 },
  notifTime: { fontSize: 9, color: THEME.textLight, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.primary, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTxt: { fontSize: 13, color: THEME.textSub },
  consentNote: { backgroundColor: THEME.darkCard, borderRadius: 10, padding: 12, marginTop: 8 },
  consentNoteTxt: { fontSize: 10, color: THEME.textLight, lineHeight: 15 },
});
