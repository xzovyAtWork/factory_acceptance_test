// frontend/src/components/Forms/FormDetail.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFormsApi } from '../../api/formsApi';
import { useAuth } from '../../context/AuthContext';
import { useWikiApi } from '../../api/wikiApi';

function TestPointRow({ point, canEdit, onChangeStatus, onChangeComment, onOpenWiki }) {
  return (
    <tr>
      <td>
        {point.description}{' '}
        {point.wiki_page_id && (
          <button type="button" onClick={() => onOpenWiki(point.wiki_page_id)}>
            Wiki
          </button>
        )}
      </td>
      <td>
        {canEdit ? (
          <select
            value={point.status}
            onChange={(e) => onChangeStatus(point.id, e.target.value)}
          >
            <option value="incomplete">incomplete</option>
            <option value="pass">pass</option>
            <option value="fail">fail</option>
          </select>
        ) : (
          point.status
        )}
      </td>
      <td>
        {canEdit ? (
          <input
            value={point.comment || ''}
            onChange={(e) => onChangeComment(point.id, e.target.value)}
          />
        ) : (
          point.comment
        )}
      </td>
    </tr>
  );
}

export default function FormDetail() {
  const { id } = useParams();
  const { getForm, signOn, updateTestPoint, signOff, pdfUrl } = useFormsApi();
  const { listPages } = useWikiApi();
  const { user } = useAuth();

  const [form, setForm] = useState(null);
  const [sections, setSections] = useState([]);
  const [signedOn, setSignedOn] = useState(false);
  const [wikiPages, setWikiPages] = useState([]);

  const load = async () => {
    const data = await getForm(id);
    setForm(data.form);
    setSections(data.sections);
    setSignedOn(data.isSignedOn);
  };

  useEffect(() => {
    load();
    listPages().then(setWikiPages);
  }, [id]);

  if (!form) return <div>Loading...</div>;

  const canEdit = user.role === 'admin' || signedOn;

  const handleSignOn = async () => {
    await signOn(id);
    await load();
  };

  const handleStatusChange = async (pointId, status) => {
    await updateTestPoint(id, pointId, { status });
    await load();
  };

  const handleCommentChange = async (pointId, comment) => {
    await updateTestPoint(id, pointId, { comment });
    await load();
  };

  const handleSignOff = async () => {
    await signOff(id, { conditional: form.conditionally_signed_off });
    await load();
  };

  const handleOpenPdf = () => {
    window.open(pdfUrl(id), '_blank');
  };

  const handleOpenWiki = (wikiId) => {
    const page = wikiPages.find((p) => p.id === wikiId);
    if (page) {
      window.open(`/wiki/${page.slug}`, '_blank');
    }
  };

  return (
    <div>
      <h2>Inspection Form #{form.id}</h2>
      <p>
        Unit: {form.unit_number} | Job: {form.job_number} | Designation:{' '}
        {form.unit_designation}
      </p>
      <p>
        Test Type: {form.test_type} | Status: {form.status} | Conditional:{' '}
        {form.conditionally_signed_off ? 'Yes' : 'No'}
      </p>

      {!signedOn && user.role !== 'admin' && (
        <button onClick={handleSignOn}>Sign On</button>
      )}

      <h3>Sections</h3>
      {sections.map((section) => (
        <div key={section.id} className="section-block">
          <h4>{section.name}</h4>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Status</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {section.test_points.map((p) => (
                <TestPointRow
                  key={p.id}
                  point={p}
                  canEdit={canEdit && form.status !== 'completed'}
                  onChangeStatus={handleStatusChange}
                  onChangeComment={handleCommentChange}
                  onOpenWiki={handleOpenWiki}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div style={{ marginTop: '1rem' }}>
        {form.status !== 'completed' && canEdit && (
          <button onClick={handleSignOff}>Complete & Sign Off</button>
        )}
        {(user.role === 'admin' ||
          (signedOn && form.status === 'completed')) && (
          <button onClick={handleOpenPdf}>Download PDF</button>
        )}
      </div>
    </div>
  );
}