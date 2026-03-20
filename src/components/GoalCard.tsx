import React from 'react';
import { Target, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface GoalCardProps {
  id: string;
  name: string;
  progress: number;
  category: string;
  deadline?: string;
}

export const GoalCard: React.FC<GoalCardProps> = ({ id, name, progress, category, deadline }) => {
  const navigate = useNavigate();
  
  const getDaysRemaining = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = deadline ? getDaysRemaining(deadline) : null;

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/goals/${id}`)}
      className="group bg-white rounded-[2.5rem] p-8 shadow-xl shadow-kawaii-primary/5 border-4 border-zinc-50 hover:border-kawaii-primary/20 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-kawaii-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-kawaii-primary/10 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 bg-kawaii-bg rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Target className="w-7 h-7 text-kawaii-primary" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-4 py-1.5 bg-kawaii-bg text-kawaii-primary rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-kawaii-primary/10">
              {category}
            </span>
            {daysRemaining !== null && (
              <span className={`text-[10px] font-black uppercase tracking-widest ${daysRemaining < 7 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days left`}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-black text-zinc-900 mb-6 tracking-tight leading-tight group-hover:text-kawaii-primary transition-colors">
          {name}
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span>Progress</span>
            <div className="flex items-center gap-1.5 text-kawaii-primary">
              <TrendingUp className="w-3 h-3" />
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-4 bg-kawaii-bg rounded-full p-1 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-kawaii-primary rounded-full shadow-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {deadline ? new Date(deadline).toLocaleDateString() : 'No deadline'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-kawaii-primary group-hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
