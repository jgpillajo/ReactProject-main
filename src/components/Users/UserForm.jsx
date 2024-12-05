// Importamos los módulos necesarios desde React, Formik, Yup, Material-UI, y Firebase
import React, { useState, useEffect } from 'react'; // React, useState y useEffect son hooks para manejar el estado y los efectos secundarios.
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Formik se utiliza para manejar formularios y validaciones.
import * as Yup from 'yup'; // Yup es una biblioteca de validación de esquemas que se utiliza junto con Formik.
import { TextField } from '@mui/material'; // TextField es un componente de Material-UI para crear campos de entrada.
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // DatePicker es un componente de Material-UI para seleccionar fechas.
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // Adaptador para usar funciones de fechas en DatePicker.
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Proveedor para localización en DatePicker.
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Métodos de Firebase para crear usuarios y actualizar perfiles.
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore'; // Métodos de Firebase para manejar documentos en Firestore.
import { ref, getDownloadURL } from 'firebase/storage'; // Métodos de Firebase para manejar archivos en Firebase Storage.
import { auth, db, storage } from '../../config/firebase'; // Importamos la configuración de Firebase desde un archivo local.
import { uploadUserImage } from '../../services/firebase'; // Función personalizada para subir imágenes de usuario a Firebase.
import { useNavigate } from 'react-router-dom'; // Hook de React Router para la navegación.

// Importamos componentes estilizados personalizados
import {
  PageContainer, FormContainer, Logo, Title, StyledField, StyledErrorMessage,
  SubmitButton, FileInputContainer, FileInputLabel, HiddenFileInput, FileName,
  ImagePreviewContainer, ImagePreview, FormGrid, FullWidthField
} from './UserForms'; // Importamos componentes estilizados desde un archivo local.

