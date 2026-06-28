import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { api, uploadImageToCloudinary } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors, CATEGORIES, CONDITIONS } from '../theme';

export default function AddToyScreen({ navigation }) {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [type, setType] = useState('free');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Log in to pin a toy</Text>
        <Pressable style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Log in</Text>
        </Pressable>
      </View>
    );
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0]);
  }

  async function handleSubmit() {
    setError('');
    if (!name.trim()) { setError('Give the toy a name.'); return; }
    if (type === 'sale' && (!price || Number(price) <= 0)) {
      setError('Add a price, or switch this listing to Free.');
      return;
    }
    setBusy(true);
    try {
      let imageUrl = '';
      if (image) imageUrl = await uploadImageToCloudinary(image);
      await api.addToy(
        { name, category, condition, type, price: type === 'sale' ? Number(price) : null, description, location, imageUrl },
        token
      );
      navigation.navigate('Home');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.heading}>📌 Pin a toy to the board</Text>

      <Text style={styles.label}>Toy name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Wooden train set" />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          {CATEGORIES.map((c) => <Picker.Item key={c} label={c} value={c} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Condition</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={condition} onValueChange={setCondition}>
          {CONDITIONS.map((c) => <Picker.Item key={c} label={c} value={c} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Give away or sell?</Text>
      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggleBtn, type === 'free' && styles.toggleActive]} onPress={() => setType('free')}>
          <Text style={[styles.toggleText, type === 'free' && styles.toggleTextActive]}>Free</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, type === 'sale' && styles.toggleActive]} onPress={() => setType('sale')}>
          <Text style={[styles.toggleText, type === 'sale' && styles.toggleTextActive]}>For sale</Text>
        </Pressable>
      </View>

      {type === 'sale' && (
        <>
          <Text style={styles.label}>Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" />
        </>
      )}

      <Text style={styles.label}>Photo (optional)</Text>
      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <Text style={{ color: colors.inkSoft }}>Tap to choose a photo</Text>
        )}
      </Pressable>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription}
        placeholder="Anything a new owner should know — age range, missing pieces, etc."
      />

      <Text style={styles.label}>Pickup area (optional)</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Badagara, Kerala" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.btn} onPress={handleSubmit} disabled={busy}>
        <Text style={styles.btnText}>{busy ? 'Pinning…' : '📌 Pin it to the board'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  center: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', padding: 20 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#ddd3b9', borderRadius: 8, padding: 12, backgroundColor: '#fffdf8', fontSize: 15 },
  pickerWrap: { borderWidth: 1.5, borderColor: '#ddd3b9', borderRadius: 8, backgroundColor: '#fffdf8' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, borderWidth: 1.5, borderColor: '#ddd3b9', borderRadius: 8, padding: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  toggleText: { color: colors.inkSoft, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  imagePicker: {
    height: 120, borderWidth: 1.5, borderColor: '#ddd3b9', borderRadius: 8, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  error: { color: colors.free, marginTop: 14 },
  btn: { backgroundColor: colors.free, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
