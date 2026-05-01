export interface Cell {
  char: string;
  color: string;
  ownerId: string | null; // null for user, or 'ai-0' to 'ai-50'
  life: number; // 0 to 1
  isWall?: boolean;
  isTrap?: boolean;
  isCorrupting?: number;
  hybridColors?: string[];
  isHybrid?: boolean;
  fontWeight?: string;
  fontStyle?: string;
  fontSizeMult?: number;
  action?: string;
  border?: string;
}

export interface Position {
  x: number;
  y: number;
}

export type EnemyBehavior = 'SWARM' | 'FORTRESS' | 'GLITCHER';

export interface Civilization {
  id: string;
  name: string;
  color: string;
  keywords: string[];
  expansionRate: number;
  strength: number;
  asciiArt?: string[];
  behavior: EnemyBehavior;
}

export interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  char: string;
  color: string;
  ownerId: string;
}

export interface Boss {
  id: string;
  civId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  art: string[];
  lastShootTime: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  char: string;
  color: string;
  life: number;
}

export interface DOMEntity {
  id: string;
  type: string;
  shape: string;
  x: number;
  y: number;
  scale: number;
  life: number;
  hp?: number;
  behavior?: string;
  effect?: any;
  svgData?: string;
  cssFilter?: string;
  pathOffset?: number;
  startX?: number;
  startY?: number;
}

export interface GameState {
  integrity: number;
  maxIntegrity: number;
  currentBuffer: string;
  score: number;
  isGameOver: boolean;
  combo: number;
  comboTimer: number;
  xp: number;
  level: number;
  shieldTime: number;
  gravityTime: number;
  typingPosition: Position | null;
  copiedLogic: { civId: string; char: string; color: string } | null;
  screenShake: number;
  invisibleTime: number;
  glitchMode: boolean;
  infiniteLoopTime: number;
  typingDirection: { dx: number; dy: number };
  cursorScale: number;
  cursorPower: number;
  memorySlots: string[];
  entities: DOMEntity[];
  enemyDensity: number;
  screenFlash?: number;
}
