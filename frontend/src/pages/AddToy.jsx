import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, uploadImageToCloudinary } from '../api';

const CATEGORIES = [
  'Stuffed animal', 'Building blocks', 'Action figure / robot', 'Doll',
  'Vehicle / ride-on', 'Puzzle / board game', 'Outdoor toy', 'Other',
];
const CONDITIONS = ['Like new', 'Gently used', 'Well loved', 'Needs minor repair'];

export default function AddToy() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [type, setType] = useState('free');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="auth-card">
        <h2>Log in to pin a toy</h2>
        <p>You need an account so people know who's offering the toy.</p>
        <Link className="submit-btn" to="/login" style={{ display: 'inline-block', textAlign: 'center' }}>Log in</Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (type === 'sale' && (!price || Number(price) <= 0)) {
      setError('Add a price, or switch this listing to Free.');
      return;
    }
    setBusy(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      await api.addToy(
        { name, category, condition, type, price: type === 'sale' ? Number(price) : null, description, location, imageUrl },
        token
      );
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-static">
      <h2>📌 Pin a toy to the board</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Toy name</label>
          <input id="name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wooden train set" />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="condition">Condition</label>
          <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Give away or sell?</label>
          <div className="type-toggle">
            <label className={type === 'free' ? 'active' : ''}>
              <input type="radio" name="type" checked={type === 'free'} onChange={() => setType('free')} /> Free
            </label>
            <label className={type === 'sale' ? 'active' : ''}>
              <input type="radio" name="type" checked={type === 'sale'} onChange={() => setType('sale')} /> For sale
            </label>
          </div>
        </div>

        {type === 'sale' && (
          <div className="field">
            <label htmlFor="price">Price (₹)</label>
            <input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </div>
        )}

        <div className="field">
          <label htmlFor="photo">Photo (optional)</label>
          <input id="photo" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" maxLength={400} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Anything a new owner should know — age range, missing pieces, etc." />
        </div>

        <div className="field">
          <label htmlFor="location">Pickup area (optional)</label>
          <input id="location" maxLength={100} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Badagara, Kerala" />
        </div>

        {error && <p className="form-msg">{error}</p>}
        <button className="submit-btn" disabled={busy}>{busy ? 'Pinning…' : '📌 Pin it to the board'}</button>
      </form>
    </div>
  );
}
