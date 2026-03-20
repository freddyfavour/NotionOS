import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, X, MessageSquare } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSidebarProps {
  onRefresh: () => void;
}

export function ChatSidebar({ onRefresh }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your magical NotionOS Agent. How can I help you today? ✨' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      });

      if (!response.ok) throw new Error('Chat failed');
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      
      // If the AI mentioned performing an action, refresh the dashboard
      if (data.text.toLowerCase().includes('updated') || 
          data.text.toLowerCase().includes('created') || 
          data.text.toLowerCase().includes('added')) {
        onRefresh();
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later. 🎀' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-20 h-20 bg-kawaii-primary text-white rounded-[2rem] shadow-[0_8px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center hover:scale-110 active:translate-y-1 active:shadow-none transition-all duration-500 z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-10 h-10" />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-kawaii-primary rounded-full border-4 border-white animate-pulse transition-colors duration-500" />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[450px] bg-white border-l-8 border-zinc-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b-4 border-zinc-50 flex items-center justify-between bg-kawaii-bg/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-kawaii-primary rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.1)] transition-colors duration-500">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900">Magical Agent ✨</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-kawaii-primary rounded-full animate-pulse transition-colors duration-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-kawaii-primary transition-colors duration-500">Online & Ready</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-kawaii-primary/10 rounded-2xl transition-all duration-500 text-zinc-300 hover:text-kawaii-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-500 ${
                    msg.role === 'assistant' ? 'bg-kawaii-bg text-kawaii-primary' : 'bg-kawaii-primary text-white'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-sm transition-colors duration-500 ${
                    msg.role === 'assistant' 
                      ? 'bg-kawaii-bg text-zinc-700 rounded-tl-none border-2 border-white' 
                      : 'bg-kawaii-primary text-white rounded-tr-none'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-800 prose-pre:text-zinc-100">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-kawaii-bg flex items-center justify-center shadow-sm">
                    <Loader2 className="w-5 h-5 text-kawaii-primary animate-spin transition-colors duration-500" />
                  </div>
                  <div className="bg-kawaii-bg p-5 rounded-[1.5rem] rounded-tl-none flex gap-1.5 border-2 border-white shadow-sm">
                    <span className="w-1.5 h-1.5 bg-kawaii-primary/30 rounded-full animate-bounce transition-colors duration-500" />
                    <span className="w-1.5 h-1.5 bg-kawaii-primary/30 rounded-full animate-bounce [animation-delay:0.2s] transition-colors duration-500" />
                    <span className="w-1.5 h-1.5 bg-kawaii-primary/30 rounded-full animate-bounce [animation-delay:0.4s] transition-colors duration-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-8 border-t-4 border-zinc-50 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for magic..."
                  className="w-full pl-6 pr-16 py-5 bg-kawaii-bg/30 border-4 border-transparent rounded-[2rem] text-sm font-bold focus:outline-none focus:border-kawaii-primary/20 focus:bg-white transition-all duration-500 placeholder:text-zinc-300"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-3 top-3 w-12 h-12 bg-kawaii-primary text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-500 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-kawaii-primary transition-colors duration-500" />
                <p className="text-[10px] text-center text-zinc-300 font-black uppercase tracking-[0.2em]">
                  Powered by Gemini 3 Flash
                </p>
                <Sparkles className="w-3 h-3 text-kawaii-primary transition-colors duration-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
