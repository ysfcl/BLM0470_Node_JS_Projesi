import { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSensorContext } from '../services/SensorContext';

function SensorRow({ label, x, y, z }) {
  return (
    <View style={s.sensorRow}>
      <Text style={s.sensorLabel}>{label}</Text>
      <View style={s.sensorValues}>
        <Text style={[s.val, { color: '#FF7B72' }]}>x {x.toFixed(3)}</Text>
        <Text style={[s.val, { color: '#79C0FF' }]}>y {y.toFixed(3)}</Text>
        <Text style={[s.val, { color: '#56D364' }]}>z {z.toFixed(3)}</Text>
      </View>
    </View>
  );
}

function MagnitudeBar({ magnitude }) {
  // 0–3g aralığında normalize et
  const pct = Math.min((magnitude / 3) * 100, 100);
  const color = magnitude > 2.0 ? '#FF7B72' : magnitude > 1.4 ? '#F0883E' : '#56D364';
  return (
    <View style={s.barBg}>
      <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function DashboardScreen() {
  const { accel, gyro, magnitude, alarms, isActive, start, stop } = useSensorContext();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isActive]);

  const lastAlarm = alarms[0];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Başlık */}
        <Text style={s.title}>📡 Canlı İzleme</Text>

        {/* Durum kartı */}
        <View style={[s.statusCard, isActive ? s.statusActive : s.statusIdle]}>
          <Animated.Text style={[s.statusIcon, { transform: [{ scale: pulseAnim }] }]}>
            {isActive ? '🟢' : '⚫'}
          </Animated.Text>
          <Text style={s.statusText}>
            {isActive ? 'Sensörler aktif — veri toplanıyor' : 'İzleme durduruldu'}
          </Text>
        </View>

        {/* Magnitude */}
        <View style={s.card}>
          <Text style={s.cardTitle}>İvme Büyüklüğü</Text>
          <Text style={s.magnitudeVal}>{magnitude.toFixed(3)} g</Text>
          <MagnitudeBar magnitude={magnitude} />
          <Text style={s.hint}>
            {magnitude > 2.0 ? '⚠️ Yüksek ivme — düşme riski analiz ediliyor' :
             magnitude > 1.4 ? '🟡 Aktif hareket' : '✅ Normal'}
          </Text>
        </View>

        {/* Sensör değerleri */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Ham Sensör Verisi</Text>
          <SensorRow label="İvmeölçer (m/s²)" x={accel.x} y={accel.y} z={accel.z} />
          <View style={s.divider} />
          <SensorRow label="Jiroskop (rad/s)" x={gyro.x} y={gyro.y} z={gyro.z} />
        </View>

        {/* Son alarm */}
        {lastAlarm && (
          <View style={[s.card, s.alarmCard]}>
            <Text style={s.cardTitle}>Son Alarm</Text>
            <Text style={s.alarmType}>
              {lastAlarm.type === 'FALL' ? '🚨 DÜŞME' : '😴 HAREKETSİZLİK'}
            </Text>
            <Text style={s.alarmDetail}>{lastAlarm.details}</Text>
            <Text style={s.alarmTime}>
              {new Date(lastAlarm.timestamp).toLocaleTimeString('tr-TR')}
            </Text>
          </View>
        )}

        {/* Başlat / Durdur */}
        <TouchableOpacity
          style={[s.btn, isActive ? s.btnStop : s.btnStart]}
          onPress={isActive ? stop : start}
        >
          <Text style={s.btnText}>{isActive ? '⏹ Durdur' : '▶️ İzlemeyi Başlat'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { color: '#E6EDF3', fontSize: 20, fontWeight: '700', marginBottom: 16 },

  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  statusActive: { backgroundColor: '#0F2A1A', borderWidth: 1, borderColor: '#238636' },
  statusIdle: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  statusIcon: { fontSize: 18 },
  statusText: { color: '#8B949E', fontSize: 13, flex: 1 },

  card: {
    backgroundColor: '#161B22', borderRadius: 12,
    padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#21262D',
  },
  cardTitle: { color: '#8B949E', fontSize: 12, fontWeight: '600', marginBottom: 10, letterSpacing: 0.5 },

  magnitudeVal: { color: '#E6EDF3', fontSize: 36, fontWeight: '700', marginBottom: 10 },
  barBg: { height: 8, backgroundColor: '#21262D', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', borderRadius: 4 },
  hint: { color: '#8B949E', fontSize: 12 },

  sensorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sensorLabel: { color: '#8B949E', fontSize: 12, width: 110 },
  sensorValues: { flexDirection: 'row', gap: 10 },
  val: { fontSize: 12, fontFamily: 'monospace' },
  divider: { height: 1, backgroundColor: '#21262D', marginVertical: 10 },

  alarmCard: { borderColor: '#6E2C2C' },
  alarmType: { color: '#FF7B72', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  alarmDetail: { color: '#E6EDF3', fontSize: 13, marginBottom: 4 },
  alarmTime: { color: '#484F58', fontSize: 11 },

  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnStart: { backgroundColor: '#238636' },
  btnStop: { backgroundColor: '#6E2C2C' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
