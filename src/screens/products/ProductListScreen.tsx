import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/RootNavigator';
import { fetchProducts, deleteProduct, Product } from '../../services/productService';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import { AppButton, LoadingView, ErrorText, confirmDestructive } from '../../components/ui';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<AppStackParamList, 'ProductList'>;

export default function ProductListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const confirmDelete = (id: string, name: string) => {
    confirmDestructive(
      'Delete product',
      `Delete "${name}"? This cannot be undone.`,
      async () => {
        console.log('DELETE START id:', id);
        console.log('[AUTH] uid:', auth.currentUser?.uid);
        try {
          console.log('BEFORE DELETE id:', id);
          await deleteProduct(id);
          console.log('AFTER DELETE id:', id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (e: any) {
          console.log('DELETE ERROR:', e?.code, e?.message);
          Alert.alert(
            'Error',
            e?.code ? `${e.code}: ${e?.message}` : (e?.message ?? 'Failed to delete.')
          );
        } finally {
          console.log('DELETE END (list)');
        }
      }
    );
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e: any) {
      Alert.alert('Logout failed', e?.message ?? 'Try again.');
    }
  };

  if (loading) return <LoadingView message="Loading products..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ErrorText message={error} />

      <AppButton title="+ Add Product" onPress={() => navigation.navigate('ProductForm', {})} />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No products yet. Tap “+ Add Product”.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text numberOfLines={2} style={styles.cardDesc}>
                {item.description || 'No description'}
              </Text>
              <Text style={styles.price}>₹ {item.price} / $ {item.price}</Text>
            </TouchableOpacity>
            <View style={styles.cardActions}>
              <Text
                style={styles.edit}
                onPress={() => navigation.navigate('ProductForm', { id: item.id })}
              >
                Edit
              </Text>
              <Text style={styles.delete} onPress={() => confirmDelete(item.id, item.name)}>
                Delete
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  email: { fontSize: 13, color: '#6b7280' },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#dc2626', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  cardDesc: { fontSize: 14, color: '#6b7280', marginVertical: 4 },
  price: { fontSize: 15, fontWeight: '700', color: '#2563eb' },
  cardActions: { justifyContent: 'center', alignItems: 'flex-end', gap: 10, marginLeft: 10 },
  edit: { color: '#2563eb', fontWeight: '700' },
  delete: { color: '#dc2626', fontWeight: '700' },
});