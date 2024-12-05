import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, IconButton, Button } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { subscribeToMessages } from '../../services/firebasemessages';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../config/firebase';

const MessagesList = ({ flatId, currentUser, flatOwner, onReply }) => {
  const [messages, setMessages] = useState([]);
  const [avatarUrls, setAvatarUrls] = useState({});
  const [expandedThreads, setExpandedThreads] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeToMessages(flatId, (newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [flatId]);

  useEffect(() => {
    const fetchAvatarUrls = async () => {
      const urls = {};
      for (const msg of messages) {
        if (msg.imageUid && !avatarUrls[msg.imageUid]) {
          try {
            const imageRef = ref(storage, msg.imageUid);
            const url = await getDownloadURL(imageRef);
            urls[msg.imageUid] = url;
          } catch (error) {
            console.error("Error getting avatar URL:", error);
            urls[msg.imageUid] = null;
          }
        }
      }
      setAvatarUrls(prevUrls => ({ ...prevUrls, ...urls }));
    };
    fetchAvatarUrls();
  }, [messages]);

  const canReply = (msg) => {
    if (!currentUser || !currentUser.id) return false;
    
    // El dueño del flat puede responder a cualquier mensaje
    if (currentUser.id === flatOwner) return true;
    
    // Si es un mensaje principal (no es una respuesta)
    if (!msg.replyTo) {
      return msg.userId === currentUser.id;
    }
    
    // Si es una respuesta, buscar el mensaje original
    const originalMessage = messages.find(m => m.id === msg.replyTo);
    return originalMessage && originalMessage.userId === currentUser.id;
  };

  const toggleThread = (msgId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const getReplyCount = (msgId) => {
    return messages.filter(msg => msg.replyTo === msgId).length;
  };

  const renderMessage = (msg, depth = 0) => {
    const userName = msg.userName || 'Usuario Anónimo';
    const avatarLetter = userName.charAt(0).toUpperCase();
    const avatarUrl = avatarUrls[msg.imageUid];
    const replyCount = getReplyCount(msg.id);
    const isExpanded = expandedThreads[msg.id];

    return (
      <Box key={msg.id} sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        mb: 2, 
        pl: depth * 4,
        borderLeft: depth > 0 ? '2px solid #e0e0e0' : 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar src={avatarUrl} alt={userName} sx={{ mr: 1, width: 24, height: 24 }}>
            {avatarLetter}
          </Avatar>
          <Typography variant="subtitle2" component="span">{userName}</Typography>
          {canReply(msg) && (
            <IconButton size="small" onClick={() => onReply(msg)} sx={{ ml: 1 }}>
              <ReplyIcon fontSize="small" />
            </IconButton>
          )}
          {replyCount > 0 && (
            <Button
              size="small"
              onClick={() => toggleThread(msg.id)}
              startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ ml: 1 }}
            >
              {replyCount} {replyCount === 1 ? 'respuesta' : 'respuestas'}
            </Button>
          )}
        </Box>
        <Box sx={{ bgcolor: '#f0f0f0', borderRadius: 2, p: 1, maxWidth: '80%', alignSelf: 'flex-start' }}>
          <Typography variant="body2">{msg.text}</Typography>
        </Box>
        <Typography variant="caption" sx={{ mt: 0.5 }}>
          {msg.createdAt?.toDate().toLocaleString() || 'Fecha desconocida'}
        </Typography>
        {isExpanded && renderReplies(msg.id, depth + 1)}
      </Box>
    );
  };

  const renderReplies = (parentId, depth) => {
    const replies = messages
      .filter(msg => msg.replyTo === parentId)
      .sort((a, b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0));
    return replies.map(reply => renderMessage(reply, depth));
  };

  // Ordenar mensajes principales de más reciente a más antiguo
  const sortedMessages = messages
    .filter(msg => !msg.replyTo)
    .sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', p: 2 }}>
      {sortedMessages.map(msg => renderMessage(msg))}
    </Box>
  );
};

export default MessagesList;