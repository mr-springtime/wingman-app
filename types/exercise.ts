export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Category = 'self-practice' | 'social-practice';

export interface Exercise {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
}