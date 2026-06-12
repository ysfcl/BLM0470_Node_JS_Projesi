import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSensorContext } from '../services/SensorContext';

function AlarmItem({ item }) {
  const isFall = item.type === 'FALL';
  return (
    <View style={[s.item, isFall ? s.itemFall : s.itemInactivity]}>
      <Text style={s.itemIcon}>{isFall ? '🚨' : '😴'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.itemType}>{isFall ? 'Düşme Tespiti' : 'Hareketsizlik'}</Text>
        <Text style={s.itemDetail}>{item.details}</Text>
        <Text style={s.itemTime}>
          {new Date(item.timestamp).toLocaleString('tr-TR')}
        </Text>
      </View>
    </View>
  );
}

export default function AlarmsScreen() {
  const { alarms, clearAlarms } = useSensorContext();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>🚨 Alarm Geçmişi</Text>
        {alarms.length > 0 && (
          <TouchableOpacity onPress={clearAlarms}>
            <Text style={s.clearBtn}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {alarms.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>✅</Text>
          <Text style={s.emptyText}>Henüz alarm yok</Text>
          <Text style={s.emptyHint}>Dashboard'dan izlemeyi başlat</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <AlarmItem item={item} />}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 8,
  },
  title: { color: '#E6EDF3', fontSize: 20, fontWeight: '700' },
  clearBtn: { color: '#FF7B72', fontSize: 14 },

  item: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#161B22', borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1,
  },
  itemFall: { borderColor: '#6E2C2C' },
  itemInactivity: { borderColor: '#3D2B00' },
  itemIcon: { fontSize: 24 },
  itemType: { color: '#E6EDF3', fontWeight: '600', fontSize: 14, marginBottom: 2 },
  itemDetail: { color: '#8B949E', fontSize: 12, marginBottom: 4 },
  itemTime: { color: '#484F58', fontSize: 11 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#E6EDF3', fontSize: 16, fontWeight: '600' },
  emptyHint: { color: '#8B949E', fontSize: 13 },
});
