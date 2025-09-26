import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import apiService from '../services/api';
import { devLog } from '@/utils/helpers';

// Auth context
const AuthContext = createContext(null);

// Auth action types
const AuthActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true for initial auth check
  error: null,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AuthActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AuthActions.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AuthActions.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AuthActions.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };

    case AuthActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Use useCallback to memoize functions and prevent re-renders
  const clearError = useCallback(() => {
    dispatch({ type: AuthActions.CLEAR_ERROR });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({
      type: AuthActions.SET_USER,
      payload: { user: userData }
    });
  }, []);

  // Initialize auth state on app load - run only once
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        devLog('Initializing auth...');
        
        // Check if we have valid session data in localStorage
        if (apiService.isAuthenticated()) {
          const user = apiService.getCurrentUser();
          if (user && mounted) {
            dispatch({
              type: AuthActions.SET_USER,
              payload: { user }
            });
            devLog('Auth initialized with existing session');
          } else if (mounted) {
            dispatch({ type: AuthActions.LOGOUT });
          }
        } else if (mounted) {
          dispatch({ type: AuthActions.LOGOUT });
        }
      } catch (error) {
        devLog('Auth initialization failed:', error.message);
        if (mounted) {
          // Don't call logout API, just clear local state
          apiService.clearTokens();
          dispatch({ type: AuthActions.LOGOUT });
        }
      } finally {
        if (mounted) {
          dispatch({ type: AuthActions.SET_LOADING, payload: false });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run only once

  // Listen for storage changes to update auth state
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'refresh_token') {
        // Token changed, re-check authentication
        const isCurrentlyAuthenticated = apiService.isAuthenticated();
        const currentUser = apiService.getCurrentUser();

        // Only dispatch if state actually changed
        if (isCurrentlyAuthenticated && currentUser && (!state.isAuthenticated || state.user?.id !== currentUser.id)) {
          dispatch({
            type: AuthActions.SET_USER,
            payload: { user: currentUser }
          });
        } else if (!isCurrentlyAuthenticated && state.isAuthenticated) {
          dispatch({ type: AuthActions.LOGOUT });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.isAuthenticated, state.user?.id]);

  // Login function
  const login = useCallback(async (credentials) => {
    dispatch({ type: AuthActions.LOGIN_START });

    try {
      const { user } = await apiService.login(credentials);
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user }
      });
      devLog('Login successful');
      return { success: true };
    } catch (error) {
      // Extract detailed backend error if it exists
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail; // FastAPI standard
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: AuthActions.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      devLog('Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AuthActions.LOGIN_START });

    try {
      const { user } = await apiService.register(userData);
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user }
      });
      devLog('Registration successful');
      return { success: true };
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: AuthActions.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      devLog('Registration failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function - don't call API on page refresh/navigation
  const logout = useCallback(async (callAPI = true) => {
    try {
      if (callAPI && apiService.isAuthenticated()) {
        await apiService.logout();
      } else {
        // Just clear local tokens without API call
        apiService.clearTokens();
      }
    } catch (error) {
      devLog('Logout API call failed:', error);
      // Clear local tokens anyway
      apiService.clearTokens();
    } finally {
      dispatch({ type: AuthActions.LOGOUT });
      devLog('Logout completed');
    }
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// HOC for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>; // You can replace with a proper loading component
    }

    if (!isAuthenticated) {
      return <div>Access denied. Please log in.</div>; // Or redirect to login
    }

    return <Component {...props} />;
  };
}