// Importaciones necesarias de React y Material-UI
import React from 'react';
import { Card, CardMedia, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// Importaciones de iconos de Material-UI
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Definición del componente FlatView
export default function FlatView({ 
  flat,  // Datos del piso
  onEdit,  // Función para manejar la edición
  onDelete,  // Función para manejar la eliminación
  showActions = false,  // Booleano para mostrar/ocultar acciones de edición/eliminación
  isFavorite = false,  // Booleano para indicar si el piso es favorito
  onToggleFavorite  // Función para alternar el estado de favorito
}) {
    const navigate = useNavigate();

    // Manejador para el clic en el icono de favorito
    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onToggleFavorite(flat.id);
    };

    // Manejador para el clic en la tarjeta
    const handleCardClick = () => {
        navigate(`/flat/${flat.id}`);
    };

    // Función para formatear la fecha
    const formatDate = (timestamp) => {
        if (!timestamp) return 'No disponible';
        if (timestamp && typeof timestamp.toDate === 'function') {
            const date = timestamp.toDate();
            return date.toLocaleDateString();
        }
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
            <Card 
                sx={{ 
                    boxShadow: 3, 
                    padding: 2, 
                    borderRadius: 2, 
                    maxWidth: 300, 
                    height: 'auto',
                    textAlign: 'center', 
                    backgroundColor: 'rgba(242, 230, 207, 0.3)',
                    cursor: 'pointer',
                    '&:hover': {
                        boxShadow: 6,
                    },
                }}
                onClick={handleCardClick}
            >
                {/* Imagen del piso */}
                <CardMedia
                    component="img"
                    image={flat.imageURL || 'https://via.placeholder.com/300x200'}
                    alt={`${flat.streetName} ${flat.streetNumber}`}
                    sx={{ borderRadius: 1, height: 200, objectFit: 'cover', margin: '0 auto' }}
                />
                {/* Dirección del piso */}
                <Typography variant="body2" component="p" sx={{ color: "gray", mt: 1 }}>
                    {flat.streetName || 'N/A'}, {flat.streetNumber || 'N/A'}
                </Typography>
                {/* Ciudad y país del piso */}
                <Typography variant='h6' component="h3" sx={{ mt: 0.5 }}>
                    {flat.city || 'N/A'}, {flat.country || 'N/A'}
                </Typography>
                {/* Descripción y año de construcción */}
                <Typography variant="body2" component="p" sx={{ mt: 0.5 }}>
                    {flat.description || 'No description available'}, construido en {flat.yearBuilt || 'N/A'}
                </Typography>

                {/* Características del piso */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                    {/* Fecha disponible */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 18, color: '#114C5F' }} />
                        <Typography variant="body2" component="p">
                            {formatDate(flat.dateAvailable)}
                        </Typography>
                    </Box>
                    {/* Aire acondicionado */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AcUnitIcon sx={{ mr: 0.5, fontSize: 18, color: '#114C5F' }} />
                        <Typography variant="body2" component="p">
                            {flat.hasAC ? 'Tiene AC' : 'No tiene AC'}
                        </Typography>
                    </Box>
                    {/* Tamaño del área */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ZoomOutMapIcon sx={{ mr: 0.5, fontSize: 18, color: '#114C5F' }} />
                        <Typography variant="body2" component="p">
                            {flat.areaSize || 'N/A'} m²
                        </Typography>
                    </Box>
                </Box>

                {/* Precio y botón de favorito */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6" component="p" sx={{ fontSize: '1.7rem', paddingLeft: 1.5, paddingTop: 2.5 }}>
                        ${flat.rentPrice || 'N/A'}
                    </Typography>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer', 
                            color: isFavorite ? 'red' : 'inherit' 
                        }} 
                        onClick={handleFavoriteClick}
                    >
                        {isFavorite ? (
                            <FavoriteIcon sx={{ fontSize: 24, color: 'red', paddingTop: 2.5 }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 24, paddingTop: 2.5 }} />
                        )}
                        <Typography variant="body2" component="p" sx={{ ml: 0.5, fontSize: '1rem', paddingTop: 2.5 }}>
                            {isFavorite ? 'Favorito' : 'Marcar como favorito'}
                        </Typography>
                    </Box>
                </Box>

                {/* Botones de edición y eliminación (condicionales) */}
                {showActions && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            startIcon={<EditIcon />}
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(flat);
                            }}
                        >
                            Editar
                        </Button>
                        <Button
                            startIcon={<DeleteIcon />}
                            variant="contained"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(flat.id);
                            }}
                        >
                            Eliminar
                        </Button>
                    </Box>
                )}
            </Card>
        </Box>
    );
}