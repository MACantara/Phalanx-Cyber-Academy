import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from './Toast';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-white">
      <Navbar />
      <ToastContainer />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
