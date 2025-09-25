import { createContext, useContext, useEffect, useReducer } from 'react';
import secureApiService from '../services/secureApi';
import { devLog } from '../utils/helpers';

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
};

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
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

  // Initialize auth state on app load
  useEffect(() => {
    console.log("useAuth init effect running...");

    const initializeAuth = async () => {
      const token = secureApiService.getToken();
      const user = secureApiService.getCurrentUser();

      if (token && user) {
        try {
          // Verify token is still valid
          await secureApiService.verifyToken();
          dispatch({ 
            type: AuthActions.SET_USER, 
            payload: { user } 
          });
          devLog('Auth initialized with existing token');
        } catch (error) {
          devLog('Token verification failed:', error.message);
          secureApiService.logout();
          dispatch({ type: AuthActions.LOGOUT });
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AuthActions.LOGIN_START });

    try {
      const { user } = await secureApiService.login(credentials);
      dispatch({ 
        type: AuthActions.LOGIN_SUCCESS, 
        payload: { user } 
      });
      devLog('Login successful');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message;
      dispatch({ 
        type: AuthActions.LOGIN_FAILURE, 
        payload: { error: errorMessage } 
      });
      devLog('Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AuthActions.LOGIN_START });

    try {
      const { user } = await secureApiService.register(userData);
      dispatch({ 
        type: AuthActions.LOGIN_SUCCESS, 
        payload: { user } 
      });
      devLog('Registration successful');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message;
      dispatch({ 
        type: AuthActions.LOGIN_FAILURE, 
        payload: { error: errorMessage } 
      });
      devLog('Registration failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    secureApiService.logout();
    dispatch({ type: AuthActions.LOGOUT });
    devLog('Logout successful');
  };

  // Clear error function
  const clearError = () => {
    // if (state.error) {
      dispatch({ type: AuthActions.CLEAR_ERROR });
    // }
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ 
      type: AuthActions.SET_USER, 
      payload: { user: userData } 
    });
  };

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
