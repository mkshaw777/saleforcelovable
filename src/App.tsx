import { useState, useEffect } from 'react';
import { authService, type AuthUser } from './services/auth.service';
import { Toaster, toast } from 'sonner';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import MRDashboard from './components/MRDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    authService.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const { data: authListener } = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });

    return () => {
      clearTimeout(splashTimer);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <Toaster position="top-center" />
      </>
    );
  }

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (user.role === 'STAFF') {
    return (
      <>
        <MRDashboard user={user} onLogout={handleLogout} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (user.role === 'MANAGER') {
    return (
      <>
        <ManagerDashboard user={user} onLogout={handleLogout} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <AdminDashboard user={user} onLogout={handleLogout} />
      <Toaster position="top-center" />
    </>
  );
}
