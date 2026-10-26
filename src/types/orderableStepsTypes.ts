export interface OrderableStep { id: string; text: string }
export interface OrderableStepsProps { steps: string[]; onOrderChange: (order: string[]) => void }
export interface SortableStepRowProps { step: OrderableStep; position: number; checked: boolean; correct: boolean }
