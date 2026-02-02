// frontend/src/components/Navbar.tsx
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full p-4 flex items-center justify-between z-10 bg-navbar-pink border-b border-gray-400 shadow-md">
      {/* Left side: App Name */}
      <div className="flex items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
          🌸FLOWRA
        </h1>
      </div>

      {/* Right side: Potentially add navigation links or user actions here later */}
      <div>
        {/* Placeholder for future elements */}
      </div>
    </nav>
  );
};

export default Navbar;
