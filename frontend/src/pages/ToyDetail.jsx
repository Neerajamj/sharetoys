import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORY_EMOJI = {
  'Stuffed animal': '🧸',
  'Building blocks': '🧱',
  'Action figure / robot': '🤖',
  Doll: '🪆',
  'Vehicle / ride-on': '🚗',
  'Puzzle / board game': '🧩',
  'Outdoor toy': '🪁',
  Other: '🎲',
};

const STATUS_LABEL = {
  available: null,
  reserved: 'Reserved — pending delivery',
  taken: 'Taken',
};

export default function ToyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    api.getToy(id)
      .then(setToy)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Remove this listing from the board?')) return;
    try {
      await api.deleteToy(id, token);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleToggleStatus() {
    setBusy(true);
    try {
      const next = toy.status === 'available' ? 'taken' : 'available';
      const updated = await api.updateToyStatus(id, next, token);
      setToy(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
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

  if (loading) return <p className="empty-note">Loading…</p>;
  if (error) return <p className="error-banner">{error}</p>;
  if (!toy) return null;

  const isOwner = user && toy.owner && user.id === toy.owner._id;

  return (
    <div className="detail-card">
      <Link to="/" className="back-link">← Back to the board</Link>

      <div className="detail-photo">
        {toy.imageUrl ? (
          <img src={toy.imageUrl} alt={toy.name} />
        ) : (
          <span>{CATEGORY_EMOJI[toy.category] || '🧸'}</span>
        )}
        {STATUS_LABEL[toy.status] && <span className="taken-banner large">{STATUS_LABEL[toy.status]}</span>}
      </div>

      <h1 className="detail-name">{toy.name}</h1>

      <div className="tag-row">
        <span className="tag cond">{toy.condition}</span>
        <span className="tag cond">{toy.category}</span>
        {toy.type === 'free' ? (
          <span className="tag free">Free</span>
        ) : (
          <span className="tag sale">₹{Number(toy.price).toFixed(2)}</span>
        )}
      </div>

      {toy.description && <p className="detail-desc">{toy.description}</p>}
      {toy.location && <p className="detail-desc">📍 Pickup area: {toy.location}</p>}

      {orderPlaced && (
        <p className="success-banner">
          {toy.type === 'free' ? 'Claim sent!' : 'Order placed!'} The {toy.type === 'free' ? 'owner' : 'seller'} will confirm and arrange {toy.type === 'sale' ? 'cash-on-delivery' : 'pickup/delivery'}.
        </p>
      )}

      {!isOwner && toy.status === 'available' && user && (
        <div className="order-box">
          {!showOrderForm ? (
            <button className="submit-btn" onClick={() => setShowOrderForm(true)}>
              {toy.type === 'sale' ? `🛒 Buy now — Cash on Delivery (₹${Number(toy.price).toFixed(2)})` : '🙋 Claim this toy (Free)'}
            </button>
          ) : (
            <form onSubmit={handlePlaceOrder} className="order-form">
              <h3>{toy.type === 'sale' ? 'Cash on Delivery details' : 'Delivery / pickup details'}</h3>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" required />
              </div>
              <div className="field">
                <label htmlFor="address">Delivery address</label>
                <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, street, city, pincode" required />
              </div>
              {toy.type === 'sale' && (
                <p className="form-msg" style={{ color: 'var(--ink-soft)' }}>
                  Pay ₹{Number(toy.price).toFixed(2)} in cash when the toy is delivered.
                </p>
              )}
              {orderError && <p className="form-msg">{orderError}</p>}
              <button className="submit-btn" disabled={busy}>
                {busy ? 'Placing…' : toy.type === 'sale' ? 'Confirm order (COD)' : 'Confirm claim'}
              </button>
              <button type="button" className="link-btn" onClick={() => setShowOrderForm(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}

      {!isOwner && !user && toy.status === 'available' && (
        <p className="form-msg" style={{ color: 'var(--ink-soft)' }}>
          <Link to="/login">Log in</Link> to buy or claim this toy.
        </p>
      )}

      {!isOwner && toy.status === 'taken' && (
        <p className="form-msg" style={{ color: 'var(--ink-soft)' }}>This toy has already been claimed.</p>
      )}

      {isOwner && (
        <p className="form-msg" style={{ color: 'var(--ink-soft)' }}>
          This is your listing — check <Link to="/orders">My Orders</Link> for requests.
        </p>
      )}

      {isOwner && (
        <div className="owner-actions">
          <button className="submit-btn secondary" disabled={busy} onClick={handleToggleStatus}>
            {busy ? 'Updating…' : toy.status === 'available' ? 'Mark as taken' : 'Mark as available again'}
          </button>
          <Link to="/orders" className="link-btn">View requests for this toy</Link>
          <button className="link-btn danger" onClick={handleDelete}>Remove this listing</button>
        </div>
      )}
    </div>
  );
}
