// Importaciones necesarias de React y react-router-dom
import React from 'react';
// Importa React, que es necesario para definir componentes funcionales.

import { Navigate, Outlet } from 'react-router-dom';
// Importa `Navigate` para redirigir a otras rutas y `Outlet` para renderizar componentes hijos en rutas protegidas.

// Importación del hook personalizado de autenticación
import { useAuth } from '../../contexts/authContext';
// Importa el hook `useAuth` desde el contexto de autenticación, que proporciona el estado de autenticación del usuario y su estado de carga.

// Importaciones de componentes de Material-UI
import { Box, CircularProgress, Typography } from '@mui/material';
// Importa componentes de Material-UI: `Box` para contenedores, `CircularProgress` para mostrar un indicador de carga, y `Typography` para mostrar texto estilizado.

// Componente para mostrar un spinner de carga
const LoadingSpinner = () => (
  <Box 
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#fff8ec', // Usa el mismo color de fondo que la Navbar
    }}
  >
    <CircularProgress size={60} thickness={4} sx={{ color: '#114C5F' }} />
    {/* CircularProgress muestra un spinner con un tamaño de 60px, grosor de 4px, y un color consistente con el tema de la aplicación. */}

    <Typography variant="h6" sx={{ mt: 2, color: '#114C5F' }}>
      Cargando...
    </Typography>
    {/* Typography muestra el texto "Cargando..." debajo del spinner con el mismo color que el spinner, alineado con el tema. */}
  </Box>
);

// Componente principal ProtectedRoute
const ProtectedRoute = () => {
  // Obtiene el usuario y el estado de carga del contexto de autenticación
  const { user, loading } = useAuth();
  // `useAuth` devuelve el objeto `user` (información del usuario autenticado) y `loading` (indica si los datos de autenticación aún se están cargando).

  console.log("ProtectedRoute - user:", user, "loading:", loading);
  // Mensaje de depuración para mostrar el estado del usuario y de carga en la consola.

  // Si está cargando, muestra el spinner
  if (loading) {
    return <LoadingSpinner />;
    // Si `loading` es `true`, renderiza el componente `LoadingSpinner` para indicar que los datos de autenticación están cargando.
  }

  // Si no hay usuario autenticado, redirige a la página de login
  if (!user) {
    console.log("Usuario no autenticado, redirigiendo a login");
    return <Navigate to="/login" replace />;
    // Si no hay un `user` autenticado, redirige a la página de login utilizando `Navigate` y reemplaza la ruta actual en el historial.
  }

  // Si el usuario está autenticado, renderiza el componente hijo (Outlet)
  console.log("Usuario autenticado, renderizando Outlet");
  return <Outlet />;
  // Si hay un `user` autenticado, renderiza los componentes hijos (especificados en las rutas protegidas) usando `Outlet`.
};

export default ProtectedRoute;
// Exporta el componente `ProtectedRoute` para que pueda ser utilizado en otras partes de la aplicación.
