// Importaciones necesarias de React y otras librerías
import React, { useState, useEffect } from "react";
// Importación de `useState` y `useEffect` para manejar el estado y efectos secundarios en el componente.

import { useNavigate } from "react-router-dom";
// Importa `useNavigate` de React Router para la navegación programática entre rutas.

import {
  AppBar, Toolbar, Typography, IconButton, Avatar, Link, Button, Menu,
  MenuItem, CircularProgress, Box, useMediaQuery, Drawer, List,
  ListItem, ListItemIcon, ListItemText,
} from "@mui/material";
// Importación de varios componentes de Material-UI para construir la barra de navegación (Navbar).

import { Home, Add, Favorite, Apartment, Menu as MenuIcon } from "@mui/icons-material";
// Importación de iconos específicos de Material-UI que se utilizarán en la Navbar.

import { useTheme } from "@mui/material/styles";
// Importa `useTheme` para acceder al tema actual de Material-UI, permitiendo el uso de propiedades de estilo como `breakpoints`.

import { storage } from '../../config/firebase';
// Importa la instancia de `storage` de Firebase para acceder al almacenamiento donde se guardan los avatares.

import { ref, getDownloadURL } from 'firebase/storage';
// Importa funciones de Firebase Storage para obtener URLs de archivos almacenados en Firebase.

import { useAuth } from '../../contexts/authContext';
// Importa `useAuth`, un hook personalizado que proporciona el contexto de autenticación, incluyendo la información del usuario y la función de logout.

import NotificationMessages from "../Messages/NotificationMessages";
// Importa el componente `NotificationMessages` que maneja la visualización de notificaciones en la aplicación.

