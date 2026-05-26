export declare class QueueService {
    private tasks;
    private db;
    private readonly MAX_CACHE_SIZE;
    private firestoreFns;
    constructor(db: any);
    private evictCache;
    createTask(): Promise<string>;
    updateTask(id: string, status: string, progress: number, result?: any, agents?: any[]): Promise<void>;
    getTask(id: string): Promise<any>;
    getActiveTasksCount(): Promise<any>;
}
//# sourceMappingURL=queue.service.d.ts.map