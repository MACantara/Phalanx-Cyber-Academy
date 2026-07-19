import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gradient-to-r from-gray-100 to-gray-200 py-12 text-gray-800 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center">
              <img src="/logo-bg.png" alt="Phalanx Cyber Academy Logo" className="mr-3 h-12 w-auto" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Phalanx Cyber Academy
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              An interactive cybersecurity learning platform designed to teach essential security concepts through hands-on challenges and real-world scenarios.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/about">About</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
              {user && <li><FooterLink to="/profile">Profile</FooterLink></li>}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Legal</h4>
            <ul className="space-y-2">
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink to="/cookies">Cookie Policy</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-8 dark:border-gray-700">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="mb-4 text-gray-600 dark:text-gray-300 md:mb-0">&copy; {year} Phalanx Cyber Academy. All rights reserved.</p>
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
    <Link to={to} className="text-gray-600 transition-colors duration-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
      {children}
    </Link>
  );
}
