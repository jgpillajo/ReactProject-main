// Importaciones necesarias
import React from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/Users/UserForm';
import { Container, Typography, Button } from '@mui/material';

// Definición del componente UpdateProfilePage
export default function UpdateProfilePage() {
    // Obtener el usuario del contexto de autenticación
    const { user } = useAuth();
    // Hook para la navegación
    const navigate = useNavigate();

    // Renderizado condicional si no hay usuario
    if (!user) {
        return <Typography variant="h6">Cargando datos del usuario...</Typography>;
    }

    // Función para manejar la cancelación de la actualización
    const handleCancel = () => {
        navigate('/profile');
    };

    // Renderizado principal del componente
    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
                Actualizar Tu Perfil
            </Typography>
            {/* Renderizar el formulario de usuario pasando el ID del usuario actual */}
            <UserForm userId={user.id} />
            {/* Botón para cancelar la actualización */}
            <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleCancel}
                fullWidth
                sx={{ mt: 2 }}
            >
                Cancelar
            </Button>
        </Container>
    );
}