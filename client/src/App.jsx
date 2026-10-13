/**
 * App.jsx — Root: providers, router, and layout.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { PlanProvider }   from './context/PlanContext';
import Navbar             from './components/Navbar';
import Footer             from './components/Footer';
import PrivateRoute       from './components/PrivateRoute';
import AdminRoute         from './components/AdminRoute';

import HomePage            from './pages/HomePage';
import DirectoryPage       from './pages/DirectoryPage';
import PlaceDetailPage     from './pages/PlaceDetailPage';
import DayPlannerPage      from './pages/DayPlannerPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import MyPlansPage         from './pages/MyPlansPage';
import SavedPlanDetailPage from './pages/SavedPlanDetailPage';
import AdminDashboardPage  from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
              {/* Public */}
              <Route path="/"               element={<HomePage />} />
              <Route path="/places"         element={<DirectoryPage />} />
              <Route path="/places/:slugOrId" element={<PlaceDetailPage />} />
              <Route path="/planner"        element={<DayPlannerPage />} />
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/register"       element={<RegisterPage />} />

              {/* Tourist (authenticated) */}
              <Route element={<PrivateRoute />}>
                <Route path="/my-plans"       element={<MyPlansPage />} />
                <Route path="/plans/:id"      element={<SavedPlanDetailPage />} />
              </Route>

              {/* Admin */}
              <Route element={<AdminRoute />}>
                <Route path="/admin"          element={<AdminDashboardPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                  <p className="text-6xl mb-4">🗺️</p>
                  <h1 className="text-2xl font-bold text-slate-200 mb-2">Page not found</h1>
                  <a href="/" className="btn-primary mt-4">Go home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </PlanProvider>
  </AuthProvider>
  );
}
