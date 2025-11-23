import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUser, setCurrentSession } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

interface RegisterProps {
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateLogin }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }
    if (users.some(u => u.employeeId === formData.employeeId)) {
        setError('Employee ID already registered');
        return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: formData.name,
      employeeId: formData.employeeId,
      email: formData.email,
      password: formData.password,
      role: UserRole.EMPLOYEE,
      otHours: 0,
      leaveDays: 14, // Default annual leave
      joinedDate: new Date().toISOString(),
    };

    saveUser(newUser);
    login(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join the employee network</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
              value={formData.employeeId}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                type="password"
                name="password"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                value={formData.password}
                onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                <input
                type="password"
                name="confirmPassword"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                value={formData.confirmPassword}
                onChange={handleChange}
                />
            </div>
          </div>

          <Button type="submit" fullWidth className="mt-6">
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={onNavigateLogin} className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};