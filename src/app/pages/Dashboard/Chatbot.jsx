import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { chatbotAPI } from '@/services/api';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! I'm here to help you with lost and found items. You can ask me about reporting items, searching for items, or how to use this platform.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'How do I report a lost item?',
    'How do I report a found item?',
    'How can I search for my item?',
    'How do I contact someone?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await chatbotAPI.sendMessage(messageText);
      
      if (response.success) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: response.message,
          timestamp: new Date(response.timestamp),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
            <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chatbot Assistant</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600">Get instant help and answers to your questions</p>
      </motion.div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4" style={{ maxHeight: '500px' }}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-2 sm:gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-lg ${
                  message.sender === 'bot'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                }`}
              >
                <p className="text-xs sm:text-base">{message.text}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'bot' ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 sm:gap-3"
            >
              <div className="flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Quick Questions:</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all whitespace-nowrap sm:flex-shrink-0"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 flex-shrink-0 text-sm sm:text-base"
            >
              <Send className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Send</span>
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}