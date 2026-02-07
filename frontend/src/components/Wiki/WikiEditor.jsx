// frontend/src/components/Wiki/WikiEditor.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWikiApi } from '../../api/wikiApi';

export default function WikiEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { listPages, createPage, updatePage } = useWikiApi();
  const [page, setPage] = useState({ title: '', slug: '', content: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNew) {
      // quick fetch by id via listPages + filter (or you can add getById API)
      listPages().then((pages) => {
        const found = pages.find((p) => p.id === Number(id));
        if (found) {
          setPage({
            title: found.title,
            slug: found.slug,
            content: found.content || ''
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) {
      await createPage(page);
    } else {
      await updatePage(id, page);
    }
    navigate('/wiki');
  };

  return (
    <div>
      <h2>{isNew ? 'Create Wiki Page' : 'Edit Wiki Page'}</h2>
      <form onSubmit={handleSubmit} className="wiki-form">
        <label>
          Title
          <input
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
          />
        </label>
        <label>
          Slug
          <input
            value={page.slug}
            onChange={(e) => setPage({ ...page, slug: e.target.value })}
          />
        </label>
        <label>
          Content (HTML or rich text)
          <textarea
            rows={10}
            value={page.content}
            onChange={(e) => setPage({ ...page, content: e.target.value })}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}