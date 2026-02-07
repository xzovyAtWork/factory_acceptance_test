// frontend/src/components/Wiki/WikiList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWikiApi } from '../../api/wikiApi';
import { useAuth } from '../../context/AuthContext';

export default function WikiList() {
  const { listPages } = useWikiApi();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    listPages().then(setPages);
  }, []);

  return (
    <div>
      <h2>Wiki</h2>
      {user.role === 'admin' && (
        <Link to="/wiki/new/edit">
          <button>Create Page</button>
        </Link>
      )}
      <ul>
        {pages.map((p) => (
          <li key={p.id}>
            <Link to={`/wiki/${p.slug}`}>{p.title}</Link>
            {user.role === 'admin' && (
              <Link to={`/wiki/${p.id}/edit`} style={{ marginLeft: '0.5rem' }}>
                Edit
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}