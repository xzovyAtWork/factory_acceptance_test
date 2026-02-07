import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './components/Auth/LoginPage';
import TemplateList from './components/Templates/TemplateList';
import TemplateBuilder from './components/Templates/TemplateBuilder';
import FormList from './components/Forms/FormList';
import FormDetail from './components/Forms/FormDetail';
import WikiList from './components/Wiki/WikiList';
import WikiPageView from './components/Wiki/WikiPageView';
import WikiEditor from './components/Wiki/WikiEditor';
import Layout from './components/Layout/Layout';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <div>Access denied</div>;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/forms" replace />} />

                <Route path="/templates" element={<TemplateList />} />
                <Route
                  path="/templates/new"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <TemplateBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <TemplateBuilder />
                    </ProtectedRoute>
                  }
                />

                <Route path="/forms" element={<FormList />} />
                <Route path="/forms/:id" element={<FormDetail />} />

                <Route path="/wiki" element={<WikiList />} />
                <Route path="/wiki/:slug" element={<WikiPageView />} />
                <Route
                  path="/wiki/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <WikiEditor />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}