import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

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
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8\">
      <div className=\"max-w-md w-full space-y-8\">
        <div>
          <div className=\"mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100\">
            <div className=\"text-blue-600 font-bold text-xl\">R</div>
          </div>
          <h2 className=\"mt-6 text-center text-3xl font-extrabold text-gray-900\">
            Sign in to your account
          </h2>
          <p className=\"mt-2 text-center text-sm text-gray-600\">
            Or{' '}
            <Link
              to=\"/register\"
              className=\"font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200\"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className=\"mt-8 space-y-6\" onSubmit={handleSubmit}>
          <div className=\"space-y-4\">
            {/* Email Field */}
            <div>
              <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-700\">
                Email address
              </label>
              <div className=\"mt-1 relative\">
                <input
                  id=\"email\"
                  name=\"email\"
                  type=\"email\"
                  autoComplete=\"email\"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder=\"Enter your email\"
                />
              </div>
              {errors.email && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor=\"password\" className=\"block text-sm font-medium text-gray-700\">
                Password
              </label>
              <div className=\"mt-1 relative\">
                <input
                  id=\"password\"
                  name=\"password\"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete=\"current-password\"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder=\"Enter your password\"
                />
                <button
                  type=\"button\"
                  className=\"absolute inset-y-0 right-0 pr-3 flex items-center\"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className=\"h-5 w-5 text-gray-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21\" />
                    </svg>
                  ) : (
                    <svg className=\"h-5 w-5 text-gray-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\" />
                      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z\" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className=\"mt-1 text-sm text-red-600\">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Auth Error */}
          {error && (
            <div className=\"rounded-md bg-red-50 p-4\">
              <div className=\"flex\">
                <div className=\"flex-shrink-0\">
                  <svg className=\"h-5 w-5 text-red-400\" viewBox=\"0 0 20 20\" fill=\"currentColor\">
                    <path fillRule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clipRule=\"evenodd\" />
                  </svg>
                </div>
                <div className=\"ml-3\">
                  <h3 className=\"text-sm font-medium text-red-800\">
                    Sign in failed
                  </h3>
                  <div className=\"mt-2 text-sm text-red-700\">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remember me and Forgot password */}
          <div className=\"flex items-center justify-between\">
            <div className=\"flex items-center\">
              <input
                id=\"remember-me\"
                name=\"remember-me\"
                type=\"checkbox\"
                className=\"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
              />
              <label htmlFor=\"remember-me\" className=\"ml-2 block text-sm text-gray-900\">
                Remember me
              </label>
            </div>

            <div className=\"text-sm\">
              <a href=\"#\" className=\"font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200\">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type=\"submit\"
              disabled={isLoading}
              className=\"group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              {isLoading ? (
                <div className=\"flex items-center\">
                  <LoadingSpinner size=\"sm\" color=\"white\" className=\"mr-2\" />
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
