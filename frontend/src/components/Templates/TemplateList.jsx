// frontend/src/components/Templates/TemplateList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTemplateApi } from '../../api/templateApi';
import { useAuth } from '../../context/AuthContext';

export default function TemplateList() {
  const { listTemplates } = useTemplateApi();
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    listTemplates().then(setTemplates);
  }, []);

  return (
    <div>
      <h2>Templates</h2>
      {user.role === 'admin' && (
        <Link to="/templates/new">
          <button>Create Template</button>
        </Link>
      )}
      <ul>
        {templates.map((t) => (
          <li key={t.id}>
            {t.name} ({t.unit_style}){' '}
            {user.role === 'admin' && (
              <Link to={`/templates/${t.id}/edit`}>Edit</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}