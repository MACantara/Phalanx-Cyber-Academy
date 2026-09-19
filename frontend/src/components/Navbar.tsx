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
    <nav className="sticky top-0 z-50 border-b border-hairline bg-stock transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-bg.png" alt="Phalanx Cyber Academy Logo" className="h-9 w-auto" />
            <span className="text-sm font-extrabold uppercase tracking-tight text-ink">
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
                  className="flex items-center gap-1 font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  <Gamepad2 className="h-4 w-4" /> Games <ChevronDown className="h-4 w-4" />
                </button>
                {gamesOpen && (
                  <div className="absolute left-0 mt-2 w-56 border border-hairline bg-stock">
                    <Link
                      to="/levels"
                      onClick={() => setGamesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-stock-green hover:text-ink"
                    >
                      <Trophy className="h-4 w-4" /> Levels
                    </Link>
                    <Link
                      to="/blue-vs-red"
                      onClick={() => setGamesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-stock-green hover:text-ink"
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
                  className="flex items-center gap-2 border border-transparent px-3 py-2 text-ink-soft transition-colors hover:border-hairline hover:text-ink"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-seal text-sm font-bold text-seal-ink">
                    {initials}
                  </div>
                  <span className="hidden lg:block">{user.username || user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-48 border border-hairline bg-stock">
                    <Link to="/dashboard" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-stock-green hover:text-ink">
                      <Users className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-stock-green hover:text-ink">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-stock-green hover:text-ink">
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-hairline" />
                    <button
                      onClick={() => {
                        logout();
                        setUserOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-ink-soft hover:bg-stock-green hover:text-ink"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="group relative font-medium text-ink-soft transition-colors hover:text-ink">
                  Log In
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
                >
                  <UserPlus className="h-4 w-4" /> Enlist
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button onClick={() => setMobileOpen((v) => !v)} className="p-2 text-ink" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-1 border-t border-hairline bg-stock px-2 pb-3 pt-2 md:hidden">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
          <MobileLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
          <MobileLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
          <MobileLink to="/leaderboard" onClick={() => setMobileOpen(false)}>Leaderboard</MobileLink>
          {user && (
            <div className="border-t border-hairline pt-2">
              <div className="register px-3 py-1">Games</div>
              <MobileLink to="/levels" onClick={() => setMobileOpen(false)}><Trophy className="h-4 w-4" /> Levels</MobileLink>
              <MobileLink to="/blue-vs-red" onClick={() => setMobileOpen(false)}><ShieldCheck className="h-4 w-4" /> Blue Team vs Red Team</MobileLink>
            </div>
          )}
          {user ? (
            <>
              <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/profile" onClick={() => setMobileOpen(false)}>Profile</MobileLink>
              {isAdmin && <MobileLink to="/admin" onClick={() => setMobileOpen(false)}><LayoutDashboard className="h-4 w-4" /> Admin</MobileLink>}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-strike"><LogOut className="h-4 w-4" /> Logout</button>
            </>
          ) : (
            <>
              <MobileLink to="/login" onClick={() => setMobileOpen(false)}><LogIn className="h-4 w-4" /> Log In</MobileLink>
              <MobileLink to="/signup" onClick={() => setMobileOpen(false)}><UserPlus className="h-4 w-4" /> Enlist</MobileLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="group relative font-medium text-ink-soft transition-colors hover:text-ink">
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-200 group-hover:w-full" />
    </Link>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2 border border-transparent px-3 py-2.5 text-ink-soft hover:border-hairline hover:text-ink">
      {children}
    </Link>
  );
}
