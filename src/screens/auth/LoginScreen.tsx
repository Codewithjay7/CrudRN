import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { loginUser } from '../../services/authService';
import { validateAuthForm, friendlyAuthError } from '../../utils/validation';
import { AppButton, AppTextInput, ErrorText, ConfigWarning } from '../../components/ui';
import { isFirebaseConfigured } from '../../config/firebase';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const validationError = validateAuthForm(email, password);
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
      await loginUser(email, password);
      // onAuthStateChanged in AuthContext will switch to app stack automatically
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {!isFirebaseConfigured() && <ConfigWarning />}

        <AppTextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppTextInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <ErrorText message={error} />

        <AppButton title="Login" onPress={handleLogin} loading={loading} />

        <View style={styles.row}>
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Create account
          </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot password?
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 16, marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  link: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
});