import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-text-primary mb-2">
            Rocket Chat
          </h1>
          <p className="text-text-tertiary">
            企业级即时通讯平台
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;