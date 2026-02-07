// frontend/src/components/Forms/FormList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormsApi } from '../../api/formsApi';

export default function FormList() {
  const { listForms } = useFormsApi();
  const [forms, setForms] = useState([]);

  useEffect(() => {
    listForms().then(setForms);
  }, []);

  return (
    <div>
      <h2>Inspection Forms</h2>
      <ul>
        {forms.map((f) => (
          <li key={f.id}>
            <Link to={`/forms/${f.id}`}>
              {f.unit_number} / {f.job_number} ({f.test_type}) - {f.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}