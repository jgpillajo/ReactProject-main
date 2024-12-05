import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MessageForm from '../Messages/MessageForm';
import MessagesList from '../Messages/MessageList';

const FlatMessages = ({ flatId, currentUser, flatOwner }) => {
  const [replyToMessage, setReplyToMessage] = useState(null);

  useEffect(() => {
    console.log("Current user in FlatMessages:", currentUser);
  }, [currentUser]);

  const handleReply = (message) => {
    setReplyToMessage(message);
  };

  const handleReplyCancel = () => {
    setReplyToMessage(null);
  };

  if (!currentUser) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography color="error">
          Debes iniciar sesión para ver y enviar mensajes.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Mensajes del Flat
      </Typography>
      <MessagesList 
        flatId={flatId} 
        currentUser={currentUser} 
        flatOwner={flatOwner} 
        onReply={handleReply} 
      />
      <MessageForm 
        flatId={flatId} 
        currentUser={currentUser} 
        replyToMessage={replyToMessage}
        onReplyCancel={handleReplyCancel}
      />
    </Paper>
  );
};

export default FlatMessages;