// Long-Term Persistent Memory Service for Archer AI
// Remembers user identity, preferences, projects, contacts, and custom permissions/API settings.

export interface UserContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
}

export interface BuiltProject {
  id: string;
  name: string;
  type: 'website' | 'app' | 'script' | 'landing_page';
  description: string;
  htmlCode: string;
  cssCode?: string;
  jsCode?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface SystemPermissions {
  microphone: boolean;
  camera: boolean;
  chromeAccess: boolean;
  instagramAccess: boolean;
  whatsappAccess: boolean;
  contactsAccess: boolean;
}

export interface UserMemoryProfile {
  userName: string;
  userRole: string;
  notes: string[];
  projects: BuiltProject[];
  contacts: UserContact[];
  permissions: SystemPermissions;
  customApiKey?: string;
}

const STORAGE_KEY = 'archer_ai_long_term_memory_v1';

const DEFAULT_PROFILE: UserMemoryProfile = {
  userName: '',
  userRole: 'Creator & Engineer',
  notes: [
    'Archer AI initialized with persistent neural memory.',
  ],
  projects: [
    {
      id: 'proj_default',
      name: 'Cyberpunk Portfolio',
      type: 'website',
      description: 'A dark neon responsive personal portfolio with interactive cards.',
      htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberpunk Studio</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0a0b10; color: #fff; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .hero { max-width: 600px; text-align: center; border: 1px solid #1e293b; padding: 3rem 2rem; border-radius: 20px; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { font-size: 2.2rem; background: linear-gradient(135deg, #00f3ff, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
    p { color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
    .btn { display: inline-block; padding: 0.8rem 1.8rem; background: #00f3ff; color: #000; font-weight: bold; border-radius: 50px; text-decoration: none; transition: 0.3s; cursor: pointer; border: none; }
    .btn:hover { background: #ff007f; color: #fff; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255,0,127,0.4); }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Built with Archer AI</h1>
    <p>This is a live website built by Archer AI. You can command Archer to modify colors, add forms, create new sections, or build completely custom apps.</p>
    <button class="btn" onclick="alert('Archer AI Project Engine active!')">Explore Project</button>
  </div>
</body>
</html>`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  ],
  contacts: [
    {
      id: 'c_1',
      name: 'Ali Khan',
      phone: '+923001234567',
      email: 'ali@example.com',
      relationship: 'Friend & Colleague',
    },
    {
      id: 'c_2',
      name: 'Ahmed Developer',
      phone: '+923219876543',
      email: 'ahmed@tech.com',
      relationship: 'Developer Partner',
    },
  ],
  permissions: {
    microphone: true,
    camera: true,
    chromeAccess: true,
    instagramAccess: true,
    whatsappAccess: true,
    contactsAccess: true,
  },
  customApiKey: '',
};

class MemoryService {
  private profile: UserMemoryProfile;

  constructor() {
    this.profile = this.loadMemory();
  }

  private loadMemory(): UserMemoryProfile {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Could not load memory from localStorage', e);
    }
    return DEFAULT_PROFILE;
  }

  public saveMemory(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      }
    } catch (e) {
      console.warn('Could not save memory to localStorage', e);
    }
  }

  public getProfile(): UserMemoryProfile {
    return this.profile;
  }

  public setUserName(name: string): void {
    this.profile.userName = name.trim();
    this.addNote(`User specified their name as: "${name.trim()}".`);
    this.saveMemory();
  }

  public addNote(note: string): void {
    this.profile.notes.unshift(`${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${note}`);
    if (this.profile.notes.length > 50) {
      this.profile.notes = this.profile.notes.slice(0, 50);
    }
    this.saveMemory();
  }

  // Project management
  public saveProject(project: Omit<BuiltProject, 'id' | 'createdAt' | 'updatedAt' | 'version'> & { id?: string }): BuiltProject {
    const existingIdx = this.profile.projects.findIndex(p => p.id === project.id);
    const now = new Date().toISOString();

    if (existingIdx >= 0) {
      const existing = this.profile.projects[existingIdx];
      const updated: BuiltProject = {
        ...existing,
        ...project,
        updatedAt: now,
        version: existing.version + 1,
      };
      this.profile.projects[existingIdx] = updated;
      this.addNote(`Updated project "${updated.name}" to version ${updated.version}.`);
      this.saveMemory();
      return updated;
    } else {
      const newProj: BuiltProject = {
        id: project.id || `proj_${Date.now()}`,
        name: project.name,
        type: project.type,
        description: project.description,
        htmlCode: project.htmlCode,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      this.profile.projects.unshift(newProj);
      this.addNote(`Created new project "${newProj.name}".`);
      this.saveMemory();
      return newProj;
    }
  }

  public getProject(id: string): BuiltProject | undefined {
    return this.profile.projects.find(p => p.id === id);
  }

  public getLatestProject(): BuiltProject | undefined {
    return this.profile.projects[0];
  }

  // Contacts management
  public addContact(contact: Omit<UserContact, 'id'>): UserContact {
    const newContact: UserContact = {
      id: `c_${Date.now()}`,
      ...contact,
    };
    this.profile.contacts.push(newContact);
    this.addNote(`Added contact "${contact.name}" (${contact.phone}).`);
    this.saveMemory();
    return newContact;
  }

  public findContact(query: string): UserContact | undefined {
    const q = query.toLowerCase().trim();
    return this.profile.contacts.find(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }

  // Permissions & Custom API Key
  public updatePermissions(perms: Partial<SystemPermissions>): void {
    this.profile.permissions = { ...this.profile.permissions, ...perms };
    this.saveMemory();
  }

  public setCustomApiKey(key: string): void {
    this.profile.customApiKey = key.trim();
    this.saveMemory();
  }

  /**
   * Generates a context summary string to inject into the Gemini Master Prompt
   */
  public getMemoryContextPrompt(): string {
    const p = this.profile;
    const userGreeting = p.userName ? `The user's name is "${p.userName}". Always address them respectfully by name.` : 'User name not set yet. If they tell you their name, remember it.';
    const projectsList = p.projects.map(proj => `• ${proj.name} (v${proj.version}): ${proj.description}`).join('\n');
    const contactsList = p.contacts.map(c => `• ${c.name}: ${c.phone}`).join('\n');
    const recentNotes = p.notes.slice(0, 5).join('\n');

    return `
=== ARCHER PERSISTENT LONG-TERM MEMORY ===
${userGreeting}
Recent Memory Notes:
${recentNotes || 'None'}

User's Built Projects:
${projectsList || 'No projects yet'}

User's Known Contacts:
${contactsList || 'No contacts yet'}
==========================================`;
  }
}

export const memory = new MemoryService();
