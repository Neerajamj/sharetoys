import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet, RefreshControl,
} from 'react-native';
import { api } from '../api';
import { colors } from '../theme';
import ToyCard from '../components/ToyCard';

export default function HomeScreen({ navigation }) {
  const [toys, setToys] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchToys = useCallback(async () => {
    setError('');
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter);
      if (search) params.set('search', search);
      const data = await api.getToys(`?${params.toString()}`);
      setToys(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(fetchToys, 300);
    return () => clearTimeout(t);
  }, [fetchToys]);

  // Re-fetch whenever the screen regains focus (e.g. after pinning a toy)
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchToys);
    return unsub;
  }, [navigation, fetchToys]);

  function onRefresh() {
    setRefreshing(true);
    fetchToys();
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleCard}>
        <Text style={styles.title}>🧸 ShareToys</Text>
        <Text style={styles.tagline}>A noticeboard for toys that need a new kid.</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search toys… (e.g. lego, doll, bike)"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.pillRow}>
        {['all', 'free', 'sale'].map((f) => (
          <Pressable
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f === 'all' ? 'All' : f === 'free' ? 'Free' : 'For sale'}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={toys}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.empty}>
              {toys.length === 0 ? "The board's empty. Pin the first toy! 📌" : 'No toys match that search.'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ToyCard toy={item} onPress={() => navigation.navigate('ToyDetail', { id: item._id })} />
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddToy')}>
        <Text style={styles.fabText}>📌</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cork, padding: 16 },
  titleCard: {
    backgroundColor: colors.paper, borderRadius: 8, padding: 14, marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  tagline: { fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  search: {
    backgroundColor: colors.paper, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12, fontSize: 14,
  },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: {
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 6, backgroundColor: 'rgba(253,248,238,0.85)',
  },
  pillActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  pillText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  pillTextActive: { color: '#fff' },
  error: { backgroundColor: '#fdeceb', color: colors.free, padding: 10, borderRadius: 6, marginBottom: 10 },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 60, width: '100%' },
  fab: {
    position: 'absolute', right: 20, bottom: 24, backgroundColor: colors.free,
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 5,
  },
  fabText: { fontSize: 24 },
});
