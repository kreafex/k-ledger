import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { AppLayout } from '../dashboard/AppLayout'; // <--- USING THE MASTER LAYOUT
import { 
  Plus, CheckCircle, Circle, Trash2, 
  ChevronDown, ChevronRight, Save, Download, Calendar 
} from 'lucide-react';

export const PlannerPage = () => {
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Data
  const [goals, setGoals] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Goal UI State
  const [expandedGoals, setExpandedGoals] = useState({});
  const [selectedParent, setSelectedParent] = useState(null);
  const [addingType, setAddingType] = useState(null); // 'Yearly', 'Monthly', 'Weekly'
  
  // Goal Inputs
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDate, setNewGoalDate] = useState(''); // Stores Year, Month, or specific Date

  // Schedule UI State
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ start: '09:00', end: '10:00', title: '' });
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // --- DATA LOADING ---
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch goals and sort by Target Date then Created At
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .order('target_date', { ascending: true })
      .order('created_at', { ascending: true });
    setGoals(goalsData || []);

    // Fetch Schedule
    const { data: schedData } = await supabase
      .from('daily_schedule')
      .select('*')
      .eq('date', date)
      .eq('owner_id', user.id)
      .order('start_time', { ascending: true });
    setSchedule(schedData || []);

    // Fetch Templates
    const { data: tempData } = await supabase.from('schedule_templates').select('*').eq('owner_id', user.id);
    setTemplates(tempData || []);
    
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [date]);

  // --- GOAL ACTIONS ---
  const handleAddGoal = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Format the date based on input type
    let finalDate = newGoalDate;
    if (addingType === 'Yearly') finalDate = `${newGoalDate}-01-01`; // Input is "2026" -> "2026-01-01"
    else if (addingType === 'Monthly') finalDate = `${newGoalDate}-01`; // Input is "2026-02" -> "2026-02-01"
    // Weekly input is already "2026-02-05"

    await supabase.from('goals').insert([{ 
      owner_id: user.id, 
      title: newGoalTitle, 
      type: addingType, 
      parent_id: selectedParent,
      target_date: finalDate
    }]);
    
    setNewGoalTitle(''); 
    setNewGoalDate('');
    setAddingType(null); 
    loadData();
  };

  const toggleExpand = (id) => setExpandedGoals(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleGoalComplete = async (id, current) => { await supabase.from('goals').update({ is_completed: !current }).eq('id', id); loadData(); };
  const deleteGoal = async (id) => { if(confirm('Delete goal?')) await supabase.from('goals').delete().eq('id', id); loadData(); };

  // --- SCHEDULE ACTIONS ---
  const addTask = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('daily_schedule').insert([{
      owner_id: user.id, date: date, start_time: newTask.start, end_time: newTask.end, task: newTask.title
    }]);
    setTaskModalOpen(false); setNewTask({ start: '09:00', end: '10:00', title: '' }); loadData();
  };
  const toggleTask = async (id, current) => { await supabase.from('daily_schedule').update({ is_completed: !current }).eq('id', id); loadData(); };
  const deleteTask = async (id) => await supabase.from('daily_schedule').delete().eq('id', id).then(loadData);

  // --- TEMPLATE ACTIONS ---
  const saveTemplate = async () => {
    if (!templateName) return alert("Name your template!");
    const { data: { user } } = await supabase.auth.getUser();
    const structure = schedule.map(s => ({ start: s.start_time, end: s.end_time, task: s.task }));
    await supabase.from('schedule_templates').insert([{ owner_id: user.id, name: templateName, items: structure }]);
    setTemplateName(''); setShowSaveTemplate(false); loadData(); alert("Template Saved!");
  };
  const loadTemplate = async (templateId) => {
    if(confirm("Add template tasks to today?")) {
      const { data: { user } } = await supabase.auth.getUser();
      const template = templates.find(t => t.id === templateId);
      const newItems = template.items.map(item => ({
        owner_id: user.id, date: date, start_time: item.start, end_time: item.end, task: item.task
      }));
      await supabase.from('daily_schedule').insert(newItems);
      loadData();
    }
  };

  // --- HELPERS ---
  const completedTasks = schedule.filter(s => s.is_completed).length;
  const dayProgress = schedule.length === 0 ? 0 : Math.round((completedTasks / schedule.length) * 100);

  // Format date label for goals
  const getGoalDateLabel = (dateStr, type) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (type === 'Yearly') return d.getFullYear();
    if (type === 'Monthly') return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (type === 'Weekly') return `Wk ${d.getDate()}/${d.getMonth()+1}`;
    return '';
  };

  // --- RECURSIVE GOAL RENDERER ---
  const renderGoals = (parentId, type) => {
    const currentLevelGoals = goals.filter(g => g.parent_id === parentId && g.type === type);
    
    return currentLevelGoals.map(goal => {
      const isExpanded = expandedGoals[goal.id];
      const nextType = type === 'Yearly' ? 'Monthly' : type === 'Monthly' ? 'Weekly' : null;
      const dateLabel = getGoalDateLabel(goal.target_date, type);

      return (
        <div key={goal.id} className="ml-4 mt-3">
          <div className="flex items-center group">
            
            {/* Expand Arrow */}
            {nextType && (
              <button onClick={() => toggleExpand(goal.id)} className="mr-1 text-gray-400 hover:text-brand-navy">
                {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
              </button>
            )}
            
            {/* Goal Card */}
            <div className={`flex-1 flex items-center justify-between p-2 rounded-md border border-gray-100 hover:border-brand-orange bg-white shadow-sm transition-all ${goal.is_completed ? 'opacity-60 bg-gray-50' : ''}`}>
               <div className="flex items-center gap-2">
                 <button onClick={() => toggleGoalComplete(goal.id, goal.is_completed)}>
                   {goal.is_completed ? <CheckCircle size={18} className="text-green-500"/> : <Circle size={18} className="text-gray-300"/>}
                 </button>
                 <div>
                   <span className={`block text-sm ${type === 'Yearly' ? 'font-bold text-brand-navy' : 'text-gray-700'}`}>{goal.title}</span>
                 </div>
               </div>
               {/* Date Badge */}
               <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-2">
                 {dateLabel}
               </span>
            </div>

            {/* Hover Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
               {nextType && (
                 <button onClick={() => { setAddingType(nextType); setSelectedParent(goal.id); }} className="text-brand-orange hover:bg-orange-50 p-1 rounded" title={`Add ${nextType} Goal`}>
                   <Plus size={14}/>
                 </button>
               )}
               <button onClick={() => deleteGoal(goal.id)} className="text-gray-300 hover:text-red-500 p-1 rounded">
                 <Trash2 size={14}/>
               </button>
            </div>
          </div>

          {/* Expanded Children Area */}
          {isExpanded && (
            <div className="border-l-2 border-gray-100 ml-2 pl-2 pb-2">
              {renderGoals(goal.id, nextType)}
              
              {/* Inline Add Form */}
              {addingType === nextType && selectedParent === goal.id && (
                <form onSubmit={handleAddGoal} className="ml-4 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex gap-2 mb-2">
                    <input autoFocus placeholder={`New ${nextType} Goal...`} className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} required />
                    
                    {/* DYNAMIC DATE INPUT */}
                    {nextType === 'Monthly' && <input type="month" className="border border-gray-300 rounded px-2 py-1 text-xs" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} required />}
                    {nextType === 'Weekly' && <input type="date" className="border border-gray-300 rounded px-2 py-1 text-xs" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} required />}
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setAddingType(null)} className="text-xs text-gray-500">Cancel</button>
                      <button type="submit" className="text-xs bg-brand-navy text-white px-3 py-1 rounded">Save Goal</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-brand-navy">Loading...</div>;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

        {/* COLUMN 1: GOAL LADDER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-brand-navy flex items-center gap-2"><Calendar size={18} className="text-brand-orange"/> Strategic Goals</h2>
            <button onClick={() => { setAddingType('Yearly'); setSelectedParent(null); }} className="text-xs bg-brand-navy text-white px-3 py-1.5 rounded hover:bg-slate-800 shadow-sm transition-all">+ New Yearly Goal</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
            {/* Root Yearly Input */}
            {addingType === 'Yearly' && (
                <form onSubmit={handleAddGoal} className="mb-4 p-4 bg-white rounded-lg border border-brand-navy shadow-sm">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Yearly Goal</label>
                  <div className="flex gap-2">
                    <input autoFocus placeholder="e.g. Save 1 Million KES" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} required />
                    <input type="number" placeholder="2026" min="2024" max="2030" className="w-20 border border-gray-300 rounded px-2 py-2 text-sm" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} required />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                      <button type="button" onClick={() => setAddingType(null)} className="text-xs text-gray-500">Cancel</button>
                      <button type="submit" className="bg-brand-navy text-white px-4 py-1.5 rounded text-xs font-bold">Save Strategy</button>
                  </div>
                </form>
            )}

            {goals.length === 0 && !addingType ? (
              <div className="text-center mt-10 p-6">
                <p className="text-gray-400 text-sm mb-2">No goals set yet.</p>
                <p className="text-xs text-gray-400">Define your yearly strategy to begin.</p>
              </div>
            ) : (
              <div className="-ml-4 pb-10">{renderGoals(null, 'Yearly')}</div>
            )}
          </div>
        </div>

        {/* COLUMN 2: DAILY SCHEDULE (Dynamic List) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-brand-navy">Daily Plan</h2>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white cursor-pointer hover:border-brand-navy"/>
              </div>
              
              {/* Template Dropdown */}
              <div className="relative group">
                <button className="text-xs flex items-center bg-white border border-gray-300 px-3 py-1.5 rounded text-gray-600 hover:text-brand-orange hover:border-brand-orange transition-all"><Download size={14} className="mr-1"/> Load Template</button>
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-10 p-1">
                    {templates.length === 0 ? <p className="text-xs text-gray-400 p-2">No templates.</p> : templates.map(t => <button key={t.id} onClick={() => loadTemplate(t.id)} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded text-gray-700">{t.name}</button>)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3"><div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${dayProgress === 100 ? 'bg-green-500' : 'bg-brand-orange'}`} style={{ width: `${dayProgress}%` }}></div></div><span className="text-xs font-bold text-gray-600">{dayProgress}% Done</span></div>
          </div>

          {/* Dynamic List */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {schedule.length === 0 ? (
                <div className="text-center mt-10">
                  <p className="text-gray-400 text-sm mb-4">No tasks planned for {date}.</p>
                  <button onClick={() => setTaskModalOpen(true)} className="bg-brand-navy text-white px-4 py-2 rounded-md shadow hover:bg-slate-800 flex items-center justify-center mx-auto transition-transform active:scale-95">
                    <Plus size={18} className="mr-2"/> Plan First Task
                  </button>
                </div>
            ) : (
              <div className="space-y-3 pb-10">
                {schedule.map((item) => (
                  <div key={item.id} className={`flex items-center bg-white border rounded-lg p-3 shadow-sm transition-all ${item.is_completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-brand-orange'}`}>
                    <div className="w-24 text-right pr-4 border-r border-gray-100 mr-4">
                        <p className="text-xs font-bold text-gray-700">{item.start_time}</p>
                        <p className="text-[10px] text-gray-400">{item.end_time}</p>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.task}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleTask(item.id, item.is_completed)} className="focus:outline-none transition-transform active:scale-95">
                        {item.is_completed ? <CheckCircle size={22} className="text-green-500"/> : <Circle size={22} className="text-gray-300 hover:text-brand-orange"/>}
                      </button>
                      <button onClick={() => deleteTask(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setTaskModalOpen(true)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm font-medium hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center justify-center">
                  <Plus size={16} className="mr-2"/> Add Next Block
                </button>
              </div>
            )}
          </div>

          {/* Save Template Footer */}
          <div className="p-3 border-t border-gray-100 bg-white flex justify-end">
            {showSaveTemplate ? (
              <div className="flex gap-2">
                <input placeholder="Template Name" className="border rounded px-2 py-1 text-xs" value={templateName} onChange={e => setTemplateName(e.target.value)} />
                <button onClick={saveTemplate} className="text-xs bg-brand-navy text-white px-2 rounded">Save</button>
                <button onClick={() => setShowSaveTemplate(false)} className="text-xs text-gray-500">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowSaveTemplate(true)} className="flex items-center text-xs text-gray-500 hover:text-brand-navy"><Save size={14} className="mr-1"/> Save as Template</button>
            )}
          </div>
        </div>

      </div>

      {/* ADD TASK MODAL (Inside Layout to cover properly) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[300] backdrop-blur-sm">
           <div className="bg-white p-6 rounded-xl shadow-2xl w-80 transform transition-all scale-100">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Add Time Block</h3>
              <form onSubmit={addTask} className="space-y-4">
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1">Start</label>
                     <input type="time" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-navy" value={newTask.start} onChange={e => setNewTask({...newTask, start: e.target.value})} required />
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1">End</label>
                     <input type="time" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-navy" value={newTask.end} onChange={e => setNewTask({...newTask, end: e.target.value})} required />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Task</label>
                   <input className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-navy" autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required placeholder="e.g. Deep Work"/>
                 </div>
                 <div className="flex justify-end gap-3 pt-2">
                   <button type="button" onClick={() => setTaskModalOpen(false)} className="text-gray-500 text-sm hover:bg-gray-100 px-3 py-2 rounded">Cancel</button>
                   <button type="submit" className="bg-brand-navy text-white px-4 py-2 rounded shadow hover:bg-slate-800 text-sm font-medium">Add Block</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </AppLayout>
  );
};