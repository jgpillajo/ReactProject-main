import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Avatar, 
  Grid,
  Box,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Person as PersonIcon } from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';
import { getUserByID } from '../services/firebase';

// Función auxiliar para formatear la fecha
const formatDate = (timestamp) => {
  if (!timestamp) return 'No proporcionado';
  
  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    // Si es un objeto con seconds, asumimos que es un timestamp de Firestore
    date = new Date(timestamp.seconds * 1000);
  } else {
    return 'Fecha inválida';
  }

  // Formatea la fecha en español
  return date.toLocaleDateString('es-ES', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
};

// Función para construir la URL del avatar
const getAvatarUrl = (imageUid) => {
  if (!imageUid) return null;
  return `https://firebasestorage.googleapis.com/v0/b/reactproject-9049c.appspot.com/o/${encodeURIComponent(imageUid)}?alt=media`;
};

export default function ProfilePage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                if (id && id !== currentUser?.id) {
                    const userData = await getUserByID(id);
                    setProfileUser(userData);
                } else {
                    setProfileUser(currentUser);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, currentUser]);

    const handleUpdateProfile = () => {
        navigate('/update-profile');
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Typography color="error" align="center">{error}</Typography>
            </Container>
        );
    }

    if (!profileUser) {
        return (
            <Container maxWidth="sm">
                <Typography align="center">Usuario no encontrado.</Typography>
            </Container>
        );
    }

    const avatarUrl = getAvatarUrl(profileUser.imageUid);
    const isOwnProfile = currentUser?.id === profileUser.id;

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4, mb: 4 }}>
                {isOwnProfile ? 'Tu Perfil' : 'Perfil de Usuario'}
            </Typography>
            <Card raised>
                <CardContent>
                    <Box display="flex" justifyContent="center" mb={3}>
                        <Avatar
                            src={avatarUrl}
                            alt={`${profileUser.firstName} ${profileUser.lastName}`}
                            sx={{ width: 200, height: 200 }}
                        >
                            {!avatarUrl && <PersonIcon sx={{ fontSize: 80 }} />}
                        </Avatar>
                    </Box>
                    <Typography variant="h5" component="div" gutterBottom align="center">
                        {profileUser.firstName} {profileUser.lastName}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" color="text.secondary">
                                Correo Electrónico
                            </Typography>
                            <Typography variant="body1">
                                {profileUser.email}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" color="text.secondary">
                                Fecha de Nacimiento
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(profileUser.birthDate)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" color="text.secondary">
                                Rol
                            </Typography>
                            <Typography variant="body1">
                                {profileUser.rol || 'Usuario'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
                {isOwnProfile && (
                    <CardActions sx={{ justifyContent: 'center', padding: 2 }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<EditIcon />}
                            onClick={handleUpdateProfile}
                            fullWidth
                        >
                            Actualizar Perfil
                        </Button>
                    </CardActions>
                )}
            </Card>
        </Container>
    );
}