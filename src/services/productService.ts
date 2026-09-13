import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  ownerId: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  ownerId?: string;
}

const COLLECTION = 'products';
const productsRef = () => collection(db, COLLECTION);

/** Require an authenticated user. Throws with a clear message (surfaced in UI). */
function requireUid(op: string): string {
  const uid = auth.currentUser?.uid;
  console.log('[AUTH] uid:', uid ?? 'null');
  console.log(`[products] op=${op} uid=${uid ?? 'null'}`);
  if (!uid) {
    throw new Error('Not authenticated. Please login again.');
  }
  return uid;
}

/** CREATE: add a new product owned by the current user. Returns the new doc id. */
export async function createProduct(input: ProductInput): Promise<string> {
  const uid = requireUid('create');
  const name = input.name.trim();
  const description = input.description.trim();
  if (!name) throw new Error('Product name is required.');
  if (typeof input.price !== 'number' || Number.isNaN(input.price) || input.price < 0) {
    throw new Error('Price must be a valid non-negative number.');
  }
  if (input.ownerId !== undefined && input.ownerId !== uid) {
    console.log(`[products] op=create uid=${uid} rejected ownerId=${input.ownerId}`);
    throw new Error('Cannot create a product for another user.');
  }
  console.log(`[products] op=create uid=${uid} ownerId=${uid}`);
  const ref = await addDoc(productsRef(), {
    name,
    description,
    price: input.price,
    ownerId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log(`[products] op=create done uid=${uid} productId=${ref.id}`);
  return ref.id;
}

/** READ: fetch only the current user's products (avoids composite index by sorting client-side). */
export async function fetchProducts(): Promise<Product[]> {
  const uid = requireUid('read-list');
  const q = query(productsRef(), where('ownerId', '==', uid));
  console.log(`[products] op=read-list uid=${uid}`);
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, 'id'>),
  }));
  console.log(`[products] op=read-list done uid=${uid} count=${items.length}`);
  // Sort newest first when createdAt exists; nulls last.
  items.sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0;
    const bt = b.createdAt?.toMillis?.() ?? 0;
    return bt - at;
  });
  return items;
}

/** READ ONE: fetch a single product by id, only if owned by current user. */
export async function fetchProductById(id: string): Promise<Product | null> {
  const uid = requireUid('read-one');
  console.log(`[products] op=read-one uid=${uid} productId=${id}`);
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  const data = { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
  if (data.ownerId !== uid) {
    console.log(`[products] op=read-one denied uid=${uid} productId=${id} ownerId=${data.ownerId}`);
    throw new Error('Missing or insufficient permissions.');
  }
  return data;
}

/** UPDATE: edit an existing product. Only the owner can update; ownerId is never changed. */
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<void> {
  const uid = requireUid('update');
  console.log(`[products] op=update uid=${uid} productId=${id}`);
  const existing = await getDoc(doc(db, COLLECTION, id));
  if (!existing.exists()) throw new Error('Product not found.');
  const ownerId = (existing.data() as Partial<Product>).ownerId;
  if (ownerId !== uid) {
    console.log(`[products] op=update denied uid=${uid} productId=${id} ownerId=${ownerId}`);
    throw new Error('Missing or insufficient permissions.');
  }
  if (input.ownerId !== undefined && input.ownerId !== uid) {
    throw new Error('Cannot transfer product ownership.');
  }
  const payload: Record<string, any> = { updatedAt: serverTimestamp() };
  if (input.name !== undefined) {
    if (!input.name.trim()) throw new Error('Product name is required.');
    payload.name = input.name.trim();
  }
  if (input.description !== undefined)
    payload.description = input.description.trim();
  if (input.price !== undefined) {
    if (typeof input.price !== 'number' || Number.isNaN(input.price) || input.price < 0) {
      throw new Error('Price must be a valid non-negative number.');
    }
    payload.price = input.price;
  }
  await updateDoc(doc(db, COLLECTION, id), payload);
  console.log(`[products] op=update done uid=${uid} productId=${id}`);
}

/** DELETE: remove a product document. Only the owner can delete. */
export async function deleteProduct(id: string): Promise<void> {
  console.log('DELETE START id:', id);
  if (!id) {
    console.log('DELETE ERROR: missing document id');
    throw new Error('Missing product id.');
  }
  // 3. deleteProduct() gets auth.currentUser.uid
  const uid = requireUid('delete');
  console.log(`[products] op=delete uid=${uid} productId=${id}`);
  // 4. Get the existing product before deleting
  const existing = await getDoc(doc(db, COLLECTION, id));
  if (!existing.exists()) {
    console.log(`[products] op=delete not-found uid=${uid} productId=${id}`);
    throw new Error('Product not found.');
  }
  // 5. Verify existing ownerId === current user's UID
  const ownerId = (existing.data() as Partial<Product>).ownerId;
  console.log(`[products] op=delete check uid=${uid} productId=${id} ownerId=${ownerId}`);
  if (!ownerId || ownerId !== uid) {
    console.log(`[products] op=delete denied uid=${uid} productId=${id} ownerId=${ownerId}`);
    throw new Error('Missing or insufficient permissions.');
  }
  // 6. Execute deleteDoc(doc(db, 'products', id))
  console.log('BEFORE DELETE id:', id);
  await deleteDoc(doc(db, COLLECTION, id));
  console.log('AFTER DELETE id:', id);
  console.log(`[products] op=delete done uid=${uid} productId=${id}`);
}
