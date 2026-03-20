import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Settings, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Plus,
  Target,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  fetchNotionStatus, 
  fetchNotionData, 
  generateAIPlan, 
  updateTaskStatus,
  createGoal,
  createTask,
  AIPlan,
  NotionGoal,
  NotionTask
} from './services/api';
import { ChatSidebar } from './components/ChatSidebar';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TasksPage } from './components/TasksPage';
import { GoalsPage } from './components/GoalsPage';
import { GoalDetailPage } from './components/GoalDetailPage';
import { CalendarPage } from './components/CalendarPage';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<{ goals: NotionGoal[], tasks: NotionTask[] } | null>(null);
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newGoalData, setNewGoalData] = useState({ name: '', category: 'Personal', deadline: '' });
  const [newTaskData, setNewTaskData] = useState({ name: '', goalId: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      const statusData = await fetchNotionStatus();
      setStatus(statusData);
      
      if (statusData.configured) {
        const notionData = await fetchNotionData();
        setData(notionData);
        
        const savedPlan = localStorage.getItem('notion_os_plan');
        if (savedPlan) {
          setPlan(JSON.parse(savedPlan));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const notionData = await fetchNotionData();
      setData(notionData);
    } catch (err: any) {
      console.error("Failed to refresh data:", err);
    }
  };

  const handleGeneratePlan = async () => {
    if (!data) return;
    setGenerating(true);
    setError(null);
    try {
      const newPlan = await generateAIPlan(data.goals, data.tasks);
      setPlan(newPlan);
      localStorage.setItem('notion_os_plan', JSON.stringify(newPlan));
    } catch (err: any) {
      setError("AI generation failed. Please check your API keys.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTaskStatus(taskId, "Done");
      await refreshData();
      
      if (plan) {
        const newPlan = {
          ...plan,
          today_plan: plan.today_plan.filter(item => item.task_id !== taskId)
        };
        setPlan(newPlan);
        localStorage.setItem('notion_os_plan', JSON.stringify(newPlan));
      }
    } catch (err: any) {
      setError("Failed to update task in Notion.");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      await refreshData();
    } catch (err: any) {
      setError("Failed to update task in Notion.");
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGoal(newGoalData.name, newGoalData.category, newGoalData.deadline);
      setShowGoalModal(false);
      setNewGoalData({ name: '', category: 'Personal', deadline: '' });
      await refreshData();
    } catch (err: any) {
      alert("Failed to create goal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTask(newTaskData.name, newTaskData.goalId, newTaskData.dueDate);
      setShowTaskModal(false);
      setNewTaskData({ name: '', goalId: '', dueDate: '' });
      await refreshData();
    } catch (err: any) {
      alert("Failed to create task: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kawaii-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce overflow-hidden border-4 border-kawaii-primary/20 transition-colors duration-500">
            <img 
              src="https://picsum.photos/seed/kawaii-loading-main/200/200" 
              alt="Loading..." 
              className="w-24 h-24 rounded-2xl object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tighter">Summoning Magic... ✨</h2>
            <p className="text-zinc-400 font-bold animate-pulse text-lg">Initializing your magical NotionOS</p>
          </div>
        </div>
      </div>
    );
  }

  if (status && !status.configured) {
    return (
      <div className="min-h-screen bg-kawaii-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border-4 border-zinc-50 rounded-[3rem] p-10 shadow-2xl shadow-kawaii-primary/10 transition-colors duration-500">
          <div className="w-20 h-20 bg-kawaii-primary/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner transition-colors duration-500">
            <Settings className="w-10 h-10 text-kawaii-primary transition-colors duration-500" />
          </div>
          <h1 className="text-4xl font-black text-zinc-900 mb-4 tracking-tighter">Oh No! 🎀</h1>
          <p className="text-zinc-500 font-bold mb-10 text-lg leading-relaxed">Your magical workspace needs some setup to start the adventure!</p>
          
          <div className="space-y-4 mb-10">
            {Object.entries(status.missing).map(([key, missing]) => (
              <div key={key} className="flex items-center gap-4 p-5 rounded-2xl bg-kawaii-bg/30 border-2 border-white">
                {missing ? (
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <AlertCircle className="w-5 h-5 text-kawaii-primary transition-colors duration-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-kawaii-primary rounded-xl flex items-center justify-center shadow-sm transition-colors duration-500">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-sm font-black text-zinc-700 uppercase tracking-widest">
                  {key === 'apiKey' ? 'Notion API Key' : key === 'goalsDb' ? 'Goals Database ID' : 'Tasks Database ID'}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={init}
            className="kawaii-btn kawaii-btn-primary w-full py-5 text-lg"
          >
            <RefreshCw className="w-6 h-6" />
            Try Magic Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-kawaii-bg text-zinc-900 font-sans selection:bg-kawaii-primary/20 flex">
        <Navigation />
        
        <div className="flex-1 md:ml-72 pb-24 md:pb-0">
          <ChatSidebar onRefresh={init} />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-16">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  data={data}
                  plan={plan}
                  generating={generating}
                  error={error}
                  onGeneratePlan={handleGeneratePlan}
                  onCompleteTask={handleCompleteTask}
                />
              } />
              <Route path="/tasks" element={
                <TasksPage 
                  tasks={data?.tasks || []} 
                  goals={data?.goals || []}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onAddTask={() => setShowTaskModal(true)}
                />
              } />
              <Route path="/goals" element={
                <GoalsPage 
                  goals={data?.goals || []}
                  onAddGoal={() => setShowGoalModal(true)}
                />
              } />
              <Route path="/goals/:goalId" element={
                <GoalDetailPage 
                  goals={data?.goals || []} 
                  tasks={data?.tasks || []} 
                  onRefresh={refreshData} 
                  onAddTask={(goalId) => {
                    setNewTaskData(prev => ({ ...prev, goalId }));
                    setShowTaskModal(true);
                  }} 
                />
              } />
              <Route path="/calendar" element={
                <CalendarPage 
                  tasks={data?.tasks || []}
                  goals={data?.goals || []}
                  onRefresh={refreshData}
                  onAddTask={(date) => {
                    setNewTaskData(prev => ({ ...prev, dueDate: date || '' }));
                    setShowTaskModal(true);
                  }}
                />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showGoalModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowGoalModal(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-kawaii-bg rounded-xl transition-colors">
                    <X className="w-6 h-6 text-zinc-300" />
                  </button>
                </div>
                
                <div className="mb-8">
                  <div className="w-16 h-16 bg-kawaii-bg rounded-2xl flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-kawaii-primary" />
                  </div>
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">New Magical Goal ✨</h2>
                  <p className="text-zinc-400 font-bold">What's your next big dream?</p>
                </div>

                <form onSubmit={handleCreateGoal} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Goal Name</label>
                    <input 
                      required
                      type="text"
                      value={newGoalData.name}
                      onChange={e => setNewGoalData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Master the Magic of React"
                      className="w-full px-6 py-4 bg-zinc-50 border-4 border-zinc-50 rounded-2xl font-bold focus:outline-none focus:border-kawaii-primary/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Category</label>
                      <select 
                        value={newGoalData.category}
                        onChange={e => setNewGoalData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-6 py-4 bg-zinc-50 border-4 border-zinc-50 rounded-2xl font-bold focus:outline-none focus:border-kawaii-primary/20 transition-all appearance-none"
                      >
                        <option>Personal</option>
                        <option>Work</option>
                        <option>Health</option>
                        <option>Learning</option>
                        <option>Magic</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Deadline</label>
                      <input 
                        type="date"
                        value={newGoalData.deadline}
                        onChange={e => setNewGoalData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="w-full px-6 py-4 bg-zinc-50 border-4 border-zinc-50 rounded-2xl font-bold focus:outline-none focus:border-kawaii-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-kawaii-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_6px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Goal ✨'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {showTaskModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTaskModal(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-kawaii-bg rounded-xl transition-colors">
                    <X className="w-6 h-6 text-zinc-300" />
                  </button>
                </div>
                
                <div className="mb-8">
                  <div className="w-16 h-16 bg-kawaii-bg rounded-2xl flex items-center justify-center mb-4">
                    <CalendarIcon className="w-8 h-8 text-kawaii-primary" />
                  </div>
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">New Magical Task ✨</h2>
                  <p className="text-zinc-400 font-bold">What needs to be done today?</p>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Task Name</label>
                    <input 
                      required
                      type="text"
                      value={newTaskData.name}
                      onChange={e => setNewTaskData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Brew some magical coffee"
                      className="w-full px-6 py-4 bg-zinc-50 border-4 border-zinc-50 rounded-2xl font-bold focus:outline-none focus:border-kawaii-primary/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Link to Goal</label>
                      <select 
                        value={newTaskData.goalId}
                        onChange={e => setNewTaskData(prev => ({ ...prev, goalId: e.target.value }))}
                        className="w-full px-6 py-4 bg-zinc-50 border-4 border-zinc-50 rounded-2xl font-bold focus:outline-none focus:border-kawaii-primary/20 transition-all appearance-none"
                      >
                        <option value="">None</option>
                        {data?.goals.map(g => (
                          <option key={g.id} value={g.id}>{g.properties.Name.title[0]?.plain_text}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Due Date</label>
                      <input 
                        type="date"
                        value={newTaskData.dueDate}
                        onChange={e => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-6 py-4 bg-zinc-50 border-4 border-zinc-50 rounded-2xl font-bold focus:outline-none focus:border-kawaii-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-kawaii-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_6px_0_0_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task ✨'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
