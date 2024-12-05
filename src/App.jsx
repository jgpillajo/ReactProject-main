import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';
import Navbar from './components/Commons/Navbar';
import NewFlatPage from './pages/NewFlatPage';
import HomePage from './pages/HomePage';
import FavouritesPage from './pages/FavouritesPage';
import MyFlatsPage from './pages/MyFlatsPage';
import ProfilePage from './pages/ProfilePage';
import AllUsersPage from './pages/AllUsersPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from './components/Commons/ProtectRoute';
import EditFlatPage from './pages/EditFlatPage';
import FlatDetailsPage from './pages/FlatDetailsPage';
import UserForm from './components/Users/UserForm';

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const UpdateProfileRoute = () => {
  const { user } = useAuth();
  return user ? <UserForm userId={user.id} /> : null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/flat/:id" element={<FlatDetailsPage />} />
              <Route path="/new-flat" element={<NewFlatPage />} />
              <Route path="/favorite-flats" element={<FavouritesPage />} />
              <Route path="/my-flats" element={<MyFlatsPage />} />
              <Route path="/edit-flat/:id" element={<EditFlatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user/:id" element={<ProfilePage />} />
              <Route path="/update-profile" element={<UpdateProfileRoute />} />
              <Route path="/all-users" element={<AllUsersPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;