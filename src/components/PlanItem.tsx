import React from 'react';
import { CheckCircle2, Circle, Clock, Target, Sparkles } from 'lucide-react';
import { AIPlanItem } from '../services/api';

interface PlanItemProps {
  item: AIPlanItem;
  onComplete: (id: string) => void;
}

export const PlanItem: React.FC<PlanItemProps> = ({ item, onComplete }) => {
  return (
    <div className="kawaii-card p-8 group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-kawaii-primary opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-kawaii-primary/5 rounded-xl border border-kawaii-primary/10 transition-colors duration-500">
              <Clock className="w-3.5 h-3.5 text-kawaii-primary transition-colors duration-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-kawaii-primary font-mono transition-colors duration-500">
                {item.start_time} — {item.end_time}
              </span>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-kawaii-primary/10 text-kawaii-primary text-[10px] font-black uppercase tracking-widest border border-kawaii-primary/20 transition-colors duration-500">
              {item.goal_name}
            </span>
          </div>
          
          <h3 className="text-2xl font-black text-zinc-900 mb-3 group-hover:text-kawaii-primary transition-colors duration-500 leading-tight">
            {item.task_name}
          </h3>
          
          <div className="flex items-start gap-3 mb-6 bg-kawaii-bg/50 p-4 rounded-2xl border-2 border-dashed border-zinc-100">
            <Sparkles className="w-5 h-5 text-kawaii-primary mt-0.5 flex-shrink-0 fill-kawaii-primary/20 transition-colors duration-500" />
            <p className="text-sm text-zinc-500 font-bold leading-relaxed italic">
              {item.reason}
            </p>
          </div>
          
          {item.subtasks.length > 0 && (
            <div className="space-y-4 ml-2 border-l-4 border-zinc-50 pl-6 py-2">
              {item.subtasks.map((sub, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-zinc-600 font-bold group/sub">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-100 group-hover/sub:bg-kawaii-primary transition-all duration-500 group-hover/sub:scale-125" />
                    <span className="group-hover/sub:text-zinc-900 transition-colors duration-500">{sub}</span>
                  </div>
                  {item.sub_subtasks && item.sub_subtasks.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {item.sub_subtasks.map((subSub, j) => (
                        <div key={j} className="flex items-center gap-3 text-[11px] text-zinc-400 font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-50" />
                          <span>{subSub}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => onComplete(item.task_id)}
          className="w-16 h-16 rounded-[1.5rem] bg-kawaii-bg flex items-center justify-center text-zinc-200 hover:bg-kawaii-primary hover:text-white hover:scale-110 transition-all duration-500 shadow-[0_6px_0_0_rgba(0,0,0,0.05)] active:translate-y-1 active:shadow-none"
          title="Mark as complete"
        >
          <CheckCircle2 className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
