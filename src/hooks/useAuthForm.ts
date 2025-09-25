import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, RegisterCredentials } from '@/utils/api';

export const useAuthForm = () => {
  const { login, register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await register(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleLogin,
    handleRegister,
    error,
    setError,
    isLoading: isLoading || isSubmitting,
  };
};
