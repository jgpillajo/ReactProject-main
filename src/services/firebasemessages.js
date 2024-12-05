// Importaciones necesarias de Firebase
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from "../config/firebase";

// Función para enviar un mensaje
export const sendMessage = async (flatId, messageData) => {
  try {
    // Validaciones de los datos necesarios
    if (!flatId) {
      throw new Error('Se requiere el ID del piso');
    }
    if (!messageData.text) {
      throw new Error('Se requiere el texto del mensaje');
    }
    if (!messageData.userId) {
      throw new Error('Se requiere el ID del usuario');
    }

    // Preparar el objeto del mensaje
    const messageToSend = {
      text: messageData.text,
      userId: messageData.userId,
      userName: messageData.userName || 'Usuario Anónimo',
      imageUid: messageData.imageUid || null,
      createdAt: new Date(),
      replyTo: messageData.replyTo || null
    };

    console.log("Enviando mensaje:", messageToSend); // Log para depuración

    // Enviar el mensaje a Firestore
    const messagesRef = collection(db, `flats/${flatId}/messages`);
    await addDoc(messagesRef, messageToSend);
    console.log('Mensaje enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    throw error;
  }
};

// Función para suscribirse a los mensajes de un piso
export const subscribeToMessages = (flatId, callback) => {
  console.log("Suscribiéndose a los mensajes del piso:", flatId); // Log para depuración
  
  // Crear una consulta ordenada por fecha de creación descendente
  const q = query(collection(db, `flats/${flatId}/messages`), orderBy('createdAt', 'desc'));
  
  // Retornar la suscripción
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text || '',
        userName: data.userName || 'Usuario Anónimo',
        userId: data.userId || '',
        createdAt: data.createdAt || new Date(),
        replyTo: data.replyTo || null,
        imageUid: data.imageUid || null // Asegurarse de incluir imageUid
      };
    });
    console.log("Mensajes recibidos:", messages); // Log para depuración
    callback(messages);
  });
};