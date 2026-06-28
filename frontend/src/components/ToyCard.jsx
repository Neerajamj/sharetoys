import { Link } from 'react-router-dom';
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

function timeAgo(dateString) {
  const s = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24); return `${d} day${d === 1 ? '' : 's'} ago`;
}

export default function ToyCard({ toy, onDelete }) {
  const { user } = useAuth();
  const isOwner = user && toy.owner && user.id === toy.owner._id;

  return (
    <article className="card">
      <div className="pin" aria-hidden="true" />
      <div className="tape" aria-hidden="true" />
      {isOwner && (
        <button className="remove-btn" aria-label={`Remove ${toy.name}`} onClick={() => onDelete(toy._id)}>
          ✕
        </button>
      )}
      <Link to={`/toys/${toy._id}`} className="card-link">
        <div className="photo">
          {toy.imageUrl ? (
            <img src={toy.imageUrl} alt={toy.name} />
          ) : (
            <span>{CATEGORY_EMOJI[toy.category] || '🧸'}</span>
          )}
          {toy.status === 'taken' && <span className="taken-banner">Taken</span>}
        </div>
        <h3 className="toy-name">{toy.name}</h3>
        <div className="tag-row">
          <span className="tag cond">{toy.condition}</span>
          {toy.type === 'free' ? (
            <span className="tag free">Free</span>
          ) : (
            <span className="tag sale">₹{Number(toy.price).toFixed(2)}</span>
          )}
        </div>
        {toy.description && <p className="desc">{toy.description}</p>}
      </Link>
      <p className="posted">Pinned {timeAgo(toy.createdAt)}</p>
    </article>
  );
}
