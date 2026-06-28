import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import ToyCard from '../components/ToyCard.jsx';

export default function Home() {
  const { token } = useAuth();
  const [toys, setToys] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchToys = useCallback(async () => {
    setLoading(true);
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
    }
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(fetchToys, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [fetchToys]);

  async function handleDelete(id) {
    if (!confirm('Remove this listing from the board?')) return;
    try {
      await api.deleteToy(id, token);
      setToys((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="title-card">
        <h1>🧸 ShareToys</h1>
        <p>A noticeboard for toys that need a new kid. Pin one to give away or sell </p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search toys… (e.g. lego, doll, bike)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {['all', 'free', 'sale'].map((f) => (
            <button
              key={f}
              className="pill"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'free' ? 'Free' : 'For sale'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="corkboard">
        {loading ? (
          <p className="empty-note">Loading the board…</p>
        ) : toys.length === 0 ? (
          <p className="empty-note">The board's empty. Pin the first toy! 📌</p>
        ) : (
          toys.map((toy) => <ToyCard key={toy._id} toy={toy} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  );
}
