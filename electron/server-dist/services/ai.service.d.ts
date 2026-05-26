export declare class AIService {
    private ai;
    constructor();
    generate(prompt: string, isHighThinking?: boolean, agentModels?: Record<string, string>): Promise<string>;
    debug(code: string, error: string | null): Promise<any>;
    lint(code: string, language: string): Promise<any>;
    format(code: string, language: string): Promise<string>;
}
//# sourceMappingURL=ai.service.d.ts.map