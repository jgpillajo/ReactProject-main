// Importaciones necesarias
import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { db } from '../../config/firebase';
import { collection, query, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { getFlatsByUser } from '../../services/firebaseFlats';

// Definición del componente NotificationMessages
const NotificationMessages = () => {
  // Estados para manejar las notificaciones y el ancla del popover
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Obtener el usuario actual y la función de navegación
  const { user } = useAuth();
  const navigate = useNavigate();

  // Efecto para cargar y suscribirse a las notificaciones
  useEffect(() => {
    if (user) {
      let unsubscribes = [];

      const fetchFlatsAndSubscribe = async () => {
        try {
          // Obtener los pisos del usuario
          const userFlats = await getFlatsByUser(user.id);
          console.log("User flats:", userFlats);

          // Para cada piso, suscribirse a los mensajes
          userFlats.forEach(flat => {
            console.log("Subscribing to messages for flat:", flat.id);
            const q = query(
              collection(db, `flats/${flat.id}/messages`),
              orderBy('createdAt', 'desc'),
              limit(20)
            );

            // Crear un listener para los mensajes de cada piso
            const unsubscribe = onSnapshot(q, 
              (querySnapshot) => {
                console.log("Snapshot received for flat:", flat.id);
                const newNotifications = querySnapshot.docs
                  .map(doc => ({
                    id: doc.id,
                    flatId: flat.id,
                    flatName: flat.streetName || 'Unknown Flat',
                    ...doc.data()
                  }))
                  .filter(notification => 
                    notification.userId !== user.id && !notification.read
                  );
                console.log("Filtered notifications for flat:", flat.id, newNotifications);

                // Actualizar el estado de las notificaciones
                setNotifications(prev => {
                  const updatedNotifications = [...prev.filter(n => n.flatId !== flat.id), ...newNotifications];
                  return updatedNotifications.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
                });
              },
              (error) => {
                console.error("Error in onSnapshot for flat", flat.id, ":", error);
              }
            );

            unsubscribes.push(unsubscribe);
          });
        } catch (error) {
          console.error("Error fetching flats:", error);
        }
      };

      fetchFlatsAndSubscribe();

      // Limpiar las suscripciones al desmontar el componente
      return () => {
        console.log("Unsubscribing from all listeners");
        unsubscribes.forEach(unsubscribe => unsubscribe());
      };
    }
  }, [user]);

  // Manejador para abrir el popover de notificaciones
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Manejador para cerrar el popover de notificaciones
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Manejador para cuando se hace clic en una notificación
  const handleNotificationClick = async (notification) => {
    console.log("Notification clicked:", notification);
    try {
      // Marcar el mensaje como leído
      const messageRef = doc(db, `flats/${notification.flatId}/messages`, notification.id);
      await updateDoc(messageRef, { read: true });

      // Actualizar el estado local de las notificaciones
      setNotifications(prev => prev.filter(n => n.id !== notification.id));

      // Navegar al piso correspondiente
      navigate(`/flat/${notification.flatId}`);
      handleClose();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Control del estado del popover
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  console.log("Current notifications state:", notifications);

  // Renderizado del componente
  return (
    <>
      {/* Icono de notificaciones con badge */}
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      {/* Popover con la lista de notificaciones */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <ListItem 
                key={notification.id} 
                button 
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemText 
                  primary={`Nuevo mensaje en ${notification.flatName}`}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {notification.userName}: 
                      </Typography>
                      {" " + notification.text}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No tienes notificaciones nuevas" />
            </ListItem>
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationMessages;