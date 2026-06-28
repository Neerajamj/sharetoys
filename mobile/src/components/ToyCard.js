import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { colors, CATEGORY_EMOJI } from '../theme';

function timeAgo(dateString) {
  const s = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24); return `${d} day${d === 1 ? '' : 's'} ago`;
}

export default function ToyCard({ toy, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photo}>
        {toy.imageUrl ? (
          <Image source={{ uri: toy.imageUrl }} style={styles.photoImg} />
        ) : (
          <Text style={styles.emoji}>{CATEGORY_EMOJI[toy.category] || '🧸'}</Text>
        )}
        {toy.status !== 'available' && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{toy.status === 'taken' ? 'Taken' : 'Reserved'}</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{toy.name}</Text>
      <View style={styles.tagRow}>
        <View style={styles.condTag}><Text style={styles.condTagText}>{toy.condition}</Text></View>
        {toy.type === 'free' ? (
          <View style={[styles.priceTag, { backgroundColor: colors.free }]}>
            <Text style={styles.priceTagText}>Free</Text>
          </View>
        ) : (
          <View style={[styles.priceTag, { backgroundColor: colors.sale }]}>
            <Text style={[styles.priceTagText, { color: '#3a2a06' }]}>${Number(toy.price).toFixed(2)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.posted}>Pinned {timeAgo(toy.createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    padding: 12,
    width: '47%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  photo: {
    backgroundColor: '#fff',
    borderRadius: 6,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  emoji: { fontSize: 38 },
  banner: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(44,36,26,0.85)', paddingVertical: 3,
  },
  bannerText: { color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  condTag: { backgroundColor: '#eee5d2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  condTagText: { fontSize: 10, color: colors.inkSoft, fontWeight: '600' },
  priceTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  priceTagText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  posted: { fontSize: 11, color: '#9c8f76' },
});
