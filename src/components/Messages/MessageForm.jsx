import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { sendMessage } from '../../services/firebasemessages';

const MessageForm = ({ flatId, currentUser, replyToMessage, onReplyCancel }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!currentUser) {
      setError('Debes iniciar sesión para enviar mensajes.');
      return;
    }

    if (!currentUser.id) {
      setError('Error: No se pudo obtener el ID del usuario.');
      console.error("User object doesn't have id:", currentUser);
      return;
    }

    if (message.trim()) {
      try {
        const messageData = {
          text: message.trim(),
          userId: currentUser.id,
          userName: `${currentUser.firstName} ${currentUser.lastName}`,
          imageUid: currentUser.imageUid,
          replyTo: replyToMessage ? replyToMessage.id : null,
        };
        console.log("Sending message with data:", messageData);
        
        await sendMessage(flatId, messageData);
        console.log("Message sent successfully");
        
        setMessage('');
        if (replyToMessage) {
          onReplyCancel();
        }
      } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        setError(`No se pudo enviar el mensaje: ${error.message}`);
      }
    }
  };

  if (!currentUser) {
    return (
      <Typography color="error">
        Debes iniciar sesión para enviar mensajes.
      </Typography>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {replyToMessage && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Respondiendo a {replyToMessage.userName}: "{replyToMessage.text.substring(0, 50)}..."
        </Typography>
      )}
      <TextField
        fullWidth
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={replyToMessage ? `Responder a ${replyToMessage.userName}` : "Escribe un mensaje..."}
        InputProps={{
          endAdornment: (
            <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={!message.trim()}>
              Enviar
            </Button>
          ),
        }}
      />
      {replyToMessage && (
        <Button onClick={onReplyCancel} sx={{ mt: 1 }}>
          Cancelar respuesta
        </Button>
      )}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default MessageForm;