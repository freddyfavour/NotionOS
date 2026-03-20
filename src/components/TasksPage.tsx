import { Link } from 'react-router-dom';
import { NotionTask, NotionGoal } from '../services/api';
import { CheckCircle2, Circle, Clock, Search, Calendar, Plus, Filter, Target } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TasksPageProps {
  tasks: NotionTask[];
  goals: NotionGoal[];
  onUpdateStatus: (id: string, status: string) => void;
  onAddTask?: () => void;
}

export function TasksPage({ tasks, goals, onUpdateStatus, onAddTask }: TasksPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedGoalId, setSelectedGoalId] = useState('All');

  const normalizeId = (id: string) => id.replace(/-/g, '').toLowerCase();

  const filteredTasks = tasks.filter(task => {
    const name = task.properties.Name.title[0]?.plain_text || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'All' || task.properties.Status.select?.name === filter;
    
    // Check all properties for a relation that matches the selectedGoalId
    const matchesGoal = selectedGoalId === 'All' || Object.values(task.properties).some((prop: any) => {
      if (prop.type === 'relation' && prop.relation) {
        return prop.relation.some((r: any) => normalizeId(r.id) === normalizeId(selectedGoalId));
      }
      return false;
    });
    
    return matchesSearch && matchesStatus && matchesGoal;
  });

  const getGoalName = (goalId?: string) => {
    if (!goalId) return null;
    const goal = goals.find(g => normalizeId(g.id) === normalizeId(goalId));
    return goal?.properties.Name.title[0]?.plain_text;
  };

  const statuses = ['All', 'To Do', 'In Progress', 'Done'];

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-kawaii-primary/10 border-4 border-zinc-50">
              <CheckCircle2 className="w-8 h-8 text-kawaii-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-zinc-900 tracking-tighter">Tasks Adventure ✨</h1>
              <p className="text-zinc-400 font-bold text-lg">Organize your magic and get things done!</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onAddTask}
          className="kawaii-btn kawaii-btn-primary px-8 py-4"
        >
          <Plus className="w-6 h-6" />
          Add Task
        </button>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-kawaii-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search your magical tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white border-4 border-zinc-50 rounded-[2.5rem] font-bold text-lg focus:outline-none focus:border-kawaii-primary/20 shadow-xl shadow-kawaii-primary/5 transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group min-w-[200px]">
            <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-kawaii-primary transition-colors pointer-events-none" />
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full pl-14 pr-10 py-4 bg-white border-4 border-zinc-50 rounded-[2rem] font-black text-[10px] uppercase tracking-widest focus:outline-none focus:border-kawaii-primary/20 shadow-xl shadow-kawaii-primary/5 transition-all appearance-none cursor-pointer text-zinc-400 focus:text-kawaii-primary"
            >
              <option value="All">All Goals ✨</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.properties.Name.title[0]?.plain_text || 'Untitled Goal'}
                </option>
              ))}
            </select>
            <Filter className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
          </div>

          <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border-4 border-zinc-50 overflow-x-auto scrollbar-hide">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === s 
                    ? 'bg-kawaii-primary text-white shadow-lg' 
                    : 'text-zinc-400 hover:text-kawaii-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, idx) => {
            const name = task.properties.Name.title[0]?.plain_text || 'Untitled Task';
            const status = task.properties.Status.select?.name || 'To Do';
            const dueDate = task.properties['Due Date']?.date?.start;
            
            // Find the first relation that points to a goal
            let goalId: string | undefined;
            Object.values(task.properties).some((prop: any) => {
              if (prop.type === 'relation' && prop.relation && prop.relation.length > 0) {
                // Check if this relation ID exists in our goals list
                const possibleGoalId = prop.relation[0].id;
                if (goals.some(g => normalizeId(g.id) === normalizeId(possibleGoalId))) {
                  goalId = possibleGoalId;
                  return true;
                }
              }
              return false;
            });

            const goalName = getGoalName(goalId);
            const isDone = status === 'Done';

            return (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className={`group bg-white p-8 rounded-[3rem] border-4 transition-all relative overflow-hidden ${
                  isDone ? 'border-zinc-50 opacity-60' : 'border-zinc-50 hover:border-kawaii-primary/20 hover:shadow-2xl hover:shadow-kawaii-primary/5'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-kawaii-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-kawaii-primary/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                        isDone ? 'bg-zinc-100 text-zinc-400 border-zinc-200' :
                        status === 'In Progress' ? 'bg-kawaii-bg text-kawaii-primary border-kawaii-primary/10' :
                        'bg-zinc-50 text-zinc-400 border-zinc-100'
                      }`}>
                        {status}
                      </span>
                      {dueDate && (
                        <span className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-50 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-zinc-100">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {goalName && (
                      <Link 
                        to={`/goals/${goalId}`}
                        className="flex items-center gap-2 bg-kawaii-bg px-4 py-1.5 rounded-full border-2 border-kawaii-primary/10 hover:border-kawaii-primary/30 transition-all group/goal"
                      >
                        <Target className="w-3.5 h-3.5 text-kawaii-primary" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-kawaii-primary truncate max-w-[120px]">
                            {goalName}
                          </span>
                          <span className="text-[8px] font-bold text-kawaii-primary/60 truncate max-w-[120px]">
                            ID: {goalId?.slice(0, 8)}...
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>

                  <h3 className={`text-2xl font-black tracking-tight leading-tight mb-8 transition-all ${
                    isDone ? 'text-zinc-400 line-through' : 'text-zinc-900 group-hover:text-kawaii-primary'
                  }`}>
                    {name}
                  </h3>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onUpdateStatus(task.id, isDone ? 'To Do' : 'Done')}
                      className={`flex-1 kawaii-btn py-4 text-xs ${
                        isDone ? 'bg-zinc-100 text-zinc-400 shadow-none' : 'kawaii-btn-primary'
                      }`}
                    >
                      {isDone ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      {isDone ? 'Undo' : 'Finish!'}
                    </button>
                    {!isDone && status === 'To Do' && (
                      <button 
                        onClick={() => onUpdateStatus(task.id, 'In Progress')}
                        className="kawaii-btn kawaii-btn-secondary py-4 px-6 text-xs"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-32 bg-white border-4 border-dashed border-zinc-100 rounded-[3rem]">
          <div className="w-20 h-20 bg-kawaii-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Search className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 mb-2 tracking-tighter">No magic found! ✨</h3>
          <p className="text-zinc-400 font-bold">Try searching for something else or change your filters.</p>
        </div>
      )}
    </div>
  );
}
