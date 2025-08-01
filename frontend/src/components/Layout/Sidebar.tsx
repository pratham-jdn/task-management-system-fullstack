import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';

const Sidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Tasks', href: '/tasks', icon: '📋' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  const adminNavigation = [
    { name: 'Users', href: '/users', icon: '👥' },
  ];

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">Task Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              isActive
                ? 'sidebar-link-active'
                : 'sidebar-link-inactive'
            }
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}

        {/* Admin only navigation */}
        {user?.role === 'admin' && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Admin
            </div>
            {adminNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  isActive
                    ? 'sidebar-link-active'
                    : 'sidebar-link-inactive'
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;