import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/RootNavigator';
import { fetchProductById, deleteProduct, Product } from '../../services/productService';
import { AppButton, LoadingView, ErrorText, confirmDestructive } from '../../components/ui';
import { auth } from '../../config/firebase';

type Props = NativeStackScreenProps<AppStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchProductById(id);
        if (!p) setError('Product not found.');
        else setProduct(p);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    console.log('DELETE START id:', id);
    console.log('[AUTH] uid:', auth.currentUser?.uid);
    setDeleting(true);
    try {
      console.log('BEFORE DELETE id:', id);
      await deleteProduct(id);
      console.log('AFTER DELETE id:', id);
      navigation.goBack();
    } catch (e: any) {
      console.log('DELETE ERROR:', e?.code, e?.message);
      Alert.alert('Error', e?.code ? `${e.code}: ${e?.message}` : (e?.message ?? 'Failed to delete.'));
    } finally {
      setDeleting(false);
      console.log('DELETE END (deleting stopped)');
    }
  };

  const confirmDelete = () => {
    console.log('DELETE BUTTON PRESSED');
    console.log('DELETE BUTTON id:', id);
    confirmDestructive(
      'Delete Product',
      'Are you sure you want to delete this product?',
      handleDelete
    );
  };

  if (loading) return <LoadingView message="Loading detail..." />;

  return (
    <View style={styles.container}>
      <ErrorText message={error} />
      {product && (
        <>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>$ {product.price}</Text>
          <Text style={styles.desc}>{product.description || 'No description'}</Text>
          <Text style={styles.meta}>ID: {product.id}</Text>
          {product.createdAt?.toDate && (
            <Text style={styles.meta}>
              Created: {product.createdAt.toDate().toLocaleString()}
            </Text>
          )}
          {product.updatedAt?.toDate && (
            <Text style={styles.meta}>
              Updated: {product.updatedAt.toDate().toLocaleString()}
            </Text>
          )}

          <View style={{ marginTop: 20 }}>
            <AppButton
              title="Edit"
              onPress={() => navigation.navigate('ProductForm', { id })}
            />
            <AppButton title="Delete" variant="danger" onPress={confirmDelete} loading={deleting} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  price: { fontSize: 20, fontWeight: '700', color: '#2563eb', marginVertical: 8 },
  desc: { fontSize: 16, color: '#374151', marginVertical: 8 },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});