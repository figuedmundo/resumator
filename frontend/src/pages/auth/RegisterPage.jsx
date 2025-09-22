import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validateUsername, validatePassword, validatePasswordConfirm } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from '../../styles/modules/pages/RegisterPage.module.css';

export default function RegisterPage() {
  const { register, isAuthenticated, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear auth error when component unmounts or when user starts typing
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Username validation
    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    // Password confirmation validation
    const confirmPasswordError = validatePasswordConfirm(formData.password, formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    // Terms validation
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
    };

    const result = await register(userData);
    
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>R</div>
          </div>
          <h2 className={styles.title}>
            Create your account
          </h2>
          <p className={styles.subtitle}>
            Already have an account?{' '}
            <Link
              to="/login"
              className={styles.signinLink}
            >
              Sign in here
            </Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            {/* Email Field */}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email address *
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
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

            {/* Username Field */}
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>
                Username *
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={clsx(
                    styles.input,
                    errors.username ? styles.inputError : styles.inputDefault
                  )}
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className={styles.fieldError}>{errors.username}</p>
              )}
            </div>



            {/* Password Field */}
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Password *
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={clsx(
                    styles.input,
                    styles.inputWithIcon,
                    errors.password ? styles.inputError : styles.inputDefault
                  )}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className={styles.passwordIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className={styles.passwordIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className={styles.fieldError}>{errors.password}</p>
              )}
              <p className={styles.fieldHint}>
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm password *
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={clsx(
                    styles.input,
                    errors.confirmPassword ? styles.inputError : styles.inputDefault
                  )}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className={styles.fieldError}>{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className={styles.field}>
            <div className={styles.termsContainer}>
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }
                }}
                className={clsx(
                  styles.termsCheckbox,
                  errors.terms && styles.termsCheckboxError
                )}
              />
              <label htmlFor="terms" className={styles.termsLabel}>
                I agree to the{' '}
                <a href="#" className={styles.termsLink}>
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className={styles.termsLink}>
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className={styles.fieldError}>{errors.terms}</p>
            )}
          </div>

          {/* Auth Error */}
          {error && (
            <div className={styles.authError}>
              <div className={styles.authErrorContent}>
                <div className={styles.authErrorIcon}>
                  <svg className={styles.authErrorIconSvg} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={styles.authErrorText}>
                  <h3 className={styles.authErrorTitle}>
                    Registration failed
                  </h3>
                  <div className={styles.authErrorMessage}>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
