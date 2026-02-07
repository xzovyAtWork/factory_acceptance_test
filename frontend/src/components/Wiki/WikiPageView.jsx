// frontend/src/components/Wiki/WikiPageView.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWikiApi } from '../../api/wikiApi';

export default function WikiPageView() {
  const { slug } = useParams();
  const { getBySlug } = useWikiApi();
  const [page, setPage] = useState(null);

  useEffect(() => {
    getBySlug(slug).then(setPage);
  }, [slug]);

  if (!page) return <div>Loading...</div>;

  return (
    <div>
      <h2>{page.title}</h2>
      <div
        className="wiki-content"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}