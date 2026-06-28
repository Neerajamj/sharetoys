import { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TextInput, Pressable, StyleSheet, Alert,
} from 'react-native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors, CATEGORY_EMOJI } from '../theme';

const STATUS_LABEL = { available: null, reserved: 'Reserved — pending delivery', taken: 'Taken' };

export default function ToyDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user, token } = useAuth();
  const [toy, setToy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    api.getToy(id).then(setToy).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && toy?.owner && user.id === toy.owner._id;

  async function handleDelete() {
    Alert.alert('Remove this listing?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await api.deleteToy(id, token);
            navigation.navigate('Home');
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  }

  async function handleToggleStatus() {
    setBusy(true);
    try {
      const next = toy.status === 'available' ? 'taken' : 'available';
      const updated = await api.updateToyStatus(id, next, token);
      setToy(updated);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePlaceOrder() {
    setOrderError('');
    if (!phone.trim() || !address.trim()) {
      setOrderError('Phone and delivery address are both needed.');
      return;
    }
    setBusy(true);
    try {
      const order = await api.createOrder({ toyId: toy._id, phone, address }, token);
      setToy(order.toy);
      setOrderPlaced(true);
      setShowOrderForm(false);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <View style={styles.center}><Text>Loading…</Text></View>;
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  if (!toy) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.photo}>
        {toy.imageUrl ? (
          <Image source={{ uri: toy.imageUrl }} style={styles.photoImg} />
        ) : (
          <Text style={{ fontSize: 64 }}>{CATEGORY_EMOJI[toy.category] || '🧸'}</Text>
        )}
        {STATUS_LABEL[toy.status] && (
          <View style={styles.statusBanner}><Text style={styles.statusBannerText}>{STATUS_LABEL[toy.status]}</Text></View>
        )}
      </View>

      <Text style={styles.name}>{toy.name}</Text>

      <View style={styles.tagRow}>
        <View style={styles.tag}><Text style={styles.tagText}>{toy.condition}</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>{toy.category}</Text></View>
        {toy.type === 'free' ? (
          <View style={[styles.tag, { backgroundColor: colors.free }]}><Text style={[styles.tagText, { color: '#fff' }]}>Free</Text></View>
        ) : (
          <View style={[styles.tag, { backgroundColor: colors.sale }]}><Text style={[styles.tagText, { color: '#3a2a06' }]}>${Number(toy.price).toFixed(2)}</Text></View>
        )}
      </View>

      {toy.description ? <Text style={styles.desc}>{toy.description}</Text> : null}
      {toy.location ? <Text style={styles.desc}>📍 Pickup area: {toy.location}</Text> : null}

      {orderPlaced && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            {toy.type === 'free' ? 'Claim sent!' : 'Order placed!'} The {toy.type === 'free' ? 'owner' : 'seller'} will confirm and arrange {toy.type === 'sale' ? 'cash-on-delivery' : 'pickup/delivery'}.
          </Text>
        </View>
      )}

      {!isOwner && toy.status === 'available' && user && (
        <View style={{ marginTop: 16 }}>
          {!showOrderForm ? (
            <Pressable style={styles.btn} onPress={() => setShowOrderForm(true)}>
              <Text style={styles.btnText}>
                {toy.type === 'sale' ? `🛒 Buy now — COD ($${Number(toy.price).toFixed(2)})` : '🙋 Claim this toy (Free)'}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.orderForm}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="e.g. 9876543210" />
              <Text style={styles.label}>Delivery address</Text>
              <TextInput style={[styles.input, { height: 70 }]} multiline value={address} onChangeText={setAddress} placeholder="House, street, city, pincode" />
              {toy.type === 'sale' && (
                <Text style={styles.hint}>Pay ${Number(toy.price).toFixed(2)} in cash when the toy is delivered.</Text>
              )}
              {orderError ? <Text style={styles.error}>{orderError}</Text> : null}
              <Pressable style={styles.btn} onPress={handlePlaceOrder} disabled={busy}>
                <Text style={styles.btnText}>{busy ? 'Placing…' : toy.type === 'sale' ? 'Confirm order (COD)' : 'Confirm claim'}</Text>
              </Pressable>
              <Pressable onPress={() => setShowOrderForm(false)}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {!isOwner && !user && toy.status === 'available' && (
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.hint}>Log in to buy or claim this toy.</Text>
        </Pressable>
      )}

      {!isOwner && toy.status === 'taken' && <Text style={styles.hint}>This toy has already been claimed.</Text>}

      {isOwner && (
        <View style={styles.ownerActions}>
          <Pressable style={[styles.btn, { backgroundColor: colors.teal }]} onPress={handleToggleStatus} disabled={busy}>
            <Text style={styles.btnText}>{toy.status === 'available' ? 'Mark as taken' : 'Mark as available again'}</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.cancelLink}>View requests for this toy</Text>
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Text style={[styles.cancelLink, { color: colors.free }]}>Remove this listing</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  photo: { backgroundColor: '#fff', borderRadius: 8, height: 220, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%' },
  statusBanner: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(44,36,26,0.85)', padding: 8 },
  statusBannerText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '800', color: colors.ink, marginTop: 16, marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  tag: { backgroundColor: '#eee5d2', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' },
  desc: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 8 },
  successBanner: { backgroundColor: colors.successBg, borderRadius: 8, padding: 12, marginTop: 10 },
  successText: { color: colors.success, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#ddd3b9', borderRadius: 8, padding: 12, backgroundColor: '#fffdf8', fontSize: 15 },
  orderForm: { backgroundColor: '#f6efdf', borderRadius: 8, padding: 14 },
  hint: { color: colors.inkSoft, marginTop: 14 },
  btn: { backgroundColor: colors.free, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelLink: { textAlign: 'center', marginTop: 12, color: colors.plum, fontWeight: '600' },
  ownerActions: { marginTop: 18, gap: 4 },
  error: { color: colors.free, marginTop: 8 },
});
