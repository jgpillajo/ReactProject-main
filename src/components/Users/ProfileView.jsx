// Importaciones necesarias de React y Material-UI
import React from 'react';
import { Card, CardContent, CardActions, Button, Typography, Avatar } from '@mui/material';
// Importación del hook personalizado de autenticación
import { useAuth } from '../../contexts/authContext';
// Importación del hook de navegación de react-router-dom
import { useNavigate } from 'react-router-dom';

// Definición del componente ProfileView
const ProfileView = () => {
    // Obtención del usuario del contexto de autenticación
    const { user } = useAuth();
    // Hook para la navegación
    const navigate = useNavigate();

    // Si no hay datos de usuario, mostrar un mensaje de carga
    if (!user) {
        return <Typography variant="h6">Cargando datos del usuario...</Typography>;
    }

    // Función para manejar la actualización del perfil
    const handleUpdateProfile = () => {
        navigate('/update-profile');
    };

    // Renderizado del componente
    return (
        <Card sx={{ maxWidth: 345, margin: 'auto', marginTop: 4 }}>
            <CardContent>
                {/* Avatar del usuario */}
                <Avatar
                    src={user.imageUid ? `https://firebasestorage.googleapis.com/v0/b/gs://reactproject-9049c.appspot.com/o/${encodeURIComponent(user.imageUid)}?alt=media` : undefined}
                    alt={`${user.firstName} ${user.lastName}`}
                    sx={{ width: 100, height: 100, margin: 'auto', marginBottom: 2 }}
                />
                {/* Nombre del usuario */}
                <Typography variant="h5" component="div" gutterBottom>
                    {user.firstName} {user.lastName}
                </Typography>   
                {/* Email del usuario */}
                <Typography variant="body2" color="text.secondary">
                    Email: {user.email}
                </Typography>
                {/* Fecha de nacimiento del usuario */}
                <Typography variant="body2" color="text.secondary">
                    Fecha de Nacimiento: {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'No proporcionada'}
                </Typography>
            </CardContent>
            <CardActions>
                {/* Botón para actualizar el perfil */}
                <Button size="small" color="primary" onClick={handleUpdateProfile}>
                    Actualizar Perfil
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProfileView;