import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Zap,
  MessageSquare
} from 'lucide-react';
import { GoalCard } from './GoalCard';
import { PlanItem } from './PlanItem';
import { AIPlan, NotionGoal, NotionTask } from '../services/api';

interface DashboardProps {
  data: { goals: NotionGoal[], tasks: NotionTask[] } | null;
  plan: AIPlan | null;
  generating: boolean;
  error: string | null;
  onGeneratePlan: () => void;
  onCompleteTask: (id: string) => void;
}

export function Dashboard({ 
  data, 
  plan, 
  generating, 
  error, 
  onGeneratePlan, 
  onCompleteTask 
}: DashboardProps) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 mb-2">
            Hello, <span className="text-kawaii-primary transition-colors duration-500">Cutie!</span> ✨
          </h1>
          <p className="text-zinc-500 font-bold text-lg">Ready to make today amazing and super productive?</p>
        </div>
        <button 
          onClick={onGeneratePlan}
          disabled={generating}
          className="kawaii-btn kawaii-btn-primary text-lg py-4 px-8"
        >
          {generating ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 fill-white/20" />}
          {plan ? 'Refresh My Day' : 'Plan My Day!'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Goals & Stats */}
        <div className="lg:col-span-4 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-kawaii-primary transition-colors duration-500">✨ Active Goals</h2>
              <div className="w-8 h-8 bg-kawaii-primary/10 rounded-full flex items-center justify-center transition-colors duration-500">
                <LayoutDashboard className="w-4 h-4 text-kawaii-primary transition-colors duration-500" />
              </div>
            </div>
            <div className="space-y-6">
              {data?.goals.map((goal: any) => (
                <GoalCard 
                  key={goal.id}
                  id={goal.id}
                  name={goal.properties.Name.title[0]?.plain_text || 'Untitled Goal'}
                  progress={goal.properties.Progress.number || 0}
                  category={goal.properties.Category.select?.name || 'General'}
                  deadline={goal.properties.Deadline?.date?.start}
                />
              ))}
            </div>
          </section>

          {plan?.focus_task && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="bg-kawaii-primary/5 border-4 border-kawaii-primary/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-[0_12px_0_0_rgba(0,0,0,0.05)] transition-colors duration-500"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-kawaii-primary/10 rounded-full blur-3xl transition-colors duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-kawaii-primary rounded-xl flex items-center justify-center shadow-lg shadow-kawaii-primary/20 transition-colors duration-500">
                    <Sparkles className="w-5 h-5 text-white fill-white" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-kawaii-primary transition-colors duration-500">AI Super Focus</h2>
                </div>
                <h3 className="text-3xl font-black text-zinc-900 mb-4 leading-tight">
                  {plan.focus_task.task_name}
                </h3>
                <p className="text-zinc-500 font-bold leading-relaxed">
                  {plan.focus_task.reason}
                </p>
              </div>
            </motion.section>
          )}

          {/* Quick Actions */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">✨ Quick Magic</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onGeneratePlan}
                className="kawaii-card p-6 text-left group"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-kawaii-primary group-hover:text-white transition-all duration-500">
                  <RefreshCw className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </div>
                <span className="text-sm font-black block">Re-plan</span>
              </button>
              <button 
                className="kawaii-card p-6 text-left group"
                onClick={() => {
                  const chatBtn = document.querySelector('button[class*="fixed bottom-8"]') as HTMLButtonElement;
                  if (chatBtn) chatBtn.click();
                }}
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-kawaii-primary group-hover:text-white transition-all duration-500">
                  <MessageSquare className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </div>
                <span className="text-sm font-black block">Ask AI</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Today's Plan */}
        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">✨ Today's Adventure</h2>
              {plan && <span className="text-[10px] font-black uppercase tracking-widest text-kawaii-primary bg-kawaii-primary/10 px-4 py-2 rounded-full border-2 border-kawaii-primary/20 transition-colors duration-500">AI Optimized ✨</span>}
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border-4 border-red-100 text-red-600 rounded-[2rem] flex items-center gap-4 font-bold">
                <AlertCircle className="w-6 h-6" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {plan ? (
                  plan.today_plan.map((item, index) => (
                    <motion.div
                      key={item.task_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: index * 0.05 
                      }}
                    >
                      <PlanItem item={item} onComplete={onCompleteTask} />
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white border-4 border-dashed border-zinc-100 rounded-[3rem] p-24 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                      <img 
                        src="https://picsum.photos/seed/kawaii-pattern/800/600" 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="relative z-10">
                      <div className="w-32 h-32 bg-kawaii-bg rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner overflow-hidden">
                        <img 
                          src="https://picsum.photos/seed/kawaii-sparkle/200/200" 
                          alt="Sparkle" 
                          className="w-24 h-24 rounded-2xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-3xl font-black text-zinc-900 mb-4">Ready to sparkle? ✨</h3>
                      <p className="text-zinc-400 font-bold max-w-xs mx-auto mb-10">
                        Let NotionOS sprinkle some AI magic on your workspace and build your perfect day!
                      </p>
                      <button 
                        onClick={onGeneratePlan}
                        disabled={generating}
                        className="kawaii-btn kawaii-btn-primary mx-auto text-lg py-4 px-10"
                      >
                        {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 fill-white/20" />}
                        Generate My Plan!
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {plan?.suggestions && plan.suggestions.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">✨ AI Sparkles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.suggestions.map((suggestion, i) => (
                  <div key={i} className="kawaii-card p-6 flex gap-5 items-start">
                    <div className="w-10 h-10 bg-kawaii-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-500">
                      <Sparkles className="w-5 h-5 text-kawaii-primary fill-kawaii-primary/20 transition-colors duration-500" />
                    </div>
                    <p className="text-sm text-zinc-600 font-bold leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
