
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import FileEditor from '@/pages/FileEditor';
import { Loader2 } from 'lucide-react';
import { SearchProvider } from '@/context/SearchContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard view="my-drive" />
              </PrivateRoute>
            } />
            <Route path="/recent" element={
              <PrivateRoute>
                <Dashboard view="recent" />
              </PrivateRoute>
            } />
            <Route path="/starred" element={
              <PrivateRoute>
                <Dashboard view="starred" />
              </PrivateRoute>
            } />
            <Route path="/trash" element={
              <PrivateRoute>
                <Dashboard view="trash" />
              </PrivateRoute>
            } />
            <Route path="/editor/:fileId" element={
              <PrivateRoute>
                <FileEditor />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
