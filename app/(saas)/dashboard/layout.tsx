import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Bot, LayoutDashboard, Settings, LogOut, Users, BarChart2 } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const user = session.user as any;

  const navItems = [
    { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/settings', icon: Settings,         label: 'Settings'  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-60 bg-navy-950 flex flex-col fixed h-full">
        <div className="px-5 py-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center">
              <Bot size={16} className="text-gold-400" />
            </div>
            <span className="text-white font-bold text-sm">DirectKey</span>
          </Link>
          <div className="mt-3 px-1">
            <p className="text-white font-medium text-sm truncate">{user.name}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gold-500/10 text-gold-400 rounded-md capitalize">
              {user.plan} plan
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-sm font-medium"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition text-sm"
          >
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8">
        {children}
      </main>

    </div>
  );
}
