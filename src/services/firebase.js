// Importaciones necesarias de Firebase
// Estas importaciones proporcionan funciones para interactuar con Firestore, Storage y Authentication
import {
    collection,   // Para referenciar una colección
    deleteDoc,    // Para eliminar documentos
    doc,          // Para referenciar un documento específico
    getDoc,       // Para obtener un documento
    getDocs,      // Para obtener múltiples documentos
    updateDoc     // Para actualizar documentos
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";  // Para manejar el almacenamiento de archivos
import {
    signInWithEmailAndPassword,     // Para autenticar usuarios con email y contraseña
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,  // Para enviar correos de restablecimiento de contraseña
    fetchSignInMethodsForEmail      // Para verificar si un email está registrado
} from "firebase/auth";
import { db, storage, auth } from "../config/firebase";  // Importación de instancias de Firebase configuradas

// Definir el nombre de la colección que vamos a utilizar de esa base de datos
const collectionName = "users";

// Definir la referencia a la colección que vamos a utilizar
const usersCollectionRef = collection(db, collectionName);

// Función para obtener el ID del usuario autenticado


// Función para autenticar al usuario
const authenticateUser = async (email, password) => {
    try {
        // Intenta iniciar sesión con el email y contraseña proporcionados
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Obtener datos adicionales del usuario desde Firestore
        const userDoc = await getDoc(doc(db, collectionName, user.uid));

        if (userDoc.exists()) {
            return { uid: user.uid, ...userDoc.data() };  // Devuelve los datos del usuario si existen
        } else {
            console.error("No se encontró el documento del usuario en Firestore");
            return null;
        }
    } catch (error) {
        console.error("Error al autenticar al usuario:", error);
        throw new Error("No se pudo autenticar al usuario");
    }
};
// Función para obtener todos los usuarios
const getUsers = async () => {
    try {
        const data = await getDocs(usersCollectionRef);  // Obtiene todos los documentos de la colección de usuarios
        const users = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));  // Mapea los documentos a un array de objetos
        return users;
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        throw new Error("No se pudieron recuperar los usuarios");
    }
};

// Función para obtener un usuario por su ID
const getUserByID = async (id) => {
    try {
        const userRef = doc(db, collectionName, id);  // Referencia al documento del usuario
        const userDoc = await getDoc(userRef);  // Obtiene el documento
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };  // Devuelve los datos si el documento existe
        } else {
            console.error("Usuario no encontrado");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        throw new Error("No se pudo recuperar el usuario por ID");
    }
};



// Función para eliminar un usuario
const deleteUser = async (id) => {
    try {
        await deleteDoc(doc(db, collectionName, id));  // Elimina el documento del usuario
        return true;
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        throw new Error("No se pudo eliminar el usuario");
    }
};

// Función para subir una imagen de usuario y devolver su UID
const uploadUserImage = async (userId, imageFile) => {
    try {
        // Crear una referencia en Storage para la imagen
        const imageRef = ref(storage, `userImages/${userId}/${imageFile.name}`);

        // Subir la imagen a Storage
        await uploadBytes(imageRef, imageFile);

        // Crear el UID de la imagen (ruta relativa en el storage)
        const imageUid = `userImages/${userId}/${imageFile.name}`;

        // Actualizar el documento del usuario con el UID de la imagen
        const userRef = doc(db, collectionName, userId);
        await updateDoc(userRef, { imageUid: imageUid });

        return imageUid;
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        throw new Error("No se pudo subir la imagen y vincularla al usuario");
    }
};

// Función para enviar un correo de restablecimiento de contraseña
const sendPasswordResetEmail = async (email) => {
    try {
        // Primero, verifica si el correo existe
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);

        if (signInMethods.length > 0) {
            // El correo existe, procede con el envío del correo de restablecimiento
            await firebaseSendPasswordResetEmail(auth, email);
            console.log("Correo de restablecimiento de contraseña enviado con éxito");
            return { success: true, message: "Se ha enviado un correo de restablecimiento de contraseña." };
        } else {
            // El correo no existe
            console.log("El correo electrónico no está registrado");
            return { success: false, message: "El correo electrónico no está registrado en nuestro sistema." };
        }
    } catch (error) {
        console.error("Error al procesar la solicitud de restablecimiento de contraseña:", error);
        throw new Error("No se pudo procesar la solicitud de restablecimiento de contraseña");
    }
};
const updateUserRole = async (userId, newRole) => {
    try {
        // Referencia al documento del usuario en Firestore
        const userRef = doc(db, collectionName, userId);

        // Actualizar solo el campo 'rol' del documento
        await updateDoc(userRef, { rol: newRole });

        console.log(`Rol del usuario ${userId} actualizado a ${newRole}`);
        return { success: true, message: "Rol de usuario actualizado con éxito." };
    } catch (error) {
        console.error("Error al actualizar el rol del usuario:", error);
        throw new Error("No se pudo actualizar el rol del usuario");
    }
};

// Exportar todas las funciones
// Esto permite que estas funciones sean importadas y utilizadas en otros archivos
export {
    authenticateUser,
    getUsers,
    deleteUser,
    getUserByID,
    uploadUserImage,
    sendPasswordResetEmail,
    updateUserRole
};