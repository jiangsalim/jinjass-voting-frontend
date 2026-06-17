'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  DashboardIcon, ElectionIcon, SchoolIcon, UsersIcon, 
  ChartIcon, SettingsIcon, BellIcon, LogoutIcon, VoteIcon 
} from '@/components/ui/Icons';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/admin/elections', label: 'Elections', icon: ElectionIcon },
    { href: '/admin/classes', label: 'Classes', icon: SchoolIcon },
    { href: '/admin/streams', label: 'Streams', icon: UsersIcon },
    { href: '/admin/positions', label: 'Positions', icon: VoteIcon },
    { href: '/admin/candidates', label: 'Candidates', icon: UsersIcon },
    { href: '/admin/teachers', label: 'Teacher Account', icon: UsersIcon },
    { href: '/admin/results', label: 'Results', icon: ChartIcon },
    { href: '/admin/notifications', label: 'Notifications', icon: BellIcon },
    { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-72 bg-navy flex flex-col z-40"
    >
      {/* Logo */}
      <div className="p-6 border-b border-navy-light">
        <h2 className="text-2xl font-heading font-bold text-white">
          Jinja<span className="text-teal">SS</span>
        </h2>
        <p className="text-gray-medium text-sm font-body mt-1">Voting Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span className="font-body">{link.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-navy-light">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left"
        >
          <LogoutIcon size={20} />
          <span className="font-body">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}