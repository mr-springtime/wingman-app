export interface JournalEntry {
  id: string;
  exerciseId: string;
  completionDate: string;
  comment: string;
  mood: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}