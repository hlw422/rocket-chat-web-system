import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const ContactsPage = lazy(() => import('@/pages/ContactsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Auth guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Guest guard (redirect to chat if already logged in)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/chat" replace />,
  },
  {
    path: '/',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<Loading />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'chat',
        element: (
          <Suspense fallback={<Loading />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: 'chat/:roomId',
        element: (
          <Suspense fallback={<Loading />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: 'contacts',
        element: (
          <Suspense fallback={<Loading />}>
            <ContactsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Loading />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/chat" replace />,
  },
]);