import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../../utils/helpers';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login, isAuthenticated, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated - only run when auth state is determined
  useEffect(() => {
    console.log("LoginPage redirect effect, isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData);

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
    // If login fails, the error will be automatically displayed via the error state
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>R</div>
          </div>
          <h2 className={styles.title}>
            Sign in to your account
          </h2>
          <p className={styles.subtitle}>
            Or{' '}
            <Link
              to="/register"
              className={styles.signupLink}
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            {/* Email Field */}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email address
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={clsx(
                    styles.input,
                    errors.email ? styles.inputError : styles.inputDefault
                  )}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className={styles.fieldError}>{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={clsx(
                    styles.input,
                    styles.inputWithIcon,
                    errors.password ? styles.inputError : styles.inputDefault
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className={styles.passwordIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className={styles.passwordIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className={styles.fieldError}>{errors.password}</p>
              )}
            </div>
          </div>

          {/* Auth Error - Show server-side errors */}
          {error && (
            <div className={styles.authError}>
              <div className={styles.authErrorContent}>
                <div className={styles.authErrorIcon}>
                  <svg className={styles.authErrorIconSvg} viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className={styles.authErrorText}>
                  <h3 className={styles.authErrorTitle}>Sign in failed</h3>
                  <div className={styles.authErrorMessage}>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remember me and Forgot password */}
          <div className={styles.formOptions}>
            <div className={styles.rememberMe}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={styles.checkbox}
              />
              <label htmlFor="remember-me" className={styles.checkboxLabel}>
                Remember me
              </label>
            </div>

            <div className={styles.forgotPassword}>
              <a
                href="#"
                className={styles.forgotPasswordLink}
              >
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "group",
                styles.submitButton,
                isLoading && styles.submitButtonDisabled
              )}
            >
              {isLoading ? (
                <div className={styles.submitButtonContent}>
                  <LoadingSpinner size="sm" color="white" className={styles.submitButtonSpinner} />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}