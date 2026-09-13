import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInputProps,
  Alert,
  Platform,
} from 'react-native';

/**
 * Platform-aware destructive confirmation.
 * react-native-web's Alert.alert ignores the buttons array (plain window.alert),
 * so on web the Delete onPress would never fire. Use window.confirm there.
 */
export function confirmDestructive(
  title: string,
  message: string,
  onConfirm: () => void
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export function AppButton({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AppTextInput(
  props: TextInputProps & { label?: string }
) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#999"
        style={[styles.input, style]}
        autoCapitalize="none"
        {...rest}
      />
    </View>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

export function SuccessText({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={styles.success}>{message}</Text>;
}

export function LoadingView({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function ConfigWarning() {
  return (
    <View style={styles.warnBox}>
      <Text style={styles.warnTitle}>Firebase not configured</Text>
      <Text style={styles.warnText}>
        Fill in your Firebase web config in src/config/firebase.ts or .env
        (EXPO_PUBLIC_FIREBASE_*). See README-FIREBASE.md.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonPrimary: { backgroundColor: '#2563eb' },
  buttonSecondary: { backgroundColor: '#6b7280' },
  buttonDanger: { backgroundColor: '#dc2626' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  inputWrap: { marginVertical: 6 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 14,
  },
  success: {
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 14,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 10, color: '#6b7280' },
  warnBox: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  warnTitle: { fontWeight: '700', color: '#92400e', marginBottom: 4 },
  warnText: { color: '#92400e', fontSize: 13 },
});