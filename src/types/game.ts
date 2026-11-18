export type DifficultyLevel = 1 | 2 | 3;

export type GameScreen = 'INTRO' | 'STAGE' | 'QUESTION' | 'CLEAR' | 'GAME_OVER';

export interface StoryTemplate {
  id: string;
  title: string;
  emoji: string;
  unit: string;
  containerName: string;
  /** Addition context template: {n} will be replaced with givenCount */
  storyAdd: string;
  /** Subtraction-linked context template for level 3: {n} will be replaced with givenCount */
  storySub: string;
  bgTint: string;
}

export interface StoryQuestion {
  index: number; // 0 to 9
  templateId: string;
  title: string;
  emoji: string;
  unit: string;
  containerName: string;
  givenCount: number; // 1..9
  answer: number; // 10 - givenCount
  storyText: string;
  equationMode: 'add' | 'sub';
  choices: number[]; // always 4 unique choices
  bgTint: string;
}

export interface StageBlock {
  id: string;
  type: 'question' | 'star';
  x: number; // World x coordinate (in virtual canvas units)
  y: number; // World y coordinate (bottom of block from top, virtual height 420)
  questionIndex?: number; // 0..9 if type === 'question'
  opened: boolean;
  bumpOffset: number; // Animation offset when hit from below
}

export interface TeacherSettings {
  studentName: string; // Stored ONLY in memory (never saved to localStorage or transmitted)
  difficulty: DifficultyLevel;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  isLocked: boolean;
  pinCode: string; // Default '1234', memory-only
}
