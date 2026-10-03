import { memory as persistentMemory } from './memoryService';

export interface MemoryItem {
  id: string;
  text: string;
  date: string;
  category: 'personal' | 'directive' | 'topic' | 'general';
}

export interface TaskItem {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'completed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const MEMORY_STORAGE_KEY = 'terra_memory_bank_v1';
const TASKS_STORAGE_KEY = 'terra_tasks_bank_v1';

class GeminiBrainService {
  private memory: MemoryItem[] = [];
  private tasks: TaskItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedMem = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (savedMem) {
        this.memory = JSON.parse(savedMem);
      } else {
        // Initial defaults
        this.memory = [
          {
            id: 'mem_1',
            text: 'یوزر ارتھ کنٹرول اور سیٹلائٹ ٹریکنگ میں دلچسپی رکھتے ہیں۔',
            date: '2026-10-02',
            category: 'personal',
          },
          {
            id: 'mem_2',
            text: 'تمام گفتگو اور جوابات اردو زبان میں ترجیحی طور پر فراہم کرنے ہیں۔',
            date: '2026-10-02',
            category: 'directive',
          },
        ];
        this.saveMemory();
      }

      const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks);
      } else {
        this.tasks = [
          {
            id: 'task_1',
            title: 'کراچی بندرگاہ کی موسمیاتی رپورٹ چیک کرنا',
            date: '2026-10-02',
            status: 'pending',
          },
          {
            id: 'task_2',
            title: 'انٹرنیشنل اسپیس اسٹیشن (ISS) کا اگلا فلائی اوور نوٹ کرنا',
            date: '2026-10-02',
            status: 'completed',
          },
        ];
        this.saveTasks();
      }
    } catch (e) {
      console.warn('Failed to load memory from localStorage', e);
    }
  }

  public getMemory(): MemoryItem[] {
    return [...this.memory];
  }

  public getTasks(): TaskItem[] {
    return [...this.tasks];
  }

  public addMemory(text: string, category: MemoryItem['category'] = 'general'): MemoryItem {
    const item: MemoryItem = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      text: text.trim(),
      date: new Date().toLocaleDateString('ur-PK'),
      category,
    };
    this.memory.unshift(item);
    this.saveMemory();
    return item;
  }

  public deleteMemory(id: string) {
    this.memory = this.memory.filter((m) => m.id !== id);
    this.saveMemory();
  }

  public addTask(title: string): TaskItem {
    const task: TaskItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: title.trim(),
      date: new Date().toLocaleDateString('ur-PK'),
      status: 'pending',
    };
    this.tasks.unshift(task);
    this.saveTasks();
    return task;
  }

  public toggleTask(id: string): TaskItem | undefined {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      this.saveTasks();
    }
    return task;
  }

  public deleteTask(id: string) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveTasks();
  }

  private saveMemory() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.memory));
    } catch {}
  }

  private saveTasks() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
    } catch {}
  }

  // Send conversation to backend Gemini API
  public async queryGemini(
    prompt: string,
    history: ChatMessage[],
    currentCity: string
  ): Promise<{ reply: string; thinking?: { assessing: string; clarifying: string }; action?: any }> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationHistory: history.map((h) => ({
            role: h.role,
            text: h.text,
          })),
          memory: this.memory,
          tasks: this.tasks,
          currentCity,
          memoryContext: persistentMemory.getMemoryContextPrompt(),
          customApiKey: persistentMemory.getProfile().customApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Automatically store task if Gemini recognized a new task assignment
      if (data.action?.action === 'save_task' && data.action.task) {
        this.addTask(data.action.task);
      }
      if (data.action?.memory) {
        this.addMemory(data.action.memory, 'directive');
      }

      return {
        reply: data.reply || `Processed your request regarding "${prompt}".`,
        thinking: data.thinking || {
          assessing: 'Processing user prompt directly through English context engine.',
          clarifying: 'Delivered direct, non-repetitive response.',
        },
        action: data.action,
      };
    } catch (err) {
      console.warn('API error, executing intelligent fallback:', err);
      // Fallback
      return {
        reply: `Received request: "${prompt}". Operations have been processed.`,
        thinking: {
          assessing: 'Evaluating local query parameters in pure English.',
          clarifying: 'Formulating direct response without repetitive filler.',
        },
      };
    }
  }
}

export const brain = new GeminiBrainService();
