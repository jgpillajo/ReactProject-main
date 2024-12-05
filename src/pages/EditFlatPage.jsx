// Importaciones necesarias
import React from 'react';
import { useParams } from 'react-router-dom';
import FlatForm from '../components/Flats/FlatForm';
import { Typography, Container, Paper } from '@mui/material';

// Definición del componente EditFlatPage
function EditFlatPage() {
    // Obtiene el ID del piso de los parámetros de la URL
    const { id } = useParams();

    // Renderizado del componente
    return (
        // Contenedor principal con ancho máximo establecido
        <Container component="main" maxWidth="sm">
            {/* Papel elevado para dar efecto de tarjeta */}
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                {/* Título de la página */}
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    Editar Piso
                </Typography>
                {/* Componente de formulario de piso, pasando el ID como prop */}
                <FlatForm flatId={id} />
            </Paper>
        </Container>
    );
}

export default EditFlatPage;