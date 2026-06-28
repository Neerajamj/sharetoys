import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.heading}>Log in</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.btn} onPress={handleSubmit} disabled={busy}>
        <Text style={styles.btnText}>{busy ? 'Logging in…' : 'Log in'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.switchLink}>New here? Create an account</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: 'center' },
  heading: { fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd3b9', borderRadius: 8, padding: 12, marginBottom: 16,
    backgroundColor: '#fffdf8', fontSize: 15,
  },
  btn: { backgroundColor: colors.free, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  error: { color: colors.free, marginBottom: 10 },
  switchLink: { textAlign: 'center', marginTop: 18, color: colors.plum, fontWeight: '600' },
});
