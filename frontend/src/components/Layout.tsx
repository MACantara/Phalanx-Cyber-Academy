import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from './Toast';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-stock text-ink transition-colors duration-300">
      <Navbar />
      <ToastContainer />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
