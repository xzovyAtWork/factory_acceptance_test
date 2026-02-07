// frontend/src/components/Templates/TemplateBuilder.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTemplateApi } from '../../api/templateApi';

const TEST_TYPES = ['bypass', 'full_water'];
const DESIGNATIONS = ['L', 'R', 'T', 'B', 'A','B','C','D','E','F','G','H','I','J','K','L2','M','N','O','P','Q','R2','S','T2','U','V','W','X','Y','Z'];

export default function TemplateBuilder() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { getTemplate, createTemplate, updateTemplate } = useTemplateApi();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [unitStyle, setUnitStyle] = useState('');
  const [supportedTestTypes, setSupportedTestTypes] = useState([]);
  const [allowedDesignations, setAllowedDesignations] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (isEdit) {
      getTemplate(id).then((tpl) => {
        setName(tpl.name);
        setUnitStyle(tpl.unit_style);
        setSupportedTestTypes(tpl.supported_test_types || []);
        setAllowedDesignations(tpl.allowed_designations || []);
        setSections(
          (tpl.sections || []).map((s) => ({
            name: s.name,
            sort_order: s.sort_order,
            test_points: (s.test_points || []).map((tp) => ({
              description: tp.description,
              test_type: tp.test_type,
              wiki_page_id: tp.wiki_page_id,
              sort_order: tp.sort_order
            }))
          }))
        );
      });
    } else {
      setSections([
        { name: 'Evaporator Section', sort_order: 1, test_points: [] }
      ]);
    }
  }, [id]);

  const toggleArrayValue = (arr, value) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const handleAddSection = () => {
    setSections([
      ...sections,
      { name: 'New Section', sort_order: sections.length + 1, test_points: [] }
    ]);
  };

  const handleAddTestPoint = (sectionIndex) => {
    const next = [...sections];
    next[sectionIndex].test_points.push({
      description: '',
      test_type: 'bypass',
      sort_order: next[sectionIndex].test_points.length + 1
    });
    setSections(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      unit_style: unitStyle,
      supported_test_types: supportedTestTypes,
      allowed_designations: allowedDesignations,
      sections
    };

    if (isEdit) {
      await updateTemplate(id, payload);
    } else {
      await createTemplate(payload);
    }
    navigate('/templates');
  };

  return (
    <div>
      <h2>{isEdit ? 'Edit Template' : 'Create Template'}</h2>
      <form onSubmit={handleSubmit} className="template-form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Unit Style
          <input
            value={unitStyle}
            onChange={(e) => setUnitStyle(e.target.value)}
          />
        </label>

        <fieldset>
          <legend>Supported Test Types</legend>
          {TEST_TYPES.map((tt) => (
            <label key={tt}>
              <input
                type="checkbox"
                checked={supportedTestTypes.includes(tt)}
                onChange={() =>
                  setSupportedTestTypes((prev) => toggleArrayValue(prev, tt))
                }
              />
              {tt}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Allowed Designations</legend>
          {DESIGNATIONS.map((d) => (
            <label key={d}>
              <input
                type="checkbox"
                checked={allowedDesignations.includes(d)}
                onChange={() =>
                  setAllowedDesignations((prev) => toggleArrayValue(prev, d))
                }
              />
              {d}
            </label>
          ))}
        </fieldset>

        <h3>Sections</h3>
        {sections.map((section, i) => (
          <div key={i} className="section-block">
            <input
              value={section.name}
              onChange={(e) => {
                const next = [...sections];
                next[i].name = e.target.value;
                setSections(next);
              }}
              placeholder="Section name"
            />
            <button type="button" onClick={() => handleAddTestPoint(i)}>
              Add Test Point
            </button>
            <ul>
              {section.test_points.map((tp, j) => (
                <li key={j}>
                  <input
                    value={tp.description}
                    onChange={(e) => {
                      const next = [...sections];
                      next[i].test_points[j].description = e.target.value;
                      setSections(next);
                    }}
                    placeholder="Description"
                  />
                  <select
                    value={tp.test_type}
                    onChange={(e) => {
                      const next = [...sections];
                      next[i].test_points[j].test_type = e.target.value;
                      setSections(next);
                    }}
                  >
                    {TEST_TYPES.map((tt) => (
                      <option key={tt} value={tt}>
                        {tt}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button type="button" onClick={handleAddSection}>
          Add Section
        </button>

        <button type="submit">Save Template</button>
      </form>
    </div>
  );
}