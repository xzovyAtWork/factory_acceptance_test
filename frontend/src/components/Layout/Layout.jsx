import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>HVAC Inspection System</div>
        <div>
          <span>{user?.role}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="app-body">
        <nav className="app-sidebar">
          <ul>
            <li><Link to="/forms">Inspection Forms</Link></li>
            <li><Link to="/templates">Templates</Link></li>
            <li><Link to="/wiki">Wiki</Link></li>
          </ul>
        </nav>
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}