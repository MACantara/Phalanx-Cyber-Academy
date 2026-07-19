import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { ChevronDown, Gamepad2, LayoutDashboard, LogIn, LogOut, Menu, ShieldCheck, Trophy, User, UserPlus, Users } from 'lucide-react';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);

  const initials = (user?.username?.[0] ?? 'U').toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/90 shadow-lg backdrop-blur-md transition-colors duration-300 dark:border-gray-700/50 dark:bg-gray-900/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold transition-transform duration-300 hover:scale-105">
            <img src="/logo-bg.png" alt="Phalanx Cyber Academy Logo" className="h-10 w-auto" />
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Phalanx Cyber Academy
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setGamesOpen((v) => !v)}
                  className="flex items-center gap-1 font-medium text-gray-600 transition-all hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  <Gamepad2 className="h-4 w-4" /> Games <ChevronDown className="h-4 w-4" />
                </button>
                {gamesOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <Link
                      to="/levels"
                      onClick={() => setGamesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Trophy className="h-4 w-4" /> Levels
                    </Link>
                    <Link
                      to="/blue-vs-red"
                      onClick={() => setGamesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <ShieldCheck className="h-4 w-4" /> Blue Team vs Red Team
                    </Link>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <span className="hidden lg:block">{user.username || user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <Link to="/dashboard" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Users className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-900/20">
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        logout();
                        setUserOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="group relative font-medium text-gray-600 transition-all duration-300 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Log In
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
                >
                  <UserPlus className="h-4 w-4" /> Sign Up
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button onClick={() => setMobileOpen((v) => !v)} className="p-2 text-gray-800 dark:text-gray-200">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-1 border-t border-gray-200/50 bg-white/95 px-2 pb-3 pt-2 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/95 md:hidden">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
          <MobileLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
          <MobileLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
          <MobileLink to="/leaderboard" onClick={() => setMobileOpen(false)}>Leaderboard</MobileLink>
          {user && (
            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Games</div>
              <MobileLink to="/levels" onClick={() => setMobileOpen(false)}><Trophy className="h-4 w-4" /> Levels</MobileLink>
              <MobileLink to="/blue-vs-red" onClick={() => setMobileOpen(false)}><ShieldCheck className="h-4 w-4" /> Blue Team vs Red Team</MobileLink>
            </div>
          )}
          {user ? (
            <>
              <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/profile" onClick={() => setMobileOpen(false)}>Profile</MobileLink>
              {isAdmin && <MobileLink to="/admin" onClick={() => setMobileOpen(false)}><LayoutDashboard className="h-4 w-4" /> Admin</MobileLink>}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400"><LogOut className="h-4 w-4" /> Logout</button>
            </>
          ) : (
            <>
              <MobileLink to="/login" onClick={() => setMobileOpen(false)}><LogIn className="h-4 w-4" /> Log In</MobileLink>
              <MobileLink to="/signup" onClick={() => setMobileOpen(false)}><UserPlus className="h-4 w-4" /> Sign Up</MobileLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="group relative font-medium text-gray-600 transition-all duration-300 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800/50">
      {children}
    </Link>
  );
}
