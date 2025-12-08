

export enum QuadrantId {
  URGENT_IMPORTANT = 'urgent_important',
  NOT_URGENT_IMPORTANT = 'not_urgent_important',
  URGENT_NOT_IMPORTANT = 'urgent_not_important',
  NOT_URGENT_NOT_IMPORTANT = 'not_urgent_not_important',
}

export interface TodoItem {
  id: string;
  text: string;
}

// Fix: Using a Record type to explicitly define the keys from QuadrantId enum and 'unassigned'
export type ItemsState = Record<QuadrantId | 'unassigned', TodoItem[]>;