function Navbar() { // Definición del componente funcional `Navbar`
  const [anchorEl, setAnchorEl] = useState(null);
  // Estado `anchorEl` para manejar la posición del menú desplegable (Menu).

  const [userAvatar, setUserAvatar] = useState(null);
  // Estado `userAvatar` para almacenar la URL del avatar del usuario.

  const [avatarLoading, setAvatarLoading] = useState(true);
  // Estado `avatarLoading` para manejar la visualización de un indicador de carga mientras se obtiene el avatar.

  const [drawerOpen, setDrawerOpen] = useState(false);
  // Estado `drawerOpen` para controlar la apertura y cierre del drawer (menú lateral en dispositivos móviles).

  const navigate = useNavigate();
  // Hook `useNavigate` para redirigir al usuario a diferentes rutas.

  const { user, logout } = useAuth();
  // Extrae el usuario autenticado y la función de logout del contexto de autenticación.

  const theme = useTheme();
  // Accede al tema actual para obtener configuraciones de estilo como los breakpoints.

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Verifica si la vista actual corresponde a un dispositivo móvil utilizando el breakpoint `sm` (pequeño).

  useEffect(() => {
    // Hook `useEffect` que se ejecuta cuando el componente se monta o cuando `user` cambia.
    const fetchAvatar = async () => {
      setAvatarLoading(true);
      // Activa el estado de carga del avatar.

      if (user && user.imageUid) {
        // Si el usuario está autenticado y tiene un `imageUid`, se procede a obtener la URL del avatar.
        if (user.imageUid.startsWith('http')) {
          // Si `imageUid` ya es una URL completa, simplemente se establece como el avatar.
          setUserAvatar(user.imageUid);
        } else {
          try {
            // Si `imageUid` no es una URL, se intenta obtenerla desde Firebase Storage.
            const url = await getDownloadURL(ref(storage, user.imageUid));
            setUserAvatar(url);
          } catch (error) {
            // Si ocurre un error al obtener la URL, se muestra en consola y se establece `null` como avatar.
            console.error("Error al obtener la URL del avatar:", error);
            setUserAvatar(null);
          }
        }
      } else {
        // Si no hay un `imageUid`, se establece `null` como avatar.
        setUserAvatar(null);
      }
      setAvatarLoading(false);
      // Finaliza el estado de carga del avatar.
    };

    fetchAvatar();
    // Llama a la función `fetchAvatar` cuando el componente se monta o el usuario cambia.
  }, [user]);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Establece el elemento `anchorEl` como el objetivo del clic para abrir el menú desplegable.
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Cierra el menú desplegable estableciendo `anchorEl` en `null`.
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
    // Alterna el estado de `drawerOpen` para abrir o cerrar el menú lateral (drawer).
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Navega a la ruta especificada por `path`.

    if (isMobile) {
      setDrawerOpen(false);
      // Si es un dispositivo móvil, cierra el drawer después de la navegación.
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Intenta cerrar la sesión del usuario utilizando la función `logout`.

      navigate("/login");
      // Redirige al usuario a la página de inicio de sesión después de cerrar sesión.
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Si ocurre un error al cerrar sesión, se muestra en la consola.
    }

    handleMenuClose();
    // Cierra el menú desplegable después de cerrar sesión.

    if (isMobile) {
      setDrawerOpen(false);
      // Si es un dispositivo móvil, cierra el drawer después de cerrar sesión.
    }
  };

  if (!user) {
    return null;
    // Si no hay un usuario autenticado, no renderiza nada (retorna `null`).
  }

  const menuItems = [
    { text: 'Nuevo Piso', icon: <Add />, onClick: () => handleNavigation("/new-flat") },
    { text: 'Pisos Favoritos', icon: <Favorite />, onClick: () => handleNavigation("/favorite-flats") },
    { text: 'Mis Pisos', icon: <Home />, onClick: () => handleNavigation("/my-flats") },
  ];
  // Define los elementos del menú con su texto, icono y función `onClick` para la navegación.

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item, index) => (
          <ListItem button key={index} onClick={item.onClick}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  // Define el contenido del drawer (menú lateral) con una lista de elementos del menú.

  return (
    <AppBar position="static" sx={{ backgroundColor: "#fff8ec", color: "#114C5F" }}>
      <Toolbar>
        <IconButton
          edge="start"
          sx={{ color: "#114C5F", marginRight: 2 }}
          aria-label="apartment"
          onClick={() => handleNavigation("/")}
        >
          <Apartment />
        </IconButton>
        {/*Botón de icono con un icono de apartamento para navegar a la página de inicio.*/}
        

        <Typography variant="h6" component="h6" sx={{ flexGrow: 1, fontFamily: "" }}>
          <Link to="/" style={{ color: "#114C5F", textDecoration: "none" }} onClick={() => handleNavigation("/")}>
            FLATFINDER
          </Link>
        </Typography>
         {/*Título de la aplicación que funciona como un enlace para volver a la página principal.*/}
        

        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <>
            {menuItems.map((item, index) => (
              <Button
                key={index}
                color="inherit"
                startIcon={item.icon}
                sx={{ marginRight: 2, color: "#114C5F" }}
                onClick={item.onClick}
              >
                {item.text}
              </Button>
            ))}
          </>
        )}
        {/* Si es móvil, muestra un botón para abrir el drawer, de lo contrario muestra los botones del menú directamente en la barra de navegación.*/}
       

        <NotificationMessages />
        {/*Componente para mostrar mensajes de notificación.*/}
        

        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
          {!isMobile && (
            <Typography variant="body2" sx={{ marginRight: 1 }}>
              Hola, {user.firstName}
            </Typography>
          )}
          <IconButton
            edge="end"
            sx={{ color: "#114C5F" }}
            onClick={handleAvatarClick}
          >
            {avatarLoading ? (
              <CircularProgress size={40} />
            ) : (
              <Avatar
                alt="Avatar del Usuario"
                src={userAvatar}
              />
            )}
          </IconButton>
        </Box>
        {/*Muestra el avatar del usuario o un indicador de carga mientras se carga el avatar.*/}
        

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { handleNavigation("/profile"); handleMenuClose(); }}>Perfil</MenuItem>
          {user.rol === 'admin' && (
            <MenuItem onClick={() => { handleNavigation("/all-users"); handleMenuClose(); }}>Todos los Usuarios</MenuItem>
          )}
          <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
        </Menu>
              {/*Menú desplegable que muestra opciones como Perfil, Todos los Usuarios (solo si el usuario es admin), y Cerrar Sesión.*/}
      </Toolbar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
      {/*Drawer (menú lateral) que se abre en dispositivos móviles, con los mismos elementos que en el menú superior.*/}
    </AppBar>
  );
}

export default Navbar;
// Exporta el componente `Navbar` para ser utilizado en otras partes de la aplicación.
