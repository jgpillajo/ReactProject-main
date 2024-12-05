// Importaciones necesarias
import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonWrapper, ContainerImage, ContentWrapper, Title, Overlay } from '../pages/HomePages';
import FlatView from '../components/Flats/FlatView';
import { Box, Grid, Typography, Select, MenuItem, TextField, Skeleton, Paper, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { getAllFlatsWithOwners, addToFavorites, removeFavorite } from '../services/firebaseFlats';
import { useAuth } from '../contexts/authContext';
import {  LocationCity, AttachMoney, SquareFoot, DeleteOutline } from '@mui/icons-material';

function HomePage() {
  // Estados para los filtros y datos
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const { user } = useAuth();

  // Efecto para cargar los pisos
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        setLoading(true);
        const flatsData = await getAllFlatsWithOwners();
        if (user && user.favorites) {
          flatsData.forEach(flat => {
            flat.isFavorite = user.favorites.includes(flat.id);
          });
        }
        setFlats(flatsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching flats:", err);
        setError("Error al cargar los flats. Por favor, intente de nuevo más tarde.");
        setLoading(false);
      }
    };

    fetchFlats();
  }, [user]);

  // Función para manejar la adición/eliminación de favoritos
  const handleToggleFavorite = async (flatId) => {
    if (!user) {
      alert("Por favor, inicia sesión para agregar favoritos.");
      return;
    }

    try {
      const flat = flats.find(f => f.id === flatId);
      if (flat.isFavorite) {
        await removeFavorite(user.id, flatId);
      } else {
        await addToFavorites(user.id, flatId);
      }
      
      setFlats(prevFlats => prevFlats.map(f => 
        f.id === flatId ? { ...f, isFavorite: !f.isFavorite } : f
      ));
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Hubo un error al actualizar los favoritos. Por favor, intenta de nuevo.");
    }
  };

  // Función para desplazarse a la lista de pisos
  const scrollToFlatList = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Función para limpiar los filtros
  const clearFilters = () => {
    setSelectedCity('');
    setMaxPrice('');
    setMinArea('');
  };

  // Filtrado de pisos basado en los criterios seleccionados
  const filteredFlats = flats.filter(flat => {
    const cityMatch = selectedCity === '' || flat.city === selectedCity;
    const priceMatch = maxPrice === '' || parseInt(flat.rentPrice) <= parseInt(maxPrice);
    const areaMatch = minArea === '' || parseInt(flat.areaSize) >= parseInt(minArea);
    
    return cityMatch && priceMatch && areaMatch;
  });

  // Función para obtener el nombre completo del usuario
  const getUserFullName = () => {
    if (user && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user && user.firstName) {
      return user.firstName;
    } else if (user && user.email) {
      return user.email.split('@')[0];
    }
    return '';
  };

  // Componente para mostrar un esqueleto de carga
  const LoadingSkeleton = () => (
    <Box sx={{ padding: '20px' }}>
      <Grid container spacing={3}>
        {[...Array(8)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Box sx={{ width: '100%', marginRight: 0, my: 5 }}>
              <Skeleton variant="rectangular" width="100%" height={118} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Renderizado del componente
  return (
    <div>
      {/* Sección de bienvenida */}
      <ContainerImage>
        <Overlay />
        <ContentWrapper>
          <Title>
            Bienvenido {getUserFullName()} <br />
            Te ayudamos a encontrar tu FLAT
          </Title>
          <ButtonWrapper>
            <Button onClick={scrollToFlatList}>Ver Flats</Button>
          </ButtonWrapper>
        </ContentWrapper>
      </ContainerImage>

      {/* Sección de filtros */}
      <Paper elevation={3} sx={{ margin: '20px', padding: '20px' }}>
        <Typography variant="h6" gutterBottom>Filtrar Flats</Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Filtro de ciudad */}
          <Grid item xs={12} sm={6} md={3}>
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              displayEmpty
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <LocationCity />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Todas las ciudades</em>
              </MenuItem>
              <MenuItem value="Quito">Quito</MenuItem>
              <MenuItem value="Guayaquil">Guayaquil</MenuItem>
              <MenuItem value="Cuenca">Cuenca</MenuItem>
              <MenuItem value="Manta">Manta</MenuItem>
              <MenuItem value="Ambato">Ambato</MenuItem>
              <MenuItem value="Loja">Loja</MenuItem>
              <MenuItem value="Esmeraldas">Esmeraldas</MenuItem>
              <MenuItem value="Ibarra">Ibarra</MenuItem>
            </Select>
          </Grid>
          {/* Filtro de precio máximo */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Precio máximo"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* Filtro de área mínima */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                type="number"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                placeholder="Área mínima (m²)"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SquareFoot />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
              />
              <Tooltip title="Limpiar filtros">
                <IconButton onClick={clearFilters} color="primary" sx={{ ml: 1 }}>
                  <DeleteOutline />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de pisos */}
      <Box ref={flatListRef} sx={{ padding: '20px' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <Typography variant="h6" align="center" color="error" sx={{ marginTop: '20px' }}>
            {error}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredFlats.map(flat => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={flat.id}>
                <FlatView 
                  flat={flat}
                  isFavorite={flat.isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        )}
        {!loading && !error && filteredFlats.length === 0 && (
          <Typography variant="h6" align="center" sx={{ marginTop: '20px' }}>
            No se encontraron flats que coincidan con los criterios de búsqueda.
          </Typography>
        )}
      </Box>
    </div>
  );
}

export default HomePage;