import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './home.css';
import logo from './logo.png';
import { v4 as uuidv4 } from 'uuid';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const uuid = useState('');
  const messageListRef = useRef(null);
    useEffect(() => {
        initUUID();
    })

  const newChat = () => {
    setMessages([]);
    setInput('');
    localStorage.removeItem('user_uuid');
    window.location.reload();
  };

  // 初始化 UUID
const initUUID = () => {
  let storedUUID = localStorage.getItem('user_uuid')
  if (!storedUUID) {
    storedUUID = uuidToNumber(uuidv4())
    localStorage.setItem('user_uuid', storedUUID)
  }
  uuid.value = storedUUID
}

const uuidToNumber = (uuid) => {
  let number = 0
  for (let i = 0; i < uuid.length && i < 6; i++) {
    const hexValue = uuid[i]
    number = number * 16 + (parseInt(hexValue, 16) || 0)
  }
  return number % 1000000
}

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post('http://localhost:8080/chatbot/chat', { memoryId:uuid.value,message: input });
      const botMessage = { text: response.data, isUser: false };
      // const botMessage = { text: 'test message', isUser: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: 'Error: Unable to get response from server.', isUser: false };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="logo-section">
          <img src={logo} alt="Microclouddsoftware chatBot" width="160" height="160" />
          <span className="logo-text">chatBot</span>
        </div>
        <button className="btn btn-outline-secondary" onClick={newChat}>
          <i className="fa-solid fa-plus"></i>
          <i class="bi bi-plus-lg"></i>&nbsp;New Chat
        </button>
      </div>
      <div className="main-content">
        <div className="chat-container">
          <div className="message-list" ref={messageListRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
              >
                <i
                  className={`fa-solid ${
                    message.isUser ? 'fa-user' : 'fa-robot'
                  } message-icon`}
                ></i>
                <span className="message-text">{message.text}</span>
              </div>
            ))}
          </div>
          <div className="input-group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="form-control"
            />
            <button onClick={sendMessage} className="btn btn-primary">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
