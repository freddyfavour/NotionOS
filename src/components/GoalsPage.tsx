import { NotionGoal } from '../services/api';
import { Target, LayoutGrid, List, Plus, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { GoalCard } from './GoalCard';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface GoalsPageProps {
  goals: NotionGoal[];
  onAddGoal?: () => void;
}

export function GoalsPage({ goals, onAddGoal }: GoalsPageProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredGoals = goals.filter(goal => 
    goal.properties.Name.title[0]?.plain_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-kawaii-primary/10 border-4 border-zinc-50">
              <Target className="w-8 h-8 text-kawaii-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-zinc-900 tracking-tighter">Your Dreams ✨</h1>
              <p className="text-zinc-400 font-bold text-lg">Turning magic into reality, one goal at a time</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border-4 border-zinc-50">
            <button 
              onClick={() => setView('grid')}
              className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-kawaii-primary text-white shadow-lg' : 'text-zinc-300 hover:text-zinc-500'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-kawaii-primary text-white shadow-lg' : 'text-zinc-300 hover:text-zinc-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={onAddGoal}
            className="kawaii-btn kawaii-btn-primary px-8 py-4"
          >
            <Plus className="w-6 h-6" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-kawaii-primary transition-colors" />
        <input 
          type="text"
          placeholder="Search your magical goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-white border-4 border-zinc-50 rounded-[2.5rem] font-bold text-lg focus:outline-none focus:border-kawaii-primary/20 shadow-xl shadow-kawaii-primary/5 transition-all"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredGoals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                id={goal.id}
                name={goal.properties.Name.title[0]?.plain_text || 'Untitled Goal'}
                progress={goal.properties.Progress.number || 0}
                category={goal.properties.Category.select?.name || 'Personal'}
                deadline={goal.properties.Deadline?.date?.start}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[3rem] border-4 border-zinc-50 shadow-xl overflow-hidden"
          >
            <div className="divide-y-4 divide-zinc-50">
              {filteredGoals.map((goal) => {
                const name = goal.properties.Name.title[0]?.plain_text || 'Untitled Goal';
                const progress = goal.properties.Progress.number || 0;
                const category = goal.properties.Category.select?.name || 'Personal';
                const deadline = goal.properties.Deadline?.date?.start;

                return (
                  <div 
                    key={goal.id}
                    onClick={() => navigate(`/goals/${goal.id}`)}
                    className="p-8 hover:bg-kawaii-bg/30 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-8 flex-1">
                      <div className="w-14 h-14 bg-kawaii-bg rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Target className="w-7 h-7 text-kawaii-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight group-hover:text-kawaii-primary transition-colors">
                          {name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-kawaii-primary">
                            {category}
                          </span>
                          {deadline && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                              Due {new Date(deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-12">
                      <div className="w-48 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          <span>Progress</span>
                          <span className="text-kawaii-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 bg-kawaii-bg rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-kawaii-primary transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-zinc-200 group-hover:text-kawaii-primary transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredGoals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-zinc-100">
          <p className="text-zinc-400 font-bold text-xl">No magical goals found matching your search! 🪄</p>
        </div>
      )}
    </div>
  );
}
