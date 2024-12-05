// Importaciones necesarias de React y react-router-dom
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Importación de styled-components para estilos
import styled from 'styled-components';
// Importación de CircularProgress de Material-UI para el indicador de carga
import { CircularProgress } from '@mui/material';
// Importación de funciones de autenticación desde los servicios de Firebase
import { authenticateUser, sendPasswordResetEmail } from '../../services/firebase';

// Definición de componentes estilizados usando styled-components

// Contenedor principal de la página
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%);
`;

// Contenedor del formulario
const FormContainer = styled.div`
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
`;

// Estilo para el título del formulario
const Title = styled.h2`
  font-size: 32px;
  margin-bottom: 30px;
  text-align: center;
`;

// Estilo para los campos de entrada
const StyledField = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #f06292;
  }
`;

// Estilo para mensajes de error
const StyledErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: -15px;
  margin-bottom: 15px;
  text-align: center;
`;

// Estilo para mensajes de éxito
const StyledSuccessMessage = styled.div`
  color: #4caf50;
  font-size: 14px;
  margin-top: -15px;
  margin-bottom: 15px;
  text-align: center;
`;

// Estilo para el botón de envío
const SubmitButton = styled.button`
  background-color: #f06292;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  &:hover {
    background-color: #ec407a;
  }
  &:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
  }
`;

// Estilo para el enlace de registro
const StyledLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #f06292;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// Estilo para el enlace de "Olvidé mi contraseña"
const ForgotPasswordLink = styled.span`
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #f06292;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

// Definición del componente LoginForm
const LoginForm = () => {
  // Estados para manejar email y password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Estado para manejar la carga
  const [loading, setLoading] = useState(false);
  // Estado para manejar errores
  const [error, setError] = useState(null);
  // Estado para controlar si estamos en modo de restablecimiento de contraseña
  const [resetMode, setResetMode] = useState(false);
  // Estado para manejar el éxito del restablecimiento de contraseña
  const [resetSuccess, setResetSuccess] = useState(false);
  // Hook para la navegación
  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSuccess(false);
    try {
      if (resetMode) {
        // Lógica para restablecer la contraseña
        const result = await sendPasswordResetEmail(email);
        if (result.success) {
          setResetSuccess(true);
          setResetMode(false);
        } else {
          setError(result.message);
        }
      } else {
        // Lógica para iniciar sesión
        const user = await authenticateUser(email, password);
        if (user) {
          navigate('/');
        } else {
          setError('No se encontraron las credenciales. Por favor, verifica tu usuario y contraseña.');
        }
      }
    } catch (err) {
      // Manejo de errores
      setError(resetMode ? 'Error al procesar la solicitud de restablecimiento de contraseña.' : 'Usuario o contraseña incorrecta. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para alternar entre modo de inicio de sesión y restablecimiento de contraseña
  const toggleResetMode = () => {
    setResetMode(!resetMode);
    setError(null);
    setResetSuccess(false);
  };

  // Renderizado del componente
  return (
    <PageContainer>
      <FormContainer>
        <Title>{resetMode ? 'Recuperar Contraseña' : 'Login'}</Title>
        <form onSubmit={handleSubmit}>
          {/* Mostrar mensaje de error si existe */}
          {error && <StyledErrorMessage>{error}</StyledErrorMessage>}
          {/* Mostrar mensaje de éxito si se ha enviado el correo de recuperación */}
          {resetSuccess && <StyledSuccessMessage>Se ha enviado un correo de recuperación. Por favor, revisa tu bandeja de entrada.</StyledSuccessMessage>}
          {/* Campo de entrada para el email */}
          <StyledField
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          {/* Campo de entrada para la contraseña (solo si no estamos en modo de restablecimiento) */}
          {!resetMode && (
            <StyledField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          )}
          {/* Botón de envío */}
          <SubmitButton type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (resetMode ? 'Enviar Correo de Recuperación' : 'Sign In')}
          </SubmitButton>
        </form>
        {/* Enlace para alternar entre inicio de sesión y recuperación de contraseña */}
        <ForgotPasswordLink onClick={toggleResetMode}>
          {resetMode ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
        </ForgotPasswordLink>
        {/* Enlace para registrarse (solo si no estamos en modo de restablecimiento) */}
        {!resetMode && (
          <StyledLink to="/register">
            No tienes cuenta? Registrate
          </StyledLink>
        )}
      </FormContainer>
    </PageContainer>
  );
};

// Exportación del componente LoginForm
export default LoginForm;