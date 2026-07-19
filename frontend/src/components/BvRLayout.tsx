import { Outlet } from 'react-router-dom';
import { ToastContainer } from './Toast';

export default function BvRLayout() {
  return (
    <>
      <ToastContainer />
      <Outlet />
    </>
  );
}
