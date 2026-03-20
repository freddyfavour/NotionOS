import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Circle, 
  Plus,
  Clock,
  ChevronRight
} from 'lucide-react';
import { NotionGoal, NotionTask, updateTaskStatus } from '../services/api';
import { motion } from 'motion/react';

interface GoalDetailPageProps {
  goals: NotionGoal[];
  tasks: NotionTask[];
  onRefresh: () => Promise<void>;
  onAddTask: (goalId: string) => void;
}

export function GoalDetailPage({ goals, tasks, onRefresh, onAddTask }: GoalDetailPageProps) {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  
  const normalizeId = (id: string) => id.replace(/-/g, '').toLowerCase();
  const goal = goals.find(g => normalizeId(g.id) === normalizeId(goalId || ''));
  const goalTasks = tasks.filter(t => {
    // Check all properties for a relation that matches the goalId
    return Object.values(t.properties).some((prop: any) => {
      if (prop.type === 'relation' && prop.relation) {
        return prop.relation.some((r: any) => normalizeId(r.id) === normalizeId(goalId || ''));
      }
      return false;
    });
  });

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-black text-zinc-900 mb-4">Goal not found! 🪄</h2>
        <button onClick={() => navigate('/goals')} className="kawaii-btn kawaii-btn-primary">
          Back to Goals
        </button>
      </div>
    );
  }

  const name = goal.properties.Name.title[0]?.plain_text || 'Untitled Goal';
  const category = goal.properties.Category.select?.name || 'Personal';
  const deadline = goal.properties.Deadline.date?.start;
  const progress = goal.properties.Progress.number || 0;

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    try {
      await updateTaskStatus(taskId, newStatus);
      await onRefresh();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/goals')}
          className="flex items-center gap-2 text-zinc-400 font-black uppercase tracking-widest text-xs hover:text-kawaii-primary transition-colors group"
        >
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Goals
        </button>
        
        <button 
          onClick={() => onAddTask(goal.id)}
          className="kawaii-btn kawaii-btn-primary"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Goal Hero */}
      <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-kawaii-primary/5 border-4 border-zinc-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-kawaii-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-kawaii-bg text-kawaii-primary rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-kawaii-primary/10">
                  {category}
                </span>
                {deadline && (
                  <span className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-black text-zinc-900 tracking-tighter leading-tight max-w-2xl">
                {name}
              </h1>
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Goal ID: {goalId}</p>
            </div>
            <div className="w-24 h-24 bg-kawaii-bg rounded-[2rem] flex items-center justify-center shadow-inner">
              <Target className="w-10 h-10 text-kawaii-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest">
              <span className="text-zinc-400">Overall Progress</span>
              <span className="text-kawaii-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-6 bg-kawaii-bg rounded-full p-1.5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-kawaii-primary rounded-full shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-kawaii-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">Associated Tasks</h2>
              <p className="text-zinc-400 font-bold text-sm">Step by step to your dream</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-zinc-100 rounded-xl text-xs font-black text-zinc-500 uppercase tracking-widest">
            {goalTasks.length} Tasks
          </div>
        </div>

        <div className="grid gap-4">
          {goalTasks.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border-4 border-dashed border-zinc-100">
              <p className="text-zinc-400 font-bold mb-6 text-lg">No tasks linked to this goal yet!</p>
              <button 
                onClick={() => onAddTask(goal.id)}
                className="inline-flex items-center gap-2 text-kawaii-primary font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Create the first task
              </button>
            </div>
          ) : (
            goalTasks.map((task, idx) => {
              const taskName = task.properties.Name.title[0]?.plain_text || 'Untitled Task';
              const taskStatus = task.properties.Status.select?.name || 'To Do';
              const taskDate = task.properties['Due Date'].date?.start;
              const isDone = taskStatus === 'Done';

              return (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group bg-white p-6 rounded-[2rem] border-4 transition-all flex items-center justify-between ${
                    isDone ? 'border-zinc-50 opacity-60' : 'border-zinc-50 hover:border-kawaii-primary/20 hover:shadow-xl hover:shadow-kawaii-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleToggleTask(task.id, taskStatus)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isDone ? 'bg-kawaii-primary text-white' : 'bg-kawaii-bg text-kawaii-primary hover:scale-110'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    
                    <div>
                      <h3 className={`font-black text-lg tracking-tight transition-all ${isDone ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                        {taskName}
                      </h3>
                      {taskDate && (
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1">
                          <Clock className="w-3 h-3" />
                          Due {new Date(taskDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                      isDone ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 'bg-kawaii-bg text-kawaii-primary border-kawaii-primary/10'
                    }`}>
                      {taskStatus}
                    </span>
                    <ChevronRight className="w-5 h-5 text-zinc-200 group-hover:text-kawaii-primary transition-colors" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
