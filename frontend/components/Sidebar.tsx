'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Contacts', href: '/contacts' },
  { name: 'Leads', href: '/leads' },
  { name: 'Pipeline', href: '/pipeline' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Employees', href: '/users' },
  { name: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen fixed left-0 top-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">CRM Platform</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate">{user.email}</span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