// Componente principal UserForm
const UserForm = ({ userId = null }) => {
  // Definimos el estado inicial del formulario, incluyendo campos como email, contraseña, nombre, etc.
  const [initialValues, setInitialValues] = useState({
    email: '', // Campo para el email del usuario
    password: '', // Campo para la contraseña
    confirmPassword: '', // Campo para confirmar la contraseña
    firstName: '', // Campo para el nombre del usuario
    lastName: '', // Campo para el apellido del usuario
    birthDate: null, // Campo para la fecha de nacimiento
    avatar: null // Campo para la imagen del avatar
  });

  // Estado para almacenar la vista previa de la imagen del avatar
  const [previewImage, setPreviewImage] = useState(null);

  // Hook de navegación para redirigir al usuario después de completar acciones
  const navigate = useNavigate();

  // useEffect para obtener datos del usuario si se proporciona un userId
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) { // Si existe un userId, buscamos los datos del usuario
        try {
          const userDoc = await getDoc(doc(db, 'users', userId)); // Obtenemos el documento del usuario desde Firestore
          if (userDoc.exists()) { // Si el documento existe
            const userData = userDoc.data(); // Obtenemos los datos del documento
            setInitialValues({
              ...initialValues,///se hace una copia de los valores o parametros de initialvalues y despues se sobreescribe con los datos del usuario
              email: userData.email, // Establecemos el email del usuario
              firstName: userData.firstName, // Establecemos el nombre del usuario
              lastName: userData.lastName, // Establecemos el apellido del usuario
              birthDate: userData.birthDate ? new Date(userData.birthDate.seconds * 1000) : null, // Convertimos la fecha de nacimiento desde Firebase Timestamp
            });
            if (userData.imageUid) { // Si el usuario tiene una imagen de avatar
              try {
                const imageUrl = await getDownloadURL(ref(storage, userData.imageUid)); // Obtenemos la URL de la imagen desde Firebase Storage
                setPreviewImage(imageUrl); // Establecemos la vista previa de la imagen
              } catch (error) {
                console.error('Error fetching image URL:', error); // Mostramos error si no se puede obtener la URL de la imagen
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error); // Mostramos error si falla la obtención de datos del usuario
        }
      }
    };

    fetchUserData(); // Llamamos a la función para obtener los datos del usuario
  }, [userId]); // Dependencia: se ejecuta cuando cambia userId

  // Esquema de validación de Yup para validar los datos del formulario
  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Email inválido').required('El email es requerido'), // Validamos el email
    password: userId
      ? Yup.string() // Si estamos actualizando un usuario, la contraseña no es requerida
      : Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres') // La contraseña debe tener al menos 6 caracteres
        .matches(/^(?=.*[!@#$%^&*])/, 'La contraseña debe incluir al menos un caracter especial') // Debe incluir un caracter especial
        .matches(/^(?=.*[A-Z])/, 'La contraseña debe incluir al menos una letra mayúscula') // Debe incluir una letra mayúscula
        .required('La contraseña es requerida'), // La contraseña es requerida para nuevos usuarios
    confirmPassword: userId
      ? Yup.string() // Si estamos actualizando, no necesitamos confirmar la contraseña
      : Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir') // Confirmar que las contraseñas coincidan
        .required('Confirmar la contraseña es requerido'), // Campo requerido para confirmar la contraseña
    firstName: Yup.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres') // El nombre debe tener al menos 2 caracteres
      .required('El nombre es requerido'), // El nombre es un campo requerido
    lastName: Yup.string()
      .min(2, 'El apellido debe tener al menos 2 caracteres') // El apellido debe tener al menos 2 caracteres
      .required('El apellido es requerido'), // El apellido es un campo requerido
    birthDate: Yup.date()
      .nullable()
      .required('La fecha de nacimiento es requerida') // La fecha de nacimiento es requerida
      .test('age', 'Debes tener entre 18 y 120 años', function (birthDate) {
        if (!birthDate) return false;
        const cutoff = new Date(); // Obtenemos la fecha actual
        const age = cutoff.getFullYear() - birthDate.getFullYear(); // Calculamos la edad
        return age >= 18 && age <= 120; // Validamos que la edad esté entre 18 y 120 años
      }),
    avatar: Yup.mixed()
      .test('fileSize', 'Archivo demasiado grande', (value) => {
        if (!value) return true; // Permitimos que no se seleccione un archivo
        return value && value.size <= 2000000; // Validamos que el archivo no sea mayor a 2MB
      })
  });

  // Función para manejar el envío del formulario
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Objeto con los datos del usuario que vamos a guardar en Firestore
      let userDataToSave = {
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        email: values.email,
        rol: 'usuario' // Asignamos un rol básico de "usuario"
      };

      if (!userId) { // Si no existe un userId, creamos un nuevo usuario
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password); // Creamos un nuevo usuario en Firebase Authentication
        userId = userCredential.user.uid; // Obtenemos el ID del usuario creado

        await updateProfile(userCredential.user, {
          displayName: `${values.firstName} ${values.lastName}` // Actualizamos el perfil del usuario con su nombre completo
        });

        await setDoc(doc(db, 'users', userId), userDataToSave); // Guardamos los datos del usuario en Firestore

        if (values.avatar) { // Si se ha subido una imagen de avatar
          const imageUid = await uploadUserImage(userId, values.avatar); // Subimos la imagen y obtenemos su UID
          await updateProfile(auth.currentUser, { photoURL: imageUid }); // Actualizamos el perfil del usuario con la URL de la imagen
        }

        alert('Usuario creado exitosamente'); // Mostramos un mensaje de éxito
        navigate('/'); // Redirigimos a la página principal
      } else { // Si existe un userId, actualizamos el usuario existente
        await updateDoc(doc(db, 'users', userId), userDataToSave); // Actualizamos los datos del usuario en Firestore

        if (values.avatar) { // Si se ha subido una nueva imagen de avatar
          const imageUid = await uploadUserImage(userId, values.avatar); // Subimos la nueva imagen
          await updateProfile(auth.currentUser, { photoURL: imageUid }); // Actualizamos el perfil del usuario con la nueva imagen
        }

        alert('Usuario actualizado exitosamente'); // Mostramos un mensaje de éxito
      }
    } catch (error) {
      console.error('Error al crear/actualizar usuario:', error); // Mostramos error si ocurre
      alert('Ocurrió un error al procesar la solicitud'); // Mostramos un mensaje de error al usuario
    } finally {
      setSubmitting(false); // Terminamos el proceso de envío del formulario
    }
  };

  // Función para manejar la selección de archivos para la imagen de avatar
  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0]; // Obtenemos el archivo seleccionado
    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // Establecemos la vista previa de la imagen
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Logo>
          <svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.375 13.0158V1.18326H2.4375V36.6808H12.1875V29.5813H14.625V36.6808H36.5625V13.0158H24.375ZM8.53125 31.9478H6.09375V29.5813H8.53125V31.9478ZM8.53125 26.0316H6.09375V23.6651H8.53125V26.0316ZM8.53125 20.1153H6.09375V17.7488H8.53125V20.1153ZM8.53125 14.199H6.09375V11.8325H8.53125V14.199ZM8.53125 8.28277H6.09375V5.91627H8.53125V8.28277ZM18.2812 5.91627H20.7188V8.28277H18.2812V5.91627ZM14.625 26.0316H12.1875V23.6651H14.625V26.0316ZM14.625 20.1153H12.1875V17.7488H14.625V20.1153ZM14.625 14.199H12.1875V11.8325H14.625V14.199ZM14.625 8.28277H12.1875V5.91627H14.625V8.28277ZM20.7188 31.9478H18.2812V29.5813H20.7188V31.9478ZM20.7188 26.0316H18.2812V23.6651H20.7188V26.0316ZM20.7188 20.1153H18.2812V17.7488H20.7188V20.1153ZM20.7188 14.199H18.2812V11.8325H20.7188V14.199ZM34.125 34.3143H24.375V31.9478H26.8125V29.5813H24.375V26.0316H26.8125V23.6651H24.375V20.1153H26.8125V17.7488H24.375V15.3823H34.125V34.3143Z" fill="#f06292" />
            <path d="M29.25 29.5813H31.6875V31.9478H29.25V29.5813ZM29.25 23.665H31.6875V26.0315H29.25V23.665ZM29.25 17.7488H31.6875V20.1153H29.25V17.7488Z" fill="#f06292" />
          </svg>
          Flatfinder
        </Logo>
        <Title>{userId ? 'Actualizar Perfil' : 'Registrarse'}</Title>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ setFieldValue, values, isSubmitting, errors, touched }) => (
            <Form>
              <FormGrid>
                <FullWidthField>
                  <Field
                    name="email"
                    type="email"
                    as={StyledField}
                    placeholder="Email"
                    disabled={!!userId}
                    error={touched.email && errors.email}
                  />
                  <ErrorMessage name="email" component={StyledErrorMessage} />
                </FullWidthField>

                {!userId && (
                  <>
                    <div>
                      <Field
                        name="password"
                        type="password"
                        as={StyledField}
                        placeholder="Contraseña"
                        error={touched.password && errors.password}
                      />
                      <ErrorMessage name="password" component={StyledErrorMessage} />
                    </div>
                    <div>
                      <Field
                        name="confirmPassword"
                        type="password"
                        as={StyledField}
                        placeholder="Confirmar Contraseña"
                        error={touched.confirmPassword && errors.confirmPassword}
                      />
                      <ErrorMessage name="confirmPassword" component={StyledErrorMessage} />
                    </div>
                  </>
                )}

                <div>
                  <Field
                    name="firstName"
                    type="text"
                    as={StyledField}
                    placeholder="Nombre"
                    error={touched.firstName && errors.firstName}
                  />
                  <ErrorMessage name="firstName" component={StyledErrorMessage} />
                </div>
                <div>
                  <Field
                    name="lastName"
                    type="text"
                    as={StyledField}
                    placeholder="Apellido"
                    error={touched.lastName && errors.lastName}
                  />
                  <ErrorMessage name="lastName" component={StyledErrorMessage} />
                </div>

                <FullWidthField>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Fecha de Nacimiento"
                      value={values.birthDate}
                      onChange={(date) => setFieldValue('birthDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.birthDate && Boolean(errors.birthDate),
                          helperText: touched.birthDate && errors.birthDate,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </FullWidthField>

                <FullWidthField>
                  <FileInputContainer>
                    <FileInputLabel htmlFor="avatar">
                      Elegir Avatar
                      <HiddenFileInput
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.currentTarget.files[0];
                          setFieldValue("avatar", file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setPreviewImage(null);
                          }
                        }}
                      />
                    </FileInputLabel>
                    <FileName>{values.avatar ? values.avatar.name : 'Ningún archivo seleccionado'}</FileName>
                  </FileInputContainer>
                  <ErrorMessage name="avatar" component={StyledErrorMessage} />
                </FullWidthField>

                {previewImage && (
                  <FullWidthField>
                    <ImagePreviewContainer>
                      <ImagePreview src={previewImage} alt="Vista previa del avatar" />
                    </ImagePreviewContainer>
                  </FullWidthField>
                )}

                <FullWidthField>
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {userId ? 'Actualizar Perfil' : 'Registrarse'}
                  </SubmitButton>
                </FullWidthField>
              </FormGrid>
            </Form>
          )}
        </Formik>
      </FormContainer>
    </PageContainer>
  );
};

export default UserForm;