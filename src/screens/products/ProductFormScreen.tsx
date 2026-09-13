import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/RootNavigator';
import {
  createProduct,
  fetchProductById,
  updateProduct,
} from '../../services/productService';
import { validateProductForm } from '../../utils/validation';
import { AppButton, AppTextInput, ErrorText, SuccessText, LoadingView } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';

type Props = NativeStackScreenProps<AppStackParamList, 'ProductForm'>;

export default function ProductFormScreen({ route, navigation }: Props) {
  const { id } = route.params ?? {};
  const isEdit = !!id;
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceText, setPriceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const p = await fetchProductById(id);
        if (!p) {
          setError('Product not found.');
          return;
        }
        setName(p.name);
        setDescription(p.description ?? '');
        setPriceText(String(p.price));
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load product.');
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    console.log('SAVE START');
    console.log('UID:', auth.currentUser?.uid);
    console.log('Context UID:', user?.uid);
    setError(null);
    setSuccess(null);
    const v = validateProductForm(name, priceText);
    if (v) {
      setError(v);
      return;
    }
    if (!auth.currentUser?.uid) {
      setError('Not authenticated. Please login again.');
      return;
    }
    setLoading(true);
    try {
      const price = Number(priceText);
      if (isEdit && id) {
        console.log('BEFORE UPDATE id:', id);
        await updateProduct(id, { name, description, price });
        console.log('AFTER UPDATE');
        setSuccess('Product updated successfully.');
      } else {
        console.log('BEFORE CREATE');
        await createProduct({ name, description, price, ownerId: auth.currentUser.uid });
        console.log('AFTER CREATE');
        setSuccess('Product created successfully.');
        setName('');
        setDescription('');
        setPriceText('');
      }
      // Go back to list after short delay so user sees success message
      setTimeout(() => navigation.goBack(), 700);
    } catch (e: any) {
      // Surface the actual Firebase error (code + message), do not hide it.
      console.log('SAVE ERROR:', e?.code, e?.message);
      setError(e?.code ? `${e.code}: ${e?.message}` : (e?.message ?? 'Failed to save product.'));
    } finally {
      setLoading(false);
      console.log('SAVE END (loading stopped)');
    }
  };

  if (initialLoading) return <LoadingView message="Loading product..." />;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEdit ? 'Edit Product' : 'Add Product'}</Text>

      <AppTextInput label="Name *" placeholder="e.g. iPhone 15" value={name} onChangeText={setName} />
      <AppTextInput
        label="Description"
        placeholder="Short description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />
      <AppTextInput
        label="Price *"
        placeholder="e.g. 999"
        value={priceText}
        onChangeText={setPriceText}
        keyboardType="numeric"
      />

      <ErrorText message={error} />
      <SuccessText message={success} />

      <AppButton title={isEdit ? 'Update' : 'Save'} onPress={handleSave} loading={loading} />
      <AppButton title="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12, color: '#111827' },
});