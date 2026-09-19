import { Outlet } from 'react-router-dom';
import { ToastContainer } from './Toast';

export default function BvRLayout() {
  return (
    <div className="min-h-screen bg-stock text-ink transition-colors duration-300">
      <ToastContainer />
      <Outlet />
    </div>
  );
}
