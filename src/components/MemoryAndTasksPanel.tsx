import React, { useState } from 'react';
import { brain, MemoryItem, TaskItem } from '../services/geminiBrainService';
import { sound } from '../services/soundEffects';
import { CheckSquare, Square, Trash2, Plus, Brain, ListTodo, CheckCircle, Clock } from 'lucide-react';

export const MemoryAndTasksPanel: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(brain.getTasks());
  const [memory, setMemory] = useState<MemoryItem[]>(brain.getMemory());
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [subTab, setSubTab] = useState<'tasks' | 'memory'>('tasks');

  const refreshData = () => {
    setTasks(brain.getTasks());
    setMemory(brain.getMemory());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    sound.playExecuteSuccess();
    brain.addTask(newTaskInput.trim());
    setNewTaskInput('');
    refreshData();
  };

  const handleToggleTask = (id: string) => {
    sound.playBlip(1100);
    brain.toggleTask(id);
    refreshData();
  };

  const handleDeleteTask = (id: string) => {
    sound.playBlip(800);
    brain.deleteTask(id);
    refreshData();
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryInput.trim()) return;
    sound.playExecuteSuccess();
    brain.addMemory(newMemoryInput.trim(), 'general');
    setNewMemoryInput('');
    refreshData();
  };

  const handleDeleteMemory = (id: string) => {
    sound.playBlip(800);
    brain.deleteMemory(id);
    refreshData();
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-black/60 border border-slate-800/80 rounded-xl backdrop-blur-md overflow-hidden text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider">
            AI Brain Memory & Task Tracker (یادداشت اور ٹاسکس)
          </span>
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              sound.playBlip(900);
              setSubTab('tasks');
            }}
            className={`px-2.5 py-1 rounded text-[11px] transition-all ${
              subTab === 'tasks' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'
            }`}
          >
            ٹاسکس ({tasks.length})
          </button>
          <button
            onClick={() => {
              sound.playBlip(900);
              setSubTab('memory');
            }}
            className={`px-2.5 py-1 rounded text-[11px] transition-all ${
              subTab === 'memory' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'
            }`}
          >
            یادداشت ({memory.length})
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* SUBTAB 1: TASKS */}
        {subTab === 'tasks' && (
          <div className="space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">کل کام (TOTAL):</span>
                <span className="font-bold text-white text-sm">{tasks.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">مکمل شدہ (DONE):</span>
                <span className="font-bold text-emerald-400 text-sm">{completedCount}</span>
              </div>
            </div>

            {/* Add Task Input Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="نیا کام یا ٹاسک درج کریں..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans text-right"
                dir="rtl"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>شامل کریں</span>
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-sans">
                  کوئی ٹاسک موجود نہیں۔ آپ بول کر بھی کہہ سکتے ہیں: "یہ کام یاد رکھو کہ..."
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      task.status === 'completed'
                        ? 'bg-slate-950/60 border-slate-800/60 text-slate-400 line-through opacity-75'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {task.status === 'completed' ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 text-right font-sans text-xs sm:text-sm" dir="rtl">
                      {task.title}
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5 text-left" dir="ltr">
                        {task.date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                      title="ڈیلیٹ کریں"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: MEMORY BANK */}
        {subTab === 'memory' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed" dir="rtl">
              یہ وہ باتیں، معلومات اور ترجیحات ہیں جو جمنی نے گفتگو کے دوران اپنے مستقل دماغ میں محفوظ کی ہیں۔
            </p>

            {/* Add Memory Form */}
            <form onSubmit={handleAddMemory} className="flex gap-2">
              <input
                type="text"
                value={newMemoryInput}
                onChange={(e) => setNewMemoryInput(e.target.value)}
                placeholder="کوئی نئی حقیقت یا یادداشت درج کریں..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans text-right"
                dir="rtl"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>محفوظ کریں</span>
              </button>
            </form>

            {/* Memories List */}
            <div className="space-y-2">
              {memory.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-right"
                >
                  <div className="flex-1 font-sans text-xs sm:text-sm text-slate-200" dir="rtl">
                    {mem.text}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono text-left" dir="ltr">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 uppercase text-[9px]">
                        {mem.category}
                      </span>
                      <span>{mem.date}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="ڈیلیٹ کریں"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
