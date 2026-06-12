import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../services/AuthContext';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (isSignUp) {
      // Kayıt
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert('Hata', 'Tüm alanları doldurunuz');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Hata', 'Şifreler eşleşmiyor');
        return;
      }
      setLoading(true);
      try {
        await register(name.trim(), email.trim(), password);
      } catch (e) {
        Alert.alert('Kayıt başarısız', e.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Giriş
      if (!email || !password) {
        Alert.alert('Hata', 'E-posta ve şifre gerekli');
        return;
      }
      setLoading(true);
      try {
        await login(email.trim(), password);
      } catch (e) {
        Alert.alert('Giriş başarısız', e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.card}>
        <Text style={s.icon}>🛡️</Text>
        <Text style={s.title}>Güvenlik Platformu</Text>
        <Text style={s.sub}>Düşme & Hareketsizlik Tespiti</Text>

        {isSignUp && (
          <TextInput
            style={s.input}
            placeholder="Adınız"
            placeholderTextColor="#8B949E"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={s.input}
          placeholder="E-posta"
          placeholderTextColor="#8B949E"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={s.input}
          placeholder="Şifre"
          placeholderTextColor="#8B949E"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isSignUp && (
          <TextInput
            style={s.input}
            placeholder="Şifreyi Onayla"
            placeholderTextColor="#8B949E"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        )}

        <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>{isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setIsSignUp(!isSignUp);
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }}>
          <Text style={s.toggleText}>
            {isSignUp ? 'Zaten hesabın var mı? Giriş Yap' : "Hesabın yok mu? Kayıt Ol"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#161B22', borderRadius: 16, padding: 28, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { color: '#E6EDF3', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { color: '#8B949E', fontSize: 13, marginBottom: 28 },
  input: {
    width: '100%', backgroundColor: '#0D1117', color: '#E6EDF3',
    borderWidth: 1, borderColor: '#30363D', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, fontSize: 15,
  },
  btn: {
    width: '100%', backgroundColor: '#238636', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggleText: { color: '#58A6FF', fontSize: 13, textDecorationLine: 'underline' },
});
