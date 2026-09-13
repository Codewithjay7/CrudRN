import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { registerUser } from '../../services/authService';
import { validateAuthForm, friendlyAuthError } from '../../utils/validation';
import { AppButton, AppTextInput, ErrorText, ConfigWarning } from '../../components/ui';
import { isFirebaseConfigured } from '../../config/firebase';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    const validationError = validateAuthForm(email, password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. See README-FIREBASE.md.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(email, password);
    } catch (e: any) {
      setError(friendlyAuthError(e?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Register with email & password</Text>

        {!isFirebaseConfigured() && <ConfigWarning />}

        <AppTextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <AppTextInput
          label="Password (min 6 chars)"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppTextInput
          label="Confirm password"
          placeholder="••••••••"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <ErrorText message={error} />

        <AppButton title="Register" onPress={handleRegister} loading={loading} />
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Already have an account? Login
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 16, marginTop: 4 },
  link: { color: '#2563eb', fontWeight: '600', fontSize: 14, marginTop: 12, textAlign: 'center' },
});