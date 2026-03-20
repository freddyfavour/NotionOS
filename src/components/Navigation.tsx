import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Calendar, 
  Zap,
  MessageSquare,
  Palette,
  Sparkles
} from 'lucide-react';
import { useTheme, KAWAII_COLORS } from '../contexts/ThemeContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Navigation() {
  const { currentColor, setThemeColor } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-white border-r-4 border-zinc-50 z-40 flex-col transition-all duration-500">
        <div className="p-8 flex items-center gap-4">
          <div className="w-14 h-14 bg-kawaii-primary rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-xl shadow-kawaii-primary/20 rotate-3 transition-all duration-500 hover:rotate-12">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-zinc-900 leading-none">NotionOS</h1>
            <span className="text-[10px] font-black uppercase tracking-widest text-kawaii-primary transition-colors duration-500">
              {currentColor.name} Edition ✨
            </span>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all group relative overflow-hidden
                ${isActive 
                  ? 'bg-kawaii-primary text-white shadow-2xl shadow-kawaii-primary/20 -translate-y-1' 
                  : 'text-zinc-400 hover:bg-kawaii-bg hover:text-kawaii-primary hover:translate-x-1'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                    />
                  )}
                  <item.icon className={`w-6 h-6 flex-shrink-0 relative z-10 ${isActive ? 'fill-white/20' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="font-black text-lg relative z-10 tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="p-8 space-y-6">
          <div className="relative">
            <button 
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] bg-zinc-50 text-zinc-400 hover:bg-kawaii-bg hover:text-kawaii-primary transition-all group border-4 border-white shadow-sm"
            >
              <Palette className="w-6 h-6 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="font-black text-lg tracking-tight">Theme</span>
            </button>

            <AnimatePresence>
              {showThemePicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-6 w-full bg-white border-4 border-zinc-50 rounded-[2.5rem] p-6 shadow-2xl grid grid-cols-5 gap-3 z-50"
                >
                  {KAWAII_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setThemeColor(color);
                        setShowThemePicker(false);
                      }}
                      title={color.name}
                      className={`w-10 h-10 rounded-2xl shadow-sm hover:scale-110 transition-all border-4 ${currentColor.name === color.name ? 'border-zinc-900 scale-110' : 'border-white'}`}
                      style={{ backgroundColor: color.primary }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => {
              const chatBtn = document.querySelector('button[class*="fixed bottom-8"]') as HTMLButtonElement;
              if (chatBtn) chatBtn.click();
            }}
            className="w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] bg-kawaii-primary/10 text-kawaii-primary hover:bg-kawaii-primary/20 transition-all group border-4 border-dashed border-kawaii-primary/30"
          >
            <Sparkles className="w-6 h-6 flex-shrink-0 group-hover:animate-pulse" />
            <span className="font-black text-lg tracking-tight">Ask Agent</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-zinc-50 z-50 px-4 py-3 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 p-2 rounded-2xl transition-all
              ${isActive ? 'text-kawaii-primary scale-110' : 'text-zinc-300'}
            `}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
        <button 
          onClick={() => setShowThemePicker(!showThemePicker)}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${showThemePicker ? 'text-kawaii-primary' : 'text-zinc-300'}`}
        >
          <Palette className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Theme</span>
        </button>
      </nav>

      {/* Mobile Theme Picker Overlay */}
      <AnimatePresence>
        {showThemePicker && (
          <div className="md:hidden fixed inset-0 z-[60] flex items-end justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowThemePicker(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-white rounded-[3rem] p-8 shadow-2xl mb-20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-zinc-900 tracking-tighter">Pick your magic ✨</h3>
                <button onClick={() => setShowThemePicker(false)} className="p-2 bg-zinc-50 rounded-xl">
                  <Zap className="w-5 h-5 text-zinc-300" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {KAWAII_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setThemeColor(color);
                      setShowThemePicker(false);
                    }}
                    className={`aspect-square rounded-[1.5rem] shadow-sm transition-all border-4 ${currentColor.name === color.name ? 'border-zinc-900 scale-105' : 'border-zinc-50'}`}
                    style={{ backgroundColor: color.primary }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
