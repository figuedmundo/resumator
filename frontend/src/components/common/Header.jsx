import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, generateAvatarColor } from '../../utils/helpers';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/', current: location.pathname === '/' },
    { name: 'Resumes', href: '/resumes', current: location.pathname.startsWith('/resumes') },
    { name: 'Applications', href: '/applications', current: location.pathname.startsWith('/applications') },
  ];

  const userInitials = getInitials(user?.full_name || user?.email || 'User');
  const avatarColor = generateAvatarColor(user?.full_name || user?.email || 'User');

  return (
    <header className=\"bg-white shadow-sm border-b border-gray-200\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
        <div className=\"flex justify-between items-center h-16\">
          {/* Logo and Navigation */}
          <div className=\"flex items-center\">
            <Link to=\"/\" className=\"flex-shrink-0\">
              <div className=\"text-xl font-bold text-blue-600\">
                Resumator
              </div>
            </Link>
            
            {user && (
              <nav className=\"ml-8\">
                <div className=\"flex space-x-8\">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                        item.current
                          ? 'border-b-2 border-blue-500 text-gray-900'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            )}
          </div>

          {/* User Menu */}
          {user ? (
            <div className=\"relative\" ref={userMenuRef}>
              <div className=\"flex items-center\">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className=\"flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\"
                >
                  <span className=\"sr-only\">Open user menu</span>
                  <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                    {userInitials}
                  </div>
                  <span className=\"ml-2 text-gray-700 text-sm font-medium\">
                    {user.full_name || user.email}
                  </span>
                  <svg
                    className={`ml-1 h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill=\"none\"
                    stroke=\"currentColor\"
                    viewBox=\"0 0 24 24\"
                  >
                    <path
                      strokeLinecap=\"round\"
                      strokeLinejoin=\"round\"
                      strokeWidth={2}
                      d=\"M19 9l-7 7-7-7\"
                    />
                  </svg>
                </button>
              </div>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className=\"absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50\">
                  <div className=\"px-4 py-2 text-sm text-gray-900 border-b border-gray-100\">
                    <div className=\"font-medium\">{user.full_name || 'User'}</div>
                    <div className=\"text-gray-500 text-xs\">{user.email}</div>
                  </div>
                  
                  <Link
                    to=\"/profile\"
                    className=\"block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200\"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className=\"w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200\"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className=\"flex items-center space-x-4\">
              <Link
                to=\"/login\"
                className=\"text-gray-500 hover:text-gray-700 transition-colors duration-200\"
              >
                Sign in
              </Link>
              <Link
                to=\"/register\"
                className=\"bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200\"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
