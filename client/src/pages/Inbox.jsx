import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Send, MessageSquare, User, Compass } from 'lucide-react';

export default function Inbox() {
  const { user, socket } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Fetch active conversations
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data);

      // Handle query param target user
      if (targetUserId) {
        const existing = data.find(c => c._id === targetUserId);
        if (existing) {
          setActiveUser(existing);
        } else {
          // Fetch new target user info
          const { data: newUser } = await api.get(`/auth/me`); // Or fetch user profile
          // Since getMe only gets current user, let's fetch property host name
          // For simplicity, we can fetch all properties and look up
          const propsRes = await api.get('/properties');
          const foundProp = propsRes.data.find(p => p.hostId?._id === targetUserId);
          if (foundProp && foundProp.hostId) {
            const hostDetail = {
              _id: foundProp.hostId._id,
              name: foundProp.hostId.name,
              email: foundProp.hostId.email,
              role: 'host'
            };
            setActiveUser(hostDetail);
            setConversations(prev => [hostDetail, ...prev]);
          } else {
            // General guest/host lookup fallback
            const dummyUser = { _id: targetUserId, name: 'Listing Host', role: 'host' };
            setActiveUser(dummyUser);
            setConversations(prev => [dummyUser, ...prev]);
          }
        }
      } else if (data.length > 0) {
        setActiveUser(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, targetUserId]);

  // Fetch message history when activeUser changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!activeUser?._id) return;
      try {
        const { data } = await api.get(`/chat/history/${activeUser._id}`);
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [activeUser]);

  // Listen to Socket.io events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      // Append if matches current active conversation
      if (
        activeUser &&
        ((msg.senderId === activeUser._id && msg.receiverId === user._id) ||
         (msg.senderId === user._id && msg.receiverId === activeUser._id))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, activeUser, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser) return;

    const messagePayload = {
      senderId: user._id,
      receiverId: activeUser._id,
      message: inputText.trim(),
    };

    // 1. Emit via socket for real-time
    if (socket) {
      socket.emit('send_message', messagePayload);
    }

    // 2. Save in database
    try {
      const { data } = await api.post('/chat/send', {
        receiverId: activeUser._id,
        message: inputText.trim(),
      });

      // If socket is disconnected, manually append to state
      if (!socket) {
        setMessages((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error(err);
    }

    const currentMsgText = inputText.trim();
    setInputText('');

    // 3. Host Emulator Auto-Reply (Simulated Response)
    // Runs when user is traveler and activeUser is a host
    if (user.role === 'user') {
      setTimeout(async () => {
        let reply = "Hello! Thanks for reaching out. I'd be happy to host you. Let me know if you have booking queries!";
        if (currentMsgText.toLowerCase().includes('price') || currentMsgText.toLowerCase().includes('discount')) {
          reply = "The price is as listed on the calendar. We do offer a 5% discount for weekly stays and 10% for monthly bookings.";
        } else if (currentMsgText.toLowerCase().includes('check')) {
          reply = "Standard check-in is at 2:00 PM and check-out is at 11:00 AM. Early check-in can be arranged if requested in advance.";
        } else if (currentMsgText.toLowerCase().includes('wifi') || currentMsgText.toLowerCase().includes('internet')) {
          reply = "Yes, we have high-speed fiber internet (above 100 Mbps) which is perfect for remote work!";
        } else if (currentMsgText.toLowerCase().includes('pool') || currentMsgText.toLowerCase().includes('beach')) {
          reply = "Yes, you have direct access! We keep it clean and maintained daily.";
        }

        const simulatedReply = {
          _id: `reply_mock_${Date.now()}`,
          senderId: activeUser._id,
          receiverId: user._id,
          message: reply,
          createdAt: new Date().toISOString()
        };

        // Append locally to show on screen
        setMessages((prev) => [...prev, simulatedReply]);

        // Save in DB
        try {
          await api.post('/chat/send', {
            receiverId: user._id,
            message: reply,
          });
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FCFCFC]">
        <Navbar />
        <div className="text-center py-32 max-w-sm mx-auto space-y-4">
          <MessageSquare className="w-12 h-12 text-[#FF385C] mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Login Required</h2>
          <p className="text-gray-400 text-sm">Please log in to access your direct messages inbox.</p>
          <button onClick={() => navigate('/login')} className="bg-[#FF385C] text-white font-bold px-6 py-2 rounded-xl text-sm cursor-pointer">Login Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#FCFCFC] overflow-hidden">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-0 sm:px-4 md:px-8 py-4 sm:py-6 overflow-hidden">
        <div className="flex-1 flex bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm h-full">
          
          {/* Sidebar Conversations */}
          <aside className="w-1/3 border-r border-gray-50 flex flex-col bg-gray-50/20 max-w-[320px] shrink-0">
            <h2 className="p-4 sm:p-5 font-black text-gray-900 text-lg border-b border-gray-50 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FF385C]" /> Chats
            </h2>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                [1, 2].map(n => (
                  <div key={n} className="animate-pulse flex items-center gap-3 p-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4 text-xs text-gray-400">
                  No active chats. Start a chat from any stay's detail page.
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = activeUser?._id === c._id;
                  return (
                    <button
                      key={c._id}
                      onClick={() => setActiveUser(c)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition cursor-pointer text-left ${
                        isActive ? 'bg-[#FF385C]/5 text-[#FF385C]' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive ? 'bg-[#FF385C] text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate">{c.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{c.role}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Active Message Board */}
          <main className="flex-1 flex flex-col bg-white">
            {activeUser ? (
              <>
                {/* Active Header */}
                <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 bg-[#FF385C] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">{activeUser.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">{activeUser.role} · Offline (Auto-Reply Active)</p>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/10">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-xs ${
                          isMe 
                            ? 'bg-[#FF385C] text-white rounded-tr-none' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{msg.message}</p>
                          <span className={`block text-[9px] text-right mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Inputs */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-50 flex gap-2 items-center bg-white shrink-0">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-250 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
                  />
                  <button
                    type="submit"
                    className="bg-[#FF385C] hover:bg-[#E61E4D] text-white p-3 rounded-2xl shadow-md transition hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="bg-gray-50 text-gray-300 p-4 rounded-full">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">No conversation selected</h3>
                <p className="text-sm text-gray-400 max-w-xs">Select an existing chat from the left panel, or contact a host through a stay's listing page.</p>
                <button onClick={() => navigate('/')} className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer">Browse Stays</button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
