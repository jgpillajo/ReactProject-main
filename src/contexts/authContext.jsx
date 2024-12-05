// Importaciones necesarias de React y Firebase
import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserByID } from '../services/firebase';

// Creación del contexto de autenticación
const AuthContext = createContext();

// Componente AuthProvider
export const AuthProvider = ({ children }) => {
  // Estados para manejar el usuario, carga y errores
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para manejar el estado de autenticación
  useEffect(() => {
    console.log("AuthProvider useEffect running");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged triggered", firebaseUser);
      setLoading(true);
      if (firebaseUser) {
        try {
          // Obtener datos adicionales del usuario desde Firestore
          const userData = await getUserByID(firebaseUser.uid);
          console.log("User data fetched:", userData);
          setUser(userData);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data");
        }
      } else {
        console.log("No user found, setting user to null");
        setUser(null);
      }
      setLoading(false);
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    console.log("Login function called");
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserByID(userCredential.user.uid);
      console.log("Login successful, user data:", userData);
      setUser(userData);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    console.log("Logout function called");
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      console.log("Logout successful");
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("Current auth state:", { user, loading, error });

  // Valor que se proporcionará a través del contexto
  const value = {
    user,
    loading,
    error,
    login,
    logout
  };

  // Renderizado del Provider con el valor del contexto
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};