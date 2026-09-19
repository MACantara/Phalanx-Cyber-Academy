import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-hairline bg-stock py-12 text-ink transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center">
              <img src="/logo-bg.png" alt="Phalanx Cyber Academy Logo" className="mr-3 h-10 w-auto" />
              <h3 className="text-lg font-extrabold uppercase tracking-tight text-ink">
                Phalanx Cyber Academy
              </h3>
            </div>
            <p className="text-ink-soft">
              An interactive cybersecurity learning platform designed to teach essential security concepts through hands-on challenges and real-world scenarios.
            </p>
          </div>

          <div>
            <h4 className="register mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/about">About</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
              {user && <li><FooterLink to="/profile">Profile</FooterLink></li>}
            </ul>
          </div>

          <div>
            <h4 className="register mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink to="/cookies">Cookie Policy</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-hairline pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="register mb-4 md:mb-0">&copy; {year} Phalanx Cyber Academy</p>
            <div className="flex space-x-6 text-sm">
              <FooterLink to="/privacy">Privacy</FooterLink>
              <FooterLink to="/terms">Terms</FooterLink>
              <FooterLink to="/cookies">Cookies</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-ink-soft transition-colors duration-150 hover:text-ink">
      {children}
    </Link>
  );
}
