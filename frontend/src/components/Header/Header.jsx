import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, generateAvatarColor } from '@/utils/helpers';
import styles from './Header.module.css';

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
    { name: 'Cover Letters', href: '/cover-letters', current: location.pathname.startsWith('/cover-letters') },
    { name: 'Applications', href: '/applications', current: location.pathname.startsWith('/applications') },
  ];

  const userInitials = getInitials(user?.full_name || user?.email || 'User');
  const avatarColor = generateAvatarColor(user?.full_name || user?.email || 'User');

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerInner}>
          {/* Logo and Navigation */}
          <div className={styles.leftSection}>
            <Link to="/" className={styles.logo}>
              <div className={styles.logoLink}>
                Resumator
              </div>
            </Link>
            
            {user && (
              <nav className={styles.nav}>
                <div className={styles.navList}>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        styles.navItem,
                        item.current ? styles.navItemActive : styles.navItemDefault
                      )}
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
            <div className={styles.userMenuContainer} ref={userMenuRef}>
              <div className={styles.userMenuInner}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={styles.userMenuButton}
                >
                  <span className={styles.srOnly}>Open user menu</span>
                  <div className={clsx(styles.avatar, avatarColor)}>
                    {userInitials}
                  </div>
                  <span className={styles.userName}>
                    {user.full_name || user.email}
                  </span>
                  <svg
                    className={clsx(
                      styles.chevron,
                      isUserMenuOpen && styles.chevronOpen
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownUserName}>{user.full_name || 'User'}</div>
                    <div className={styles.dropdownUserEmail}>{user.email}</div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className={styles.dropdownButton}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.guestActions}>
              <Link
                to="/login"
                className={styles.signInLink}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className={styles.getStartedLink}
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
