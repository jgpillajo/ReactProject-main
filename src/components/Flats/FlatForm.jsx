// Importaciones necesarias de React y react-router-dom
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importaciones de componentes de Material-UI
import { 
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Container,
  Snackbar,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Importaciones para el selector de fecha
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Importaciones de servicios y contextos personalizados
import { createFlat, updateFlat, uploadFlatImage, getFlatByID } from '../../services/firebaseFlats';
import { useAuth } from '../../contexts/authContext';

// Componente principal FlatForm
const FlatForm = ({ flatId }) => {
  // Obtiene el usuario del contexto de autenticación
  const { user } = useAuth();

  // Hook para la navegación programática
  const navigate = useNavigate();

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    streetName: '',
    streetNumber: '',
    areaSize: '',
    hasAC: false,
    yearBuilt: '',
    rentPrice: '',
    dateAvailable: null,
    description: '',
  });
  
  // Estados para manejar la imagen, carga, errores y éxito
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(!!flatId);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Efecto para cargar los datos del piso si se está editando
  useEffect(() => {
    const loadFlatData = async () => {
      if (flatId) {
        try {
          const flatData = await getFlatByID(flatId);
          if (flatData) {
            setFormData({
              ...flatData,
              dateAvailable: flatData.dateAvailable ? new Date(flatData.dateAvailable.seconds * 1000) : null,
            });
          }
        } catch (err) {
          console.error("Error al cargar los datos del piso:", err);
          setError("No se pudieron cargar los datos del piso. Por favor, inténtelo de nuevo.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadFlatData();
  }, [flatId]);

  // Nueva función auxiliar para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Manejador modificado para cambios en los campos del formulario
  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    let newValue = value;

    if (name === 'city' || name === 'country') {
      newValue = capitalizeFirstLetter(value);
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : newValue
    }));
  };

  // Manejador para cambios en la fecha
  const handleDateChange = (date) => {
    setFormData(prevState => ({
      ...prevState,
      dateAvailable: date
    }));
  };

  // Manejador para cambios en la imagen
  const handleImageChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  // Manejador para el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setError('Debe estar conectado para realizar esta acción.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (flatId) {
        // Actualizar piso existente
        await updateFlat(flatId, formData);
        if (image) {
          const imageUrl = await uploadFlatImage(flatId, image);
          await updateFlat(flatId, { imageURL: imageUrl });
        }
        setSuccess('¡Piso actualizado con éxito!');
      } else {
        // Crear nuevo piso
        const flatRef = await createFlat(formData, user.id);
        if (image) {
          const imageUrl = await uploadFlatImage(flatRef.id, image);
          await updateFlat(flatRef.id, { imageURL: imageUrl });
        }
        setSuccess('¡Piso creado con éxito!');
      }
      // Redirigir a la página de "mis pisos" después de 2 segundos
      setTimeout(() => navigate('/my-flats'), 2000);
    } catch (error) {
      console.error('Error al procesar el piso:', error);
      setError(`No se pudo ${flatId ? 'actualizar' : 'crear'} el piso. Por favor, inténtelo de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar spinner de carga mientras se cargan los datos
  if (loading) {
    return (
      <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Renderizado del formulario
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem' }}>
        <Typography variant="h4" gutterBottom align="center">
          {flatId ? 'Actualizar Piso' : 'Crear Nuevo Piso'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Campo Ciudad */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="city"
                label="Ciudad"
                fullWidth
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo País */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="country"
                label="País"
                fullWidth
                value={formData.country}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo Nombre de la Calle */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="streetName"
                label="Nombre de la Calle"
                fullWidth
                value={formData.streetName}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo Número de la Calle */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="streetNumber"
                label="Número de la Calle"
                fullWidth
                value={formData.streetNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo Tamaño del Área */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="areaSize"
                label="Tamaño del Área (m²)"
                fullWidth
                type="number"
                value={formData.areaSize}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo Año de Construcción */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="yearBuilt"
                label="Año de Construcción"
                fullWidth
                type="number"
                value={formData.yearBuilt}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo Precio de Alquiler */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="rentPrice"
                label="Precio de Alquiler"
                fullWidth
                type="number"
                value={formData.rentPrice}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo Fecha Disponible */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha Disponible"
                  value={formData.dateAvailable}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            {/* Campo Tiene Aire Acondicionado */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasAC}
                    onChange={handleChange}
                    name="hasAC"
                    color="primary"
                  />
                }
                label="Tiene Aire Acondicionado"
              />
            </Grid>
            {/* Campo Descripción */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descripción"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Campo para subir imagen */}
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="raised-button-file">
                <Button variant="outlined" component="span" fullWidth>
                  {flatId ? 'Subir Nueva Imagen' : 'Subir Imagen'}
                </Button>
              </label>
              {image && <Typography variant="body2" style={{ marginTop: '0.5rem' }}>{image.name}</Typography>}
              {formData.imageURL && !image && (
                <Typography variant="body2" style={{ marginTop: '0.5rem' }}>Imagen actual: {formData.imageURL}</Typography>
              )}
            </Grid>
            {/* Botón de envío */}
            <Grid item xs={12}>
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (flatId ? 'Actualizar Piso' : 'Crear Piso')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      {/* Snackbar para mostrar mensajes de éxito o error */}
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={!!error || success}
        autoHideDuration={6000}
        onClose={() => { setError(null); setSuccess(false); }}
        message={error || success}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => { setError(null); setSuccess(false); }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
};

export default FlatForm;