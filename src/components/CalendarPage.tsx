import { NotionTask, NotionGoal, updateTaskStatus } from '../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle, Target, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarPageProps {
  tasks: NotionTask[];
  goals: NotionGoal[];
  onRefresh: () => void;
  onAddTask: (date?: string) => void;
}

export function CalendarPage({ tasks, goals, onRefresh, onAddTask }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      const dueDate = task.properties["Due Date"]?.date?.start;
      if (!dueDate) return false;
      const date = new Date(dueDate);
      return date.getDate() === day && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
    });
  };

  const getGoalsForDay = (day: number) => {
    return goals.filter(goal => {
      const deadline = goal.properties.Deadline?.date?.start;
      if (!deadline) return false;
      const date = new Date(deadline);
      return date.getDate() === day && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    try {
      await updateTaskStatus(taskId, newStatus);
      onRefresh();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const selectedDateStr = selectedDay ? `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : '';
  const dayTasks = selectedDay ? getTasksForDay(selectedDay) : [];
  const dayGoals = selectedDay ? getGoalsForDay(selectedDay) : [];

  return (
    <div className="space-y-12 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 mb-2">Magic Calendar ✨</h1>
          <p className="text-zinc-500 font-bold text-lg">Visualize your schedule across the magical month!</p>
        </div>
        <div className="flex items-center gap-6 bg-white border-4 border-zinc-50 p-3 rounded-[2rem] shadow-sm">
          <button onClick={prevMonth} className="p-3 hover:bg-kawaii-bg rounded-2xl transition-all duration-500 hover:text-kawaii-primary">
            <ChevronLeft className="w-6 h-6 text-zinc-300" />
          </button>
          <span className="text-lg font-black text-zinc-900 min-w-40 text-center uppercase tracking-widest">
            {monthName} {year}
          </span>
          <button onClick={nextMonth} className="p-3 hover:bg-kawaii-bg rounded-2xl transition-all duration-500 hover:text-kawaii-primary">
            <ChevronRight className="w-6 h-6 text-zinc-300" />
          </button>
        </div>
      </div>

      <div className="kawaii-card overflow-hidden shadow-2xl shadow-kawaii-primary/5 transition-colors duration-500">
        <div className="grid grid-cols-7 border-b-4 border-zinc-50 bg-kawaii-bg/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-kawaii-primary transition-colors duration-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-40 border-b-2 border-r-2 border-zinc-50 bg-zinc-50/10" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayTasks = getTasksForDay(day);
            const dayGoals = getGoalsForDay(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            const isSelected = selectedDay === day;

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDay(day)}
                className={`h-40 border-b-2 border-r-2 border-zinc-50 p-4 group hover:bg-kawaii-bg/50 transition-all duration-500 relative cursor-pointer ${isToday ? 'bg-kawaii-primary/5' : ''} ${isSelected ? 'bg-kawaii-primary/10 ring-4 ring-kawaii-primary/20 ring-inset z-10' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
                  isToday ? 'bg-kawaii-primary text-white shadow-[0_4px_0_0_rgba(0,0,0,0.1)]' : 'text-zinc-300 group-hover:text-zinc-900'
                }`}>
                  {day}
                </div>
                <div className="mt-4 space-y-2 overflow-y-auto max-h-24 pr-1 scrollbar-hide">
                  {dayGoals.map(goal => (
                    <div key={goal.id} className="px-3 py-1.5 bg-kawaii-primary text-white rounded-xl text-[10px] font-black truncate shadow-sm border-2 border-white/20">
                      🎯 {goal.properties.Name.title[0]?.plain_text || 'Goal'}
                    </div>
                  ))}
                  {dayTasks.map(task => (
                    <div key={task.id} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold truncate transition-all duration-500 shadow-sm ${
                      task.properties.Status.select?.name === 'Done' ? 'bg-zinc-100 text-zinc-400 line-through' : 'bg-zinc-900 text-white hover:bg-kawaii-primary'
                    }`}>
                      {task.properties.Name.title[0]?.plain_text || 'Untitled'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Sidebar/Overlay */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-kawaii-primary mb-1">Schedule for</p>
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">
                    {monthName} {selectedDay}, {year} ✨
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-3 hover:bg-kawaii-bg rounded-2xl transition-all duration-500 text-zinc-300 hover:text-kawaii-primary"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-12">
                {/* Day Goals */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight text-zinc-900">Deadlines ✨</h3>
                    <span className="px-3 py-1 bg-kawaii-primary/10 text-kawaii-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                      {dayGoals.length} Goals
                    </span>
                  </div>
                  <div className="space-y-4">
                    {dayGoals.length === 0 ? (
                      <p className="text-zinc-400 font-bold text-sm italic">No goal deadlines today!</p>
                    ) : (
                      dayGoals.map(goal => (
                        <div key={goal.id} className="kawaii-card p-6 bg-kawaii-bg/30 border-kawaii-bg flex items-center gap-4">
                          <div className="w-12 h-12 bg-kawaii-primary text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.1)]">
                            <Target className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-zinc-900">{goal.properties.Name.title[0]?.plain_text || 'Goal'}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-kawaii-primary">{goal.properties.Category.select?.name}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Day Tasks */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight text-zinc-900">Tasks ✨</h3>
                    <button 
                      onClick={() => onAddTask(selectedDateStr)}
                      className="flex items-center gap-2 text-kawaii-primary hover:bg-kawaii-bg px-4 py-2 rounded-xl transition-all duration-500"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Task</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {dayTasks.length === 0 ? (
                      <p className="text-zinc-400 font-bold text-sm italic">No tasks scheduled for today!</p>
                    ) : (
                      dayTasks.map(task => {
                        const isDone = task.properties.Status.select?.name === 'Done';
                        return (
                          <div key={task.id} className={`kawaii-card p-6 flex items-center justify-between group transition-all duration-500 ${isDone ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => handleToggleTask(task.id, task.properties.Status.select?.name || 'To Do')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                  isDone ? 'bg-kawaii-primary text-white shadow-[0_4px_0_0_rgba(0,0,0,0.1)]' : 'bg-kawaii-bg text-zinc-300 hover:text-kawaii-primary'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                              </button>
                              <h4 className={`font-black transition-all duration-500 ${isDone ? 'line-through text-zinc-400' : 'text-zinc-900 group-hover:text-kawaii-primary'}`}>
                                {task.properties.Name.title[0]?.plain_text || 'Untitled'}
                              </h4>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
