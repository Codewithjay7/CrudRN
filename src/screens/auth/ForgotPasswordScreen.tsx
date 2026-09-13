import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { resetPassword } from '../../services/authService';
import { isValidEmail, friendlyAuthError } from '../../utils/validation';
import { AppButton, AppTextInput, ErrorText, SuccessText } from '../../components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleReset = async () => {
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(`Password reset email sent to ${email.trim()}. Check your inbox.`);
    } catch (e: any) {
      setError(friendlyAuthError(e?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Forgot password?</Text>
      <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>

      <AppTextInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <ErrorText message={error} />
      <SuccessText message={success} />

      <AppButton title="Send reset email" onPress={handleReset} loading={loading} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Back to Login
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center', backgroundColor: '#f9fafb' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 16, marginTop: 4 },
  link: { color: '#2563eb', fontWeight: '600', fontSize: 14, marginTop: 12, textAlign: 'center' },
});