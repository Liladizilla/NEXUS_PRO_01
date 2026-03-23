import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export class QueueService {
  private tasks: Map<string, { status: string, result?: any, progress: number, agents?: any[] }> = new Map();
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async createTask() {
    const id = uuidv4();
    const initialTask = { status: 'queued', progress: 0, createdAt: new Date().toISOString() };
    this.tasks.set(id, initialTask);
    
    if (this.db) {
      try {
        await setDoc(doc(this.db, 'tasks', id), initialTask);
      } catch (e) {
        console.error("Firestore Error (createTask):", e);
      }
    }
    return id;
  }

  async updateTask(id: string, status: string, progress: number, result?: any, agents?: any[]) {
    const task = this.tasks.get(id) || { status, progress };
    const updatedTask = { ...task, status, progress, result, agents: agents || task.agents, updatedAt: new Date().toISOString() };
    this.tasks.set(id, updatedTask);
    
    if (this.db) {
      try {
        await setDoc(doc(this.db, 'tasks', id), updatedTask, { merge: true });
      } catch (e) {
        console.error("Firestore Error (updateTask):", e);
      }
    }
  }

  async getTask(id: string) {
    if (this.tasks.has(id)) return this.tasks.get(id);
    
    if (this.db) {
      try {
        const docRef = doc(this.db, 'tasks', id);
        const docSnap = await getDoc(docRef);
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
    if (this.db) {
      try {
        const q = query(collection(this.db, 'tasks'), where('status', 'in', ['processing', 'queued']));
        const querySnapshot = await getDocs(q);
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
