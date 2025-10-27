import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fade,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material'

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your study assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Simple rule-based responses
    if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
      return "To improve focus, try the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. Make sure you're in a quiet environment and minimize distractions!"
    } else if (lowerMessage.includes('break') || lowerMessage.includes('rest')) {
      return "Taking regular breaks is essential! I recommend a 5-10 minute break every hour. Use this time to stretch, hydrate, or take a short walk."
    } else if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      return "Setting SMART goals helps! Make them Specific, Measurable, Achievable, Relevant, and Time-bound. Check your Goals section to track your progress!"
    } else if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated')) {
      return "Stay motivated by celebrating small wins! Remember why you started, visualize your success, and reward yourself after completing study sessions. You've got this! 💪"
    } else if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
      return "Create a study schedule that works for you! Study during your peak productivity hours, and use time-blocking to organize your day effectively."
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
      return "Feeling stressed? Try deep breathing exercises, take a short walk, or practice mindfulness. Remember, it's okay to take breaks when you need them!"
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help you with study tips, focus techniques, time management, goal setting, and motivation! Just ask me anything about improving your study habits."
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! I'm here to help you succeed. Keep up the great work! 🌟"
    } else if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return "Hello! Ready to boost your productivity? Ask me anything about studying, focus, or time management!"
    } else {
      return "That's a great question! I can help you with study techniques, focus tips, time management, and motivation. What specific aspect would you like to know more about?"
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB'
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              width: 45,
              height: 45
            }}
          >
            <BotIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Study Assistant
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Online • Always here to help
            </Typography>
          </Box>
        </Box>
        {onClose && (
          <Tooltip title="Close chat">
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          background: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.map((message, index) => (
          <Fade in key={message.id} timeout={300}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 1.5
              }}
            >
              {message.sender === 'bot' && (
                <Avatar
                  sx={{
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 36,
                    height: 36
                  }}
                >
                  <BotIcon sx={{ fontSize: 20 }} />
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: '75%',
                  p: 2,
                  borderRadius: message.sender === 'user' 
                    ? '16px 16px 4px 16px' 
                    : '16px 16px 16px 4px',
                  background: message.sender === 'user'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#FFFFFF',
                  color: message.sender === 'user' ? 'white' : '#111827',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: message.sender === 'bot' ? '1px solid #E5E7EB' : 'none'
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    wordWrap: 'break-word'
                  }}
                >
                  {message.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Box>
              {message.sender === 'user' && (
                <Avatar
                  sx={{
                    bgcolor: '#10B981',
                    width: 36,
                    height: 36
                  }}
                >
                  <PersonIcon sx={{ fontSize: 20 }} />
                </Avatar>
              )}
            </Box>
          </Fade>
        ))}
        
        {isTyping && (
          <Fade in timeout={300}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  width: 36,
                  height: 36
                }}
              >
                <BotIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px 16px 16px 4px',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={16} sx={{ color: '#667eea' }} />
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  Typing...
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2.5,
          background: '#FFFFFF',
          borderTop: '1px solid #E5E7EB'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask me anything about studying..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: '#F9FAFB',
                '& fieldset': {
                  borderColor: '#E5E7EB'
                },
                '&:hover fieldset': {
                  borderColor: '#D1D5DB'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea'
                }
              }
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
            sx={{
              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              width: 48,
              height: 48,
              borderRadius: '14px',
              '&:hover': {
                bgcolor: '#5568d3',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                bgcolor: '#E5E7EB',
                color: '#9CA3AF'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default ChatBot
