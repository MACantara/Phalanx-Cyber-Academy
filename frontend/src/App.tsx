import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import About from './pages/About';
import Levels from './pages/Levels';
import Level from './pages/Level';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Verify from './pages/Verify';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/admin/Users';
import UserDetails from './pages/admin/UserDetails';
import Logs from './pages/admin/Logs';
import Analytics from './pages/admin/Analytics';
import Backup from './pages/admin/Backup';
import Schedule from './pages/admin/Schedule';
import Reports from './pages/admin/Reports';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import ServerError from './pages/ServerError';
import NotFound from './pages/NotFound';
import BvRLayout from './components/BvRLayout';
import BlueVsRedIntroduction from './pages/blue-vs-red/Introduction';
import BlueVsRedDashboard from './pages/blue-vs-red/Dashboard';
import BlueVsRedTutorial from './pages/blue-vs-red/Tutorial';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="cookies" element={<Cookies />} />
            <Route path="levels" element={<Levels />} />
            <Route path="levels/:levelId" element={<Level />} />
            <Route path="login" element={<Login />} />
            <Route path="verify" element={<Verify />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="server-error" element={<ServerError />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="signup" element={<Signup />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="contact" element={<Contact />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<Users />} />
            <Route path="admin/users/:userId" element={<UserDetails />} />
            <Route path="admin/logs" element={<Logs />} />
            <Route path="admin/analytics" element={<Analytics />} />
            <Route path="admin/reports" element={<Reports />} />
            <Route path="admin/backups" element={<Backup />} />
            <Route path="admin/backups/schedule" element={<Schedule />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="blue-vs-red" element={<BvRLayout />}>
            <Route index element={<BlueVsRedIntroduction />} />
            <Route path="tutorial" element={<BlueVsRedTutorial />} />
            <Route path="dashboard" element={<BlueVsRedDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
