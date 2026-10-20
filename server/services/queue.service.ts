// @ts-ignore - Server-side dependencies not needed in client builds
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore - Server-side Firebase SDK (type-only import)
import type { Firestore } from 'firebase/firestore';

// Firestore helpers are loaded lazily when a database is configured.
export class QueueService {
  private tasks: Map<string, { status: string, result?: any, progress: number, agents?: any[] }> = new Map();
  private db: any;
  private readonly MAX_CACHE_SIZE = 100;
  private firestoreFns: any = null;
  private firestoreReady: Promise<void> = Promise.resolve();

  constructor(db: any) {
    this.setDatabase(db);
  }

  setDatabase(db: any) {
    this.db = db;
    if (this.db && process.env.NODE_ENV === 'production' && !this.firestoreFns) {
      this.firestoreReady = import('firebase/firestore').then((m) => {
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
        console.error('[ODYSEUS QUEUE] Firestore helpers failed to load:', err);
        throw new Error('Persistent task storage is configured but Firestore could not be initialized.');
      });
    }
  }

  private requireStorageReady() {
    if (this.db && !this.firestoreFns) {
      throw new Error('Persistent task storage is configured but unavailable.');
    }
  }

  private evictCache() {
    while (this.tasks.size > this.MAX_CACHE_SIZE) {
      const firstKey = this.tasks.keys().next().value;
      if (!firstKey) break;
      this.tasks.delete(firstKey);
    }
  }

  async createTask() {
    await this.firestoreReady;
    this.requireStorageReady();
    const id = uuidv4();
    const initialTask = { status: 'queued', progress: 0, createdAt: new Date().toISOString() };

    // Persist first. Do not return an ID that other serverless instances cannot resolve.
    if (this.db && this.firestoreFns) {
      await this.firestoreFns.setDoc(this.firestoreFns.doc(this.db, 'tasks', id), initialTask);
    }

    this.tasks.set(id, initialTask);
    this.evictCache();
    return id;
  }

  async updateTask(id: string, status: string, progress: number, result?: any, agents?: any[]) {
    await this.firestoreReady;
    this.requireStorageReady();

    const cached = this.tasks.get(id);
    let task = cached;
    if (!task && this.db && this.firestoreFns) {
      const snapshot = await this.firestoreFns.getDoc(this.firestoreFns.doc(this.db, 'tasks', id));
      if (snapshot.exists()) task = snapshot.data();
    }
    task = task || { status, progress };

    const updatedTask: any = {
      ...task,
      status,
      progress,
      agents: agents || task.agents || [],
      updatedAt: new Date().toISOString()
    };
    if (result !== undefined) {
      const size = new TextEncoder().encode(JSON.stringify(result)).length;
      if (size > 1000000) {
        throw new Error(`Task result is too large for persistent storage (${Math.ceil(size / 1024)} KB; limit is approximately 1 MB).`);
      }
      updatedTask.result = result;
    }

    // Only update the local cache after the durable write succeeds.
    if (this.db && this.firestoreFns) {
      await this.firestoreFns.setDoc(this.firestoreFns.doc(this.db, 'tasks', id), updatedTask, { merge: true });
    }

    this.tasks.set(id, updatedTask);
    this.evictCache();
  }

  async getTask(id: string) {
    await this.firestoreReady;
    this.requireStorageReady();

    // Firestore is authoritative in serverless deployments; cache-first reads can
    // otherwise return stale status/results from a previous request instance.
    if (this.db && this.firestoreFns) {
      const snapshot = await this.firestoreFns.getDoc(this.firestoreFns.doc(this.db, 'tasks', id));
      if (!snapshot.exists()) {
        this.tasks.delete(id);
        return null;
      }
      const data = snapshot.data();
      this.tasks.set(id, data as any);
      this.evictCache();
      return data;
    }

    return this.tasks.get(id) || null;
  }

  async getActiveTasksCount() {
    await this.firestoreReady;
    this.requireStorageReady();
    if (this.db && this.firestoreFns) {
      const q = this.firestoreFns.query(
        this.firestoreFns.collection(this.db, 'tasks'),
        this.firestoreFns.where('status', 'in', ['processing', 'queued'])
      );
      const querySnapshot = await this.firestoreFns.getDocs(q);
      return querySnapshot.size;
    }

    let count = 0;
    this.tasks.forEach((task) => {
      if (task.status === 'processing' || task.status === 'queued') count++;
    });
    return count;
  }
}
