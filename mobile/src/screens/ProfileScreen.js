import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>👤 Profil</Text>

      <View style={s.card}>
        <Text style={s.avatar}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        <Text style={s.name}>{user?.name ?? '—'}</Text>
        <Text style={s.email}>{user?.email ?? '—'}</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{user?.role ?? 'user'}</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Cihaz Bilgisi</Text>
        <Row label="Cihaz ID" value="mobile-001" />
        <Row label="Sensörler" value="İvmeölçer, Jiroskop" />
        <Row label="Gönderim aralığı" value="1 saniye" />
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 20 },
  title: { color: '#E6EDF3', fontSize: 20, fontWeight: '700', marginBottom: 20 },

  card: {
    backgroundColor: '#161B22', borderRadius: 12, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: '#21262D', alignItems: 'center',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#238636', textAlign: 'center', lineHeight: 64,
    color: '#fff', fontSize: 28, fontWeight: '700', overflow: 'hidden',
    marginBottom: 10,
  },
  name: { color: '#E6EDF3', fontSize: 18, fontWeight: '700' },
  email: { color: '#8B949E', fontSize: 13, marginTop: 2 },
  badge: {
    marginTop: 8, backgroundColor: '#0F2A1A',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#238636',
  },
  badgeText: { color: '#56D364', fontSize: 12, fontWeight: '600' },

  sectionTitle: { color: '#8B949E', fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 6 },
  rowLabel: { color: '#8B949E', fontSize: 13 },
  rowValue: { color: '#E6EDF3', fontSize: 13 },

  logoutBtn: {
    backgroundColor: '#6E2C2C', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  logoutText: { color: '#FF7B72', fontWeight: '700', fontSize: 15 },
});
