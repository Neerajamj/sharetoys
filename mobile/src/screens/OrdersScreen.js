import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const STATUS_COLORS = {
  pending: { bg: '#f0e0b0', fg: '#6b4d0a' },
  confirmed: { bg: '#cfe3df', fg: '#1f5a52' },
  completed: { bg: '#c7e6c9', fg: '#235c2a' },
  cancelled: { bg: '#f2d3cf', fg: '#8a2e22' },
};

export default function OrdersScreen({ navigation }) {
  const { token } = useAuth();
  const [tab, setTab] = useState('mine');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = tab === 'mine' ? await api.getMyOrders(token) : await api.getReceivedOrders(token);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  async function handleAction(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status, token);
      load();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.pillRow}>
        <Pressable style={[styles.pill, tab === 'mine' && styles.pillActive]} onPress={() => setTab('mine')}>
          <Text style={[styles.pillText, tab === 'mine' && styles.pillTextActive]}>What I've ordered</Text>
        </Pressable>
        <Pressable style={[styles.pill, tab === 'received' && styles.pillActive]} onPress={() => setTab('received')}>
          <Text style={[styles.pillText, tab === 'received' && styles.pillTextActive]}>Requests on my toys</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.empty}>
              {tab === 'mine' ? "You haven't ordered anything yet." : 'No one has requested your toys yet.'}
            </Text>
          )
        }
        renderItem={({ item: order }) => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
          return (
            <Pressable
              style={styles.card}
              onPress={() => order.toy?._id && navigation.navigate('ToyDetail', { id: order.toy._id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.toyName}>{order.toy?.name || 'Toy removed'}</Text>
                <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.fg }]}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.desc}>{order.amount != null ? `$${order.amount.toFixed(2)} — Cash on Delivery` : 'Free pickup/delivery'}</Text>
              <Text style={styles.desc}>
                {tab === 'mine' ? `Seller: ${order.seller?.name} — ${order.seller?.email}` : `Buyer: ${order.buyer?.name} — ${order.buyer?.email}`}
              </Text>
              <Text style={styles.desc}>📞 {order.phone}</Text>
              <Text style={styles.desc}>📍 {order.address}</Text>

              <View style={styles.actions}>
                {tab === 'received' && order.status === 'pending' && (
                  <>
                    <Pressable onPress={() => handleAction(order._id, 'confirmed')}><Text style={styles.actionLink}>Confirm</Text></Pressable>
                    <Pressable onPress={() => handleAction(order._id, 'cancelled')}><Text style={[styles.actionLink, { color: colors.free }]}>Decline</Text></Pressable>
                  </>
                )}
                {tab === 'received' && order.status === 'confirmed' && (
                  <Pressable onPress={() => handleAction(order._id, 'completed')}><Text style={styles.actionLink}>Mark delivered & paid</Text></Pressable>
                )}
                {tab === 'mine' && order.status === 'pending' && (
                  <Pressable onPress={() => handleAction(order._id, 'cancelled')}><Text style={[styles.actionLink, { color: colors.free }]}>Cancel order</Text></Pressable>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cork },
  pillRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0 },
  pill: { flex: 1, borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 16, paddingVertical: 8, backgroundColor: 'rgba(253,248,238,0.85)', alignItems: 'center' },
  pillActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  pillText: { color: colors.ink, fontWeight: '600', fontSize: 12 },
  pillTextActive: { color: '#fff' },
  error: { backgroundColor: '#fdeceb', color: colors.free, padding: 10, borderRadius: 6, margin: 16, marginBottom: 0 },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 50 },
  card: { backgroundColor: colors.paper, borderRadius: 8, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  toyName: { fontSize: 16, fontWeight: '700', color: colors.ink },
  statusPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  desc: { fontSize: 13, color: colors.inkSoft, marginBottom: 2 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  actionLink: { color: colors.teal, fontWeight: '700', fontSize: 13 },
});
