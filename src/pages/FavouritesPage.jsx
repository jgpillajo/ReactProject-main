// Importaciones necesarias
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import FlatView from '../components/Flats/FlatView';
import { getUserFavorites, removeFavorite } from '../services/firebaseFlats';

// Definición del componente FavouritesPage
function FavouritesPage() {
  // Estado para almacenar los pisos favoritos
  const [favoriteFlats, setFavoriteFlats] = useState([]);
  // Estado para manejar la carga
  const [loading, setLoading] = useState(true);
  // Obtener el usuario actual del contexto de autenticación
  const { user } = useAuth();

  // Efecto para cargar los favoritos del usuario
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        setLoading(true);
        try {
          const favorites = await getUserFavorites(user.id);
          setFavoriteFlats(favorites);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Función para manejar la eliminación de un favorito
  const handleRemoveFavorite = async (flatId) => {
    try {
      await removeFavorite(user.id, flatId);
      setFavoriteFlats(prevFavorites => prevFavorites.filter(flat => flat.id !== flatId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // Renderizado condicional para el estado de carga
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Renderizado principal del componente
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Pisos Favoritos
      </Typography>
      {favoriteFlats.length === 0 ? (
        <Typography>No tienes pisos favoritos aún.</Typography>
      ) : (
        <Grid container spacing={3}>
          {favoriteFlats.map(flat => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={flat.id}>
              <FlatView 
                flat={flat} 
                isFavorite={true}
                onToggleFavorite={handleRemoveFavorite}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default FavouritesPage;