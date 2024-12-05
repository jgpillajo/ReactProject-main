// Importaciones necesarias de Firebase
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";

// Definir los nombres de las colecciones que vamos a utilizar
const collectionName = "flats";
const usersCollectionName = "users";

// Definir la referencia a la colección de pisos
const flatsCollectionRef = collection(db, collectionName);

// Función para crear un nuevo piso
const createFlat = async (flat, userId) => {
    try {
        const flatWithOwner = { ...flat, ownerId: userId };
        const docRef = await addDoc(flatsCollectionRef, flatWithOwner);
        return docRef;
    } catch (error) {
        console.error("Error al crear el piso:", error);
        throw new Error("No se pudo crear el piso");
    }
};



// Función para obtener un piso por su ID
const getFlatByID = async (id) => {
    try {
        const flatRef = doc(db, collectionName, id);
        const flatDoc = await getDoc(flatRef);
        if (flatDoc.exists()) {
            return { id: flatDoc.id, ...flatDoc.data() };
        } else {
            console.error("Piso no encontrado");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el piso:", error);
        throw new Error("No se pudo recuperar el piso por ID");
    }
};

// Función para actualizar un piso
const updateFlat = async (id, flat) => {
    const flatRef = doc(db, collectionName, id);
    try {
        await updateDoc(flatRef, flat);
        return flatRef;
    } catch (error) {
        console.error("Error al actualizar el piso:", error);
        throw new Error("No se pudo actualizar el piso");
    }
};

// Función para eliminar un piso
const deleteFlat = async (id) => {
    try {
        await deleteDoc(doc(db, collectionName, id));
        return true;
    } catch (error) {
        console.error("Error al eliminar el piso:", error);
        throw new Error("No se pudo eliminar el piso");
    }
};

// Función para subir una imagen de piso y devolver su URL
const uploadFlatImage = async (flatId, imageFile) => {
    try {
        const imageRef = ref(storage, `flatImages/${flatId}/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const downloadURL = await getDownloadURL(imageRef);
        const flatRef = doc(db, collectionName, flatId);
        await updateDoc(flatRef, { imageURL: downloadURL });
        return downloadURL;
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        throw new Error("No se pudo subir la imagen y vincularla al piso");
    }
};



// Función para obtener los pisos de un usuario específico
const getFlatsByUser = async (userId) => {
    try {
        const q = query(flatsCollectionRef, where("ownerId", "==", userId));
        const querySnapshot = await getDocs(q);
        const flats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return flats;
    } catch (error) {
        console.error("Error al obtener los pisos del usuario:", error);
        throw new Error("No se pudieron recuperar los pisos del usuario");
    }
};

// Función para obtener todos los pisos con información de sus propietarios
const getAllFlatsWithOwners = async () => {
    try {
        const flatsSnapshot = await getDocs(flatsCollectionRef);
        const flatsWithOwners = await Promise.all(flatsSnapshot.docs.map(async (flatDoc) => {
            const flatData = flatDoc.data();
            const flatId = flatDoc.id;
            let ownerData = null;
            if (flatData.ownerId) {
                const ownerRef = doc(db, usersCollectionName, flatData.ownerId);
                const ownerSnapshot = await getDoc(ownerRef);
                if (ownerSnapshot.exists()) {
                    ownerData = ownerSnapshot.data();
                }
            }
            return {
                id: flatId,
                ...flatData,
                owner: ownerData ? {
                    id: flatData.ownerId,
                    name: ownerData.name,
                    email: ownerData.email
                } : null
            };
        }));
        return flatsWithOwners;
    } catch (error) {
        console.error("Error al obtener los pisos con información de propietarios:", error);
        throw new Error("No se pudieron recuperar los pisos con información de propietarios");
    }
};

// Función para añadir un piso a favoritos
const addToFavorites = async (userId, flatId) => {
    try {
        const userRef = doc(db, usersCollectionName, userId);
        await updateDoc(userRef, {
            favorites: arrayUnion(flatId)
        });
    } catch (error) {
        console.error("Error al añadir a favoritos:", error);
        throw new Error("No se pudo añadir el piso a favoritos");
    }
};

// Función para eliminar un piso de favoritos
const removeFavorite = async (userId, flatId) => {
    try {
        const userRef = doc(db, usersCollectionName, userId);
        await updateDoc(userRef, {
            favorites: arrayRemove(flatId)
        });
    } catch (error) {
        console.error("Error al eliminar de favoritos:", error);
        throw new Error("No se pudo eliminar el piso de favoritos");
    }
};

// Función para obtener los pisos favoritos de un usuario
const getUserFavorites = async (userId) => {
    try {
        const userRef = doc(db, usersCollectionName, userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const favorites = userDoc.data().favorites || [];
            const favoriteFlats = await Promise.all(
                favorites.map(async (flatId) => {
                    const flatDoc = await getFlatByID(flatId);
                    return flatDoc;
                })
            );
            return favoriteFlats.filter(flat => flat !== null);
        }
        return [];
    } catch (error) {
        console.error("Error al obtener los favoritos del usuario:", error);
        throw new Error("No se pudieron obtener los favoritos del usuario");
    }
};
const getFlatCountByUser = async (userId) => {
    try {
        const q = query(flatsCollectionRef, where("ownerId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error al obtener el conteo de pisos del usuario:", error);
        throw new Error("No se pudo obtener el conteo de pisos del usuario");
    }
};

// Exportar todas las funciones
export {

    createFlat,
    updateFlat,
    deleteFlat,
    getFlatByID,
    uploadFlatImage,
    getFlatsByUser,
    getAllFlatsWithOwners,
    addToFavorites,
    removeFavorite,
    getUserFavorites,
    getFlatCountByUser
};  