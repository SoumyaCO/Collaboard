export interface Drawing {
    userId: string;
    tool: string;
    strokeWidth: number;
    color: string;
    drawing: {
        startX: number;
        startY: number;
        length?: number;   // incase drawing with pen tool
        width?: number;   // incase drawing with pen tool
    }
}