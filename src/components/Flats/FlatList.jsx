// Importación de React
import React from 'react';
// Importación del componente FlatView (asumimos que está en el mismo directorio)
import FlatView from './FlatView';
// Importación del componente Box de Material-UI para crear un grid responsivo
import { Box } from '@mui/material';

// Definición del componente FlatList como una función de React
// Recibe un array 'flats' como prop, que contiene los datos de los pisos
export default function FlatList({ flats }) {
    return (
        // Utilizamos el componente Box de Material-UI para crear un contenedor grid responsivo
        <Box 
            sx={{
                display: 'grid',
                // Definimos cómo se comportará el grid en diferentes tamaños de pantalla
                gridTemplateColumns: {
                    xs: '1fr',                    // 1 columna en pantallas extra pequeñas
                    sm: 'repeat(2, 1fr)',         // 2 columnas en pantallas pequeñas
                    md: 'repeat(3, 1fr)',         // 3 columnas en pantallas medianas
                    lg: 'repeat(4, 1fr)',         // 4 columnas en pantallas grandes
                },
                gap: 3,  // Espacio entre los elementos del grid
                padding: 3,  // Padding alrededor del grid
            }}
        >
            {/* Mapeamos sobre el array de pisos y renderizamos un componente FlatView para cada uno */}
            {flats.map((flat) => (
                // Utilizamos el id del piso como key para optimizar el renderizado
                <FlatView key={flat.id} flat={flat} />
            ))}
        </Box>
    );
}