import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // If permissions are missing, fetch them from the server
      if (!parsedUser.permissions) {
        axios.get('/api/auth/profile')
          .then(res => {
            const updatedUser = { ...parsedUser, permissions: res.data.permissions };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          })
          .catch(err => console.error('Failed to fetch permissions:', err));
      }
    }
    setLoading(false);


    // Add interceptor to handle 401s (token expiration/server reset)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token, ...userData } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    const { token, ...user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isCandidate: user?.role === 'candidate',
    isManager: user?.role === 'manager',
    permissions: user?.permissions || {},
    hasPermission: (permission) => {
      if (!user || user.role !== 'manager') return false;
      if (user.permissions?.fullAccess) return true;
      return user.permissions?.[permission] || false;
    },
    hasFullAccess: user?.permissions?.fullAccess || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
