// @ts-ignore - Server-side dependencies not needed in client builds
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore - Server-side Firebase SDK (type-only import)
import type { Firestore } from 'firebase/firestore';

// Firestore helper functions will be dynamically imported when a DB is available in production.
let firestoreHelpers: any = null;

export class QueueService {
  private tasks: Map<string, { status: string, result?: any, progress: number, agents?: any[] }> = new Map();
  private db: any;
  private readonly MAX_CACHE_SIZE = 100;
  private firestoreFns: any = null;

  constructor(db: any) {
    this.db = db;
    if (this.db && process.env.NODE_ENV === 'production') {
      import('firebase/firestore').then((m) => {
        this.firestoreFns = {
          doc: m.doc,
          setDoc: m.setDoc,
          getDoc: m.getDoc,
          collection: m.collection,
          query: m.query,
          where: m.where,
          getDocs: m.getDocs,
        };
      }).catch((err) => {
        console.warn('[ODYSEUS QUEUE] Failed to load firestore helpers:', err);
      });
    }
  }

  private evictCache() {
    if (this.tasks.size > this.MAX_CACHE_SIZE) {
      const firstKey = this.tasks.keys().next().value;
      if (firstKey) this.tasks.delete(firstKey);
    }
  }

  async createTask() {
    const id = uuidv4();
    const initialTask = { status: 'queued', progress: 0, createdAt: new Date().toISOString() };
    this.tasks.set(id, initialTask);
    this.evictCache();
    
    if (this.db && this.firestoreFns) {
      try {
        await this.firestoreFns.setDoc(this.firestoreFns.doc(this.db, 'tasks', id), initialTask);
      } catch (e) {
        console.error("Firestore Error (createTask):", e);
      }
    }
    return id;
  }

  async updateTask(id: string, status: string, progress: number, result?: any, agents?: any[]) {
    const task = this.tasks.get(id) || { status, progress };
    
    // Space Check: Firestore has a 1MB limit per document.
    if (result) {
      const size = new TextEncoder().encode(JSON.stringify(result)).length;
      if (size > 800000) { // ~800KB warning
        console.warn(`\x1b[33m[ODYSEUS QUEUE]\x1b[0m Task ${id} result size (${(size / 1024).toFixed(2)} KB) is approaching Firestore 1MB limit.`);
        if (size > 1000000) {
          console.error(`\x1b[31m[ODYSEUS QUEUE]\x1b[0m Task ${id} result size exceeds 1MB. Storage will fail.`);
          // In a real app, we would offload to Firebase Storage here.
        }
      }
    }

    const updatedTask: any = { 
      ...task, 
      status, 
      progress, 
      agents: agents || task.agents || [], 
      updatedAt: new Date().toISOString() 
    };
    
    if (result !== undefined) {
      updatedTask.result = result;
    }

    this.tasks.set(id, updatedTask);
    this.evictCache();
    
    if (this.db && this.firestoreFns) {
      try {
        await this.firestoreFns.setDoc(this.firestoreFns.doc(this.db, 'tasks', id), updatedTask, { merge: true });
      } catch (e) {
        console.error("Firestore Error (updateTask):", e);
      }
    }
  }

  async getTask(id: string) {
    if (this.tasks.has(id)) return this.tasks.get(id);
    
    if (this.db && this.firestoreFns) {
      try {
        const docRef = this.firestoreFns.doc(this.db, 'tasks', id);
        const docSnap = await this.firestoreFns.getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.tasks.set(id, data as any);
          return data;
        }
      } catch (e) {
        console.error("Firestore Error (getTask):", e);
      }
    }
    return null;
  }

  async getActiveTasksCount() {
    if (this.db && this.firestoreFns) {
      try {
        const q = this.firestoreFns.query(this.firestoreFns.collection(this.db, 'tasks'), this.firestoreFns.where('status', 'in', ['processing', 'queued']));
        const querySnapshot = await this.firestoreFns.getDocs(q);
        return querySnapshot.size;
      } catch (e) {
        console.error("Firestore Error (getActiveTasksCount):", e);
      }
    }
    
    let count = 0;
    this.tasks.forEach(t => {
      if (t.status === 'processing' || t.status === 'queued') count++;
    });
    return count;
  }
}
