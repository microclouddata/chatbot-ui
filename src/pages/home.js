import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './home.css';
import logo from './logo.png';
import { v4 as uuidv4 } from 'uuid';


const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const uuid = useRef('');
  const messageListRef = useRef(null);
  const didInit = useRef(false);
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        setDefaultMessages();
        initUUID();
    }, [])
  const newChat = () => {
    setMessages([]);
    setInput('');
    localStorage.removeItem('user_uuid');
    window.location.reload();
  };
  const setDefaultMessages = ()=>{
     setMessages((prev) => [
        ...prev,
        { text: "Welcome to Microcloud Software Chatbot! How can I assist you today?", isUser: false }
      ]);
  }
  const toPortal = ()=>{
      window.location = "http://microcloudsoftware.com"
  }

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
    // const response = await fetch('http://73.197.30.143:8080/chatbot/chat', {
    const response = await fetch('http://localhost:8080/chatbot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memoryId: uuid.value,
        message: input,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Stream error or no body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let isFirst = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;

      if (isFirst) {
        setMessages((prev) => [...prev, { text: chunk, isUser: false }]);
        isFirst = false;
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullText;
          return updated;
        });
      }
    }

  } catch (error) {
    console.error('Streaming error:', error);
    const errorMessage = {
      text: 'Error: Unable to get response from server.',
      isUser: false,
    };
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
        
        <div className='bottom-aligned'>
        <button className="btn btn-outline-secondary" onClick={toPortal}>
          <i className="fa-solid fa-plus"></i>
          {/* <i class="bi bi-plus-lg"></i>&nbsp; */}
          Back to portal
        </button>
        </div>
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

export default Home;
