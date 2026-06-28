import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

function StatusPill({ status }) {
  return <span className={`order-status ${status}`}>{status}</span>;
}

export default function Orders() {
  const { token } = useAuth();
  const [tab, setTab] = useState('mine'); // 'mine' = I'm buying, 'received' = people want my toys
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

  async function handleAction(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="title-card" style={{ maxWidth: 480 }}>
        <h1>📦 Orders</h1>
        <p>Track toys you've claimed or bought, and requests on your own listings.</p>
      </div>

      <div className="filter-pills" style={{ marginBottom: 20 }}>
        <button className="pill" aria-pressed={tab === 'mine'} onClick={() => setTab('mine')}>What I've ordered</button>
        <button className="pill" aria-pressed={tab === 'received'} onClick={() => setTab('received')}>Requests on my toys</button>
      </div>

      {error && <p className="error-banner">{error}</p>}
      {loading ? (
        <p className="empty-note">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="empty-note">{tab === 'mine' ? "You haven't ordered anything yet." : 'No one has requested your toys yet.'}</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-main">
                <Link to={`/toys/${order.toy?._id}`} className="order-toy-name">
                  {order.toy?.name || 'Toy removed'}
                </Link>
                <StatusPill status={order.status} />
              </div>
              <p className="desc">
                {order.amount != null ? `₹${order.amount.toFixed(2)} — Cash on Delivery` : 'Free pickup/delivery'}
              </p>
              <p className="desc">
                {tab === 'mine'
                  ? <>Seller: {order.seller?.name} — {order.seller?.email}</>
                  : <>Buyer: {order.buyer?.name} — {order.buyer?.email}</>}
              </p>
              <p className="desc">📞 {order.phone}</p>
              <p className="desc">📍 {order.address}</p>

              <div className="order-actions">
                {tab === 'received' && order.status === 'pending' && (
                  <>
                    <button className="link-btn" onClick={() => handleAction(order._id, 'confirmed')}>Confirm</button>
                    <button className="link-btn danger" onClick={() => handleAction(order._id, 'cancelled')}>Decline</button>
                  </>
                )}
                {tab === 'received' && order.status === 'confirmed' && (
                  <button className="link-btn" onClick={() => handleAction(order._id, 'completed')}>Mark delivered &amp; paid</button>
                )}
                {tab === 'mine' && order.status === 'pending' && (
                  <button className="link-btn danger" onClick={() => handleAction(order._id, 'cancelled')}>Cancel order</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
