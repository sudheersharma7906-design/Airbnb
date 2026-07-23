import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, Sparkles, X, Send, RotateCcw, Minus, MessageSquare, ChevronDown } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'How do I book a stay?',
  'How to list my property as a host?',
  'What is the cancellation policy?',
  'Can you recommend popular listings?'
];

const INITIAL_BOT_MESSAGE = {
  sender: 'bot',
  text: "Hi there! 👋 I'm **NestBot**, your AI Support Agent powered by Gemini. How can I help you find a stay or host your property today?",
  timestamp: new Date().toISOString()
};

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('nestfinder_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
    return [INITIAL_BOT_MESSAGE];
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nestfinder_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      // Backend endpoint
      const response = await axios.post('/api/ai-support/chat', {
        message: messageText.trim(),
        conversationHistory: messages.slice(-8) // Send recent history for context
      });

      if (response.data && response.data.reply) {
        const botMsg = {
          sender: 'bot',
          text: response.data.reply,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('No reply returned');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMsg = {
        sender: 'bot',
        text: "I'm having trouble connecting right now. Please try asking again in a moment!",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Reset AI Chat conversation?')) {
      setMessages([INITIAL_BOT_MESSAGE]);
      localStorage.removeItem('nestfinder_ai_chat_history');
    }
  };

  // Simple Markdown Formatter Helper
  const renderFormattedText = (text) => {
    if (!text) return '';

    // Split text into lines for lists and bold styling
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Check if bullet point
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      let content = isBullet ? line.trim().substring(2) : line;

      // Handle bold **text**
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-rose-500 font-bold">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'my-1'}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          className={`bg-white shadow-2xl rounded-2xl border border-gray-200 w-[90vw] sm:w-[380px] transition-all duration-300 overflow-hidden flex flex-col mb-4 ${
            isMinimized ? 'h-14' : 'h-[520px] max-h-[80vh]'
          }`}
          style={{ boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.2)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white p-3.5 px-4 flex items-center justify-between shadow-sm cursor-pointer select-none"
               onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                  NestBot AI Support
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider">Gemini</span>
                </h3>
                <p className="text-[11px] text-rose-100 font-light">24/7 Intelligent Virtual Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 hover:bg-white/20 rounded-full text-rose-100 hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 hover:bg-white/20 rounded-full text-rose-100 hover:text-white transition"
              >
                {isMinimized ? <ChevronDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 hover:bg-white/20 rounded-full text-rose-100 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Shown if not minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
                {messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-tr-none font-medium'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}
                      >
                        {isUser ? msg.text : renderFormattedText(msg.text)}
                        <div
                          className={`text-[9px] mt-1.5 text-right ${
                            isUser ? 'text-rose-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-start gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              {messages.length <= 2 && !loading && (
                <div className="p-2.5 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200/60 transition text-left font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-gray-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask NestBot AI Support..."
                    disabled={loading}
                    className="flex-1 bg-gray-100 hover:bg-gray-100/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-full px-4 py-2.5 text-xs sm:text-sm text-gray-800 transition placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md hover:opacity-90 disabled:opacity-40 transition shrink-0"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.4)' }}
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-rose-600 rounded-full"></span>
          </div>
          <span className="font-semibold text-sm tracking-wide">AI Support</span>
        </button>
      )}
    </div>
  );
}
