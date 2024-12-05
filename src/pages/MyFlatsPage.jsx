// Importaciones necesarias
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { getFlatsByUser, deleteFlat } from '../services/firebaseFlats';
import FlatView from '../components/Flats/FlatView';
import { CircularProgress, Typography, Box } from '@mui/material';

// Definición del componente MyFlatsPage
function MyFlatsPage() {
    // Obtener el usuario actual del contexto de autenticación
    const { user } = useAuth();
    // Hook para la navegación
    const navigate = useNavigate();
    // Estados para manejar los pisos, carga y errores
    const [flats, setFlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Efecto para cargar los pisos del usuario
    useEffect(() => {
        async function loadFlats() {
            if (user) {
                try {
                    const userFlats = await getFlatsByUser(user.id);
                    setFlats(userFlats);
                } catch (err) {
                    console.error("Error loading flats:", err);
                    setError("No se pudieron cargar los pisos. Por favor, intente de nuevo más tarde.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("Por favor, inicie sesión para ver sus pisos.");
            }
        }

        loadFlats();
    }, [user]);

    // Función para manejar la edición de un piso
    const handleEdit = (flat) => {
        navigate(`/edit-flat/${flat.id}`);
    };

    // Función para manejar la eliminación de un piso
    const handleDelete = async (flatId) => {
        if (window.confirm("¿Está seguro de que desea eliminar este piso?")) {
            try {
                await deleteFlat(flatId);
                setFlats(flats.filter(flat => flat.id !== flatId));
            } catch (error) {
                console.error("Error deleting flat:", error);
                setError("No se pudo eliminar el piso. Por favor, intente de nuevo.");
            }
        }
    };

    // Renderizado condicional para el estado de carga
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Renderizado condicional para el estado de error
    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    // Renderizado principal del componente
    return (
        <Box padding={3}>
            <Typography variant="h4" component="h1" gutterBottom>
                Mis Pisos
            </Typography>
            {flats.length === 0 ? (
                <Typography>Aún no ha añadido ningún piso.</Typography>
            ) : (
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
                    gap={3}
                >
                    {flats.map(flat => (
                        <FlatView 
                            key={flat.id} 
                            flat={flat} 
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            showActions={true}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default MyFlatsPage;