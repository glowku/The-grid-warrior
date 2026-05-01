import { Cell, Position, Civilization, GameState, Boss, Projectile, Particle, EnemyBehavior } from './types';
import { sound } from './SoundEngine';

  const LANGUAGES = [
    { name: 'Python', color: '#3776ab', keywords: ['IMPORT', 'DEF', 'CLASS', 'ELIF', 'YIELD'], asciiArt: [' ▄▄▄ ', '█ ▄ █', '█▄▄▄█', ' ▀█▀ ', ' ▀▀▀ '] },
    { name: 'Rust', color: '#dea584', keywords: ['FN', 'MUT', 'MATCH', 'IMPL', 'CRATE'], asciiArt: [' ▀▄▀ ', '█▀█▀█', '█   █', '█▄█▄█', ' ▀ ▀ '] },
    { name: 'C++', color: '#f34b7d', keywords: ['NAMESPACE', 'TEMPLATE', 'VIRTUAL', 'INCLUDE', 'COUT'], asciiArt: [' ▄▄▄ ', '█   █', '█ █ █', '█▄▄▄█', ' ▀ ▀ '] },
    { name: 'JavaScript', color: '#f1e05a', keywords: ['CONST', 'AWAIT', 'ASYNC', 'EXPORT', 'PROMISE'], asciiArt: ['▀▀█▀▀', '  █  ', '  █  ', '█ █  ', '▀▀▀  '] },
    { name: 'Go', color: '#00add8', keywords: ['FUNC', 'CHAN', 'DEFER', 'GOROUTINE', 'GOTO'], asciiArt: [' ▄▄▄ ', '█ ▄▄ ', '█  █ ', '█▄▄█ ', ' ▀▀▀ '] },
    { name: 'Haskell', color: '#5e5086', keywords: ['DATA', 'NEWTYPE', 'INSTANCE', 'MODULE', 'WHERE'], asciiArt: ['█   █', '█   █', '█████', '█   █', '█   █'] },
    { name: 'Ruby', color: '#701516', keywords: ['YIELD', 'UNLESS', 'UNTIL', 'BEGIN', 'RESCUE'], asciiArt: ['  ▄  ', ' █ █ ', '█   █', ' █ █ ', '  ▀  '] },
    { name: 'C#', color: '#178600', keywords: ['USING', 'STATIC', 'VOID', 'VIRTUAL', 'EVENT'], asciiArt: [' ▄▄▄ ', '█   █', '█▄▄▄ ', '█   █', ' ▀▀▀ '] },
    { name: 'Java', color: '#b07219', keywords: ['PUBLIC', 'IMPLEMENTS', 'EXTENDS', 'THROWS', 'FINAL'], asciiArt: [' ▀▄  ', '  █  ', '  █  ', '█▄█  ', ' ▀▀  '] },
    { name: 'PHP', color: '#4f5d95', keywords: ['ECHO', 'ARRAY', 'FOREACH', 'TRAIT', 'GLOBAL'], asciiArt: ['████ ', '█  █ ', '████ ', '█    ', '█    '] },
    { name: 'Swift', color: '#ffac45', keywords: ['GUARD', 'DEINIT', 'INOUT', 'THROWS', 'TYPEALIAS'], asciiArt: [' ▄▄▄ ', '█▄▄▄█', '  █  ', ' █ █ ', '█   █'] },
    { name: 'Kotlin', color: '#F18E33', keywords: ['FUN', 'VAL', 'VAR', 'COMPANION', 'INLINE'], asciiArt: ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'] },
    { name: 'TypeScript', color: '#3178c6', keywords: ['TYPE', 'INTERFACE', 'DECORATOR', 'DECLARE', 'READONLY'], asciiArt: ['▀▀█▀▀', '  █  ', '  █  ', '  █  ', '  ▀  '] },
    { name: 'Scala', color: '#c22d40', keywords: ['DEF', 'VAL', 'YIELD', 'IMPLICIT', 'MATCH'], asciiArt: [' ▄▄▄ ', '█   █', ' ▀▀▄ ', '▄▄▄█ ', ' ▀▀▀ '] },
    { name: 'Dart', color: '#00B4AB', keywords: ['MIXIN', 'FACTORY', 'LATE', 'YIELD', 'ASYNC'], asciiArt: ['████ ', '█   █', '█   █', '█   █', '████ '] },
    { name: 'OCaml', color: '#3be133', keywords: ['LET', 'REC', 'MATCH', 'WITH', 'VAL'], asciiArt: [' ▄▄▄ ', '█   █', '█   █', '█   █', ' ▀▀▀ '] },
    { name: 'Elixir', color: '#6e4a7e', keywords: ['DEFMODULE', 'DEF', 'DO', 'RESCUE', 'CATCH'], asciiArt: ['█████', '█    ', '███  ', '█    ', '█████'] },
    { name: 'Clojure', color: '#db5855', keywords: ['DEF', 'DEFN', 'LET', 'LOOP', 'RECUR'], asciiArt: [' ▄▄▄ ', '█   █', '█    ', '█   █', ' ▀▀▀ '] },
    { name: 'Lua', color: '#000080', keywords: ['LOCAL', 'FUNCTION', 'THEN', 'END', 'REPEAT'], asciiArt: ['█    ', '█    ', '█    ', '█    ', '█████'] },
    { name: 'Perl', color: '#0298c3', keywords: ['MY', 'SUB', 'USE', 'REQUIRE', 'UNLESS'], asciiArt: ['████ ', '█   █', '████ ', '█    ', '█    '] },
    { name: 'Erlang', color: '#B83998', keywords: ['SPAWN', 'RECEIVE', 'MODULE', 'EXPORT', 'CASE'], asciiArt: ['█████', '█    ', '████ ', '█    ', '█████'] },
    { name: 'F#', color: '#b845fc', keywords: ['LET', 'MUTABLE', 'MATCH', 'WITH', 'TYPE'], asciiArt: ['█████', '█    ', '████ ', '█    ', '█    '] },
    { name: 'Groovy', color: '#e69f56', keywords: ['DEF', 'CLASS', 'CLOSURE', 'IT', 'TRAIT'], asciiArt: [' ▄▄▄ ', '█    ', '█ ▀█ ', '█  █ ', ' ▀▀▀ '] },
    { name: 'Julia', color: '#a270ba', keywords: ['FUNCTION', 'END', 'MACRO', 'QUOTE', 'STRUCT'], asciiArt: ['  █  ', '  █  ', '  █  ', '█ █  ', ' ▀▀  '] },
    { name: 'Nim', color: '#ffc200', keywords: ['PROC', 'VAR', 'LET', 'MACRO', 'TEMPLATE'], asciiArt: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'] },
    { name: 'R', color: '#198ce7', keywords: ['FUNCTION', 'DATAFRAME', 'MATRIX', 'APPLY', 'NULL'], asciiArt: ['████ ', '█   █', '████ ', '█  █ ', '█   █'] },
    { name: 'V', color: '#4f87c4', keywords: ['FN', 'MUT', 'PUB', 'STRUCT', 'MATCH'], asciiArt: ['█   █', '█   █', '█   █', ' █ █ ', '  ▀  '] },
    { name: 'Zig', color: '#ec915c', keywords: ['FN', 'COMPTIME', 'CONST', 'VAR', 'PUB'], asciiArt: ['█████', '   █ ', '  █  ', ' █   ', '█████'] },
    { name: 'Crystal', color: '#000100', keywords: ['DEF', 'CLASS', 'MODULE', 'MACRO', 'YIELD'], asciiArt: [' ▄▄▄ ', '█   █', '█    ', '█   █', ' ▀▀▀ '] },
    { name: 'Vim script', color: '#199f4b', keywords: ['LET', 'FUNCTION', 'ENDFUNCTION', 'IF', 'ENDIF'], asciiArt: ['█   █', '█   █', ' █ █ ', ' █ █ ', '  ▀  '] },
    { name: 'MATLAB', color: '#e16737', keywords: ['FUNCTION', 'END', 'FOR', 'WHILE', 'IF'], asciiArt: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'] },
    { name: 'Fortran', color: '#4d41b1', keywords: ['PROGRAM', 'SUBROUTINE', 'IMPLICIT', 'CALL', 'END'], asciiArt: ['█████', '█    ', '████ ', '█    ', '█    '] },
    { name: 'COBOL', color: '#000000', keywords: ['IDENTIFICATION', 'DIVISION', 'PIC', 'VALUE', 'PERFORM'], asciiArt: [' ▄▄▄ ', '█   █', '█    ', '█   █', ' ▀▀▀ '] },
    { name: 'ABAP', color: '#E8274B', keywords: ['REPORT', 'DATA', 'TYPE', 'FORM', 'PERFORM'], asciiArt: ['  ▄  ', ' █ █ ', '█████', '█   █', '█   █'] },
    { name: 'Ada', color: '#02f88c', keywords: ['PROCEDURE', 'PACKAGE', 'BEGIN', 'END', 'TASK'], asciiArt: ['  ▄  ', ' █ █ ', '█████', '█   █', '█   █'] },
    { name: 'Prolog', color: '#74283c', keywords: ['RULE', 'FACT', 'GOAL', 'CUT', 'FAIL'], asciiArt: ['████ ', '█   █', '████ ', '█    ', '█    '] },
    { name: 'Lisp', color: '#3fb68b', keywords: ['DEFUN', 'COND', 'CAR', 'CDR', 'LAMBDA'], asciiArt: ['█    ', '█    ', '█    ', '█    ', '█████'] },
    { name: 'Scheme', color: '#1e4aec', keywords: ['DEFINE', 'LAMBDA', 'COND', 'LET', 'CALL-WITH-CURRENT-CONTINUATION'], asciiArt: [' ▄▄▄ ', '█    ', ' ▀▀▄ ', '   █ ', '▀▀▀  '] },
    { name: 'Assembly', color: '#6E4C13', keywords: ['MOV', 'PUSH', 'POP', 'EAX', 'JMP'], asciiArt: ['  ▄  ', ' █ █ ', '█████', '█   █', '█   █'] },
    { name: 'Brainfuck', color: '#2F2530', keywords: ['+', '-', '<', '>', '['], asciiArt: ['████ ', '█   █', '████ ', '█   █', '████ '] },
    { name: 'Solidity', color: '#AA6746', keywords: ['CONTRACT', 'PRAGMA', 'MODIFIER', 'PAYABLE', 'EMIT'], asciiArt: [' ▄▄▄ ', '█    ', ' ▀▀▄ ', '   █ ', '▀▀▀  '] },
    { name: 'GLSL', color: '#5686a5', keywords: ['UNIFORM', 'VARYING', 'ATTRIBUTE', 'VEC4', 'MAT4'], asciiArt: [' ▄▄▄ ', '█    ', '█ ▀█ ', '█  █ ', ' ▀▀▀ '] },
    { name: 'HLSL', color: '#5686a5', keywords: ['CBUFFER', 'FLOAT4', 'TEXTURE2D', 'SAMPLERSTATE', 'MUL'], asciiArt: ['█   █', '█   █', '█████', '█   █', '█   █'] },
    { name: 'GDScript', color: '#355570', keywords: ['FUNC', 'VAR', 'ONREADY', 'EXPORT', 'PASS'], asciiArt: [' ▄▄▄ ', '█    ', '█ ▀█ ', '█  █ ', ' ▀▀▀ '] },
    { name: 'Bash', color: '#89e051', keywords: ['FI', 'ESAC', 'DONE', 'ECHO', 'EXPORT'], asciiArt: ['████ ', '█   █', '████ ', '█   █', '████ '] },
    { name: 'PowerShell', color: '#012456', keywords: ['PARAM', 'CMDLET', 'INVOKE', 'BEGIN', 'PROCESS'], asciiArt: ['████ ', '█   █', '████ ', '█    ', '█    '] },
    { name: 'Racket', color: '#3c5caa', keywords: ['DEFINE', 'REQUIRE', 'PROVIDE', 'COND', 'LAMBDA'], asciiArt: ['████ ', '█   █', '████ ', '█  █ ', '█   █'] },
    { name: 'Tcl', color: '#e4cc98', keywords: ['PROC', 'SET', 'PUTS', 'FOREACH', 'EXPR'], asciiArt: ['█████', '  █  ', '  █  ', '  █  ', '  █  '] },
    { name: 'Vala', color: '#fbe5cd', keywords: ['CONSTRUCT', 'SIGNAL', 'YIELD', 'VAR', 'CLASS'], asciiArt: ['█   █', '█   █', '█   █', ' █ █ ', '  ▀  '] },
    { name: 'ActionScript', color: '#882B0F', keywords: ['TRACE', 'EXTENDS', 'IMPLEMENTS', 'OVERRIDE', 'DYNAMIC'], asciiArt: ['  ▄  ', ' █ █ ', '█████', '█   █', '█   █'] },
    { name: 'Objective-C', color: '#438eff', keywords: ['INTERFACE', 'IMPLEMENTATION', 'SYNTHESIZE', 'PROPERTY', 'SELECTOR'], asciiArt: [' ▄▄▄ ', '█   █', '█   █', '█   █', ' ▀▀▀ '] }
  ];

  const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?\\";

  export class GameCore {
    grid: Map<string, Cell> = new Map();
    civs: Civilization[] = [];
    cursor: Position = { x: 0, y: 0 };
    camera: Position = { x: 0, y: 0 };
    zoom: number = 1;
    targetZoom: number = 1;
    
    bosses: Boss[] = [];
    projectiles: Projectile[] = [];
    particles: Particle[] = [];
    lastPlayerPos: Position = { x: 0, y: 0 };
    healTimer: number = 0;

    state: GameState = {
      integrity: 100,
      maxIntegrity: 100,
      currentBuffer: "",
      score: 0,
      isGameOver: false,
      combo: 0,
      comboTimer: 0,
      xp: 0,
      level: 1,
      shieldTime: 0,
      gravityTime: 0,
      typingPosition: null, // where the user started typing
      copiedLogic: null,
      screenShake: 0,
      invisibleTime: 0,
      glitchMode: false,
      infiniteLoopTime: 0,
      typingDirection: { dx: 1, dy: 0 },
      cursorScale: 1,
      cursorPower: 1,
      memorySlots: [
        'WIPE_GRID();',
        'color: red; opacity: 0;',
        'while(true) { if(enemy) delete; }',
        'spawn(Guardian, {type: "ASCII", shape: "shield"});',
        'CSS.animate({scale: 2});',
        'spawn(Drone, {type: "ASCII", shape: "hunter"});',
        'shield();',
        'gravity();',
        'recurse();',
        'trap();',
        'CSS.animate({filter: "invert(1)"});',
        'WIPE_GRID();'
      ],
      entities: [],
      enemyDensity: 0,
      screenFlash: 0
    };

    // Track active cells per civ for faster expansion logic
    civOwnedCells: Map<string, string[]> = new Map();

    constructor() {
      this.initCivs();
      // Seed initial colonies far away but larger
      this.civs.forEach((civ, i) => {
        const angle = (i / 50) * Math.PI * 2;
        const dist = 30 + Math.random() * 150;
        const x = Math.floor(Math.cos(angle) * dist);
        const y = Math.floor(Math.sin(angle) * dist);
        
        // Initial cluster
        for (let j = 0; j < 10; j++) {
          this.infect(x + Math.floor(Math.random() * 5 - 2), y + Math.floor(Math.random() * 5 - 2), civ.id);
        }
      });
    }

    initCivs() {
      const prefixes = ['Hyper', 'Neo', 'Quantum', 'Void', 'Acid', 'Metal', 'Cyber', 'Deep', 'Light', 'Dark'];
      for (let i = 0; i < 50; i++) {
        const lang = LANGUAGES[i % LANGUAGES.length];
        const id = `ai-${i}`;
        const name = i < LANGUAGES.length ? lang.name : `${prefixes[i % prefixes.length]}_${lang.name}`;
        
        let behavior: EnemyBehavior = 'SWARM';
        if (Math.random() < 0.2) behavior = 'FORTRESS';
        else if (Math.random() < 0.2) behavior = 'GLITCHER';
        
        this.civs.push({
          id,
          name,
          color: i < LANGUAGES.length ? lang.color : this.shiftColor(lang.color, i),
          keywords: lang.keywords,
          expansionRate: behavior === 'FORTRESS' ? 0.005 : (behavior === 'SWARM' ? 0.04 : 0.01),
          strength: behavior === 'FORTRESS' ? 0.9 : 0.2,
          asciiArt: lang.asciiArt,
          behavior
        });
        this.civOwnedCells.set(id, []);
      }
    }

    shiftColor(hex: string, i: number) {
        // Simple color variation based on index
        const hueShift = (i * 137.5) % 360; // Golden angle for distribution
        return `hsl(${hueShift}, 70%, 60%)`;
    }

    getHash(x: number, y: number) {
      return `${x},${y}`;
    }

    spawnParticles(x: number, y: number, count: number) {
        const chars = [';', '{', '}', '(', ')', '=', '=>', '[]', 'void', 'null'];
        for(let i=0; i<count; i++) {
            this.particles.push({
                x, y,
                dx: (Math.random() - 0.5) * 3, // slightly faster explosion
                dy: (Math.random() - 0.5) * 3,
                char: chars[Math.floor(Math.random() * chars.length)],
                color: '#ffffff',
                life: 1 + Math.random() * 2 // longer life
            });
        }
    }

    infect(x: number, y: number, ownerId: string | null) {
      const hash = this.getHash(x, y);
      const civ = ownerId ? this.civs.find(c => c.id === ownerId) : null;
      
      const existing = this.grid.get(hash);
      
      // Walls are indestructible
      if (existing && existing.isWall && existing.life > 0) return;
      
      // Traps explode when an enemy tries to infect
      if (existing && existing.isTrap && ownerId !== null) {
          this.grid.delete(hash);
          this.triggerWipe(x, y, 'null', 3);
          this.spawnParticles(x, y, 10);
          return;
      }

      // If user is infecting, they take priority
      if (ownerId === null) {
        // Small visual feedback if overwriting
        this.grid.set(hash, {
          char: RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)],
          color: '#ffffff',
          ownerId: null,
          life: 1
        });
        return;
      }

      if (!civ) return;
      
      if (existing && existing.ownerId === ownerId) return;
      
      // Combat logic if someone else owns it
      if (existing && existing.ownerId !== null) {
        const existingCiv = this.civs.find(c => c.id === existing.ownerId);
        
        if (existingCiv && existing.ownerId !== civ.id && existing.ownerId !== 'debris' && civ.id !== 'debris' && civ.id !== 'ai-virus') {
            // Mutation!!!
            existing.char = existing.char === '?' ? RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)] : '?';
            const colors = [civ.color, existingCiv.color];
            existing.color = colors[Math.floor(Math.random() * colors.length)];
            existing.isHybrid = true;
            existing.hybridColors = colors;
            
            if (Math.random() < 0.1) {
                const angle = Math.random() * Math.PI * 2;
                this.projectiles.push({
                   x: x, y: y,
                   dx: Math.cos(angle)*1.5, dy: Math.sin(angle)*1.5,
                   char: existing.char, 
                   color: colors[Math.floor(Math.random() * colors.length)], 
                   ownerId: 'hybrid'
                });
            }
            return;
        }

        if (existingCiv && Math.random() > (civ.strength / (civ.strength + existingCiv.strength))) {
          // Collision debris
          this.grid.set(hash, {
            char: RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)],
            color: '#444444',
            ownerId: 'debris',
            life: 0.5
          });
          return; // Expansion failed
        }
      }

      const word = civ.keywords[Math.floor(Math.random() * civ.keywords.length)] || RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];

      for (let i = 0; i < word.length; i++) {
          const targetHash = this.getHash(x + i, y);
          const cell = this.grid.get(targetHash);
          if (cell && cell.isWall && cell.life > 0) continue;
          
          if (cell && cell.ownerId === null) {
             // PILLAR 2: Cell Consumption & Mutation
             cell.isCorrupting = (cell.isCorrupting || 0) + 1;
             cell.color = `hsl(300, 100%, ${60 - (cell.isCorrupting * 5)}%)`; // Turns dark purple
             cell.life -= 0.2;
             
             // Check Viral Mutation (If heavily corrupted, turns into an enemy TRAP that damages user)
             if (cell.isCorrupting >= 5 || cell.life <= 0) {
                 cell.char = word[i];
                 cell.ownerId = civ.id;
                 cell.life = 1;
                 cell.isCorrupting = 0;
                 cell.isTrap = true; // Corrupted trap!
             } else {
                 continue; // Block survived this cycle, still buffering corruption
             }
          }

          this.grid.set(targetHash, {
            char: word[i],
            color: civ.color,
            ownerId: civ.id,
            life: 1
          });

          // Add to owned list
          const owned = this.civOwnedCells.get(civ.id) || [];
          owned.push(targetHash);
          if (owned.length > 500) {
              owned.shift();
          }
          this.civOwnedCells.set(civ.id, owned);
      }
    }

    update() {
      let enemyCells = 0;
      let userCells = 0;

      // Cell decay and update loops
      Array.from(this.grid.entries()).forEach(([h, c]) => {
          if (c.ownerId === null) {
              userCells++;
              // PILLAR 3: Durée de vie - Text fades naturally and must be refreshed
              if (!c.isWall && !c.isTrap) {
                 c.life -= 0.0005; // natural decay
                 if (c.life <= 0) this.grid.delete(h);
              }
              if (c.fontSizeMult && c.fontSizeMult > 2 && c.action === 'PUSH_BACK') {
                  c.fontSizeMult -= 0.1;
              }
              // PILLAR 2: Viral Mutation Flicker Processing
              if (c.isCorrupting && c.isCorrupting > 0) {
                 c.isCorrupting -= 0.05; // slowly recovers if not attacked
              }
          } else if (c.ownerId && c.ownerId !== 'debris') {
              enemyCells++;
          }

          if (c.isWall && c.life > 0) {
              c.life -= 0.001; // ~10 seconds at 60fps
              if (c.life <= 0) this.grid.delete(h);
          }
      });
      
      this.state.enemyDensity = enemyCells / Math.max(1, enemyCells + userCells);
      if (sound.updateTension) {
         sound.updateTension(this.state.enemyDensity);
      }

      // Handle RPG mechanics
      if (this.state.comboTimer > 0) {
        this.state.comboTimer -= 1;
        if (this.state.comboTimer <= 0) {
           this.state.combo = 0;
           sound.updateComboHum(0);
        }
      }
      if (this.state.shieldTime > 0) this.state.shieldTime -= 1;
      if (this.state.invisibleTime > 0) this.state.invisibleTime -= 1;
      if (this.state.infiniteLoopTime > 0) {
         this.state.infiniteLoopTime -= 1;
         if (this.state.infiniteLoopTime % 5 === 0) {
             const angle = Math.random() * Math.PI * 2;
             this.projectiles.push({
                 x: this.cursor.x, y: this.cursor.y,
                 dx: Math.cos(angle)*1.5, dy: Math.sin(angle)*1.5,
                 char: '!', color: '#ff0000', ownerId: 'null'
             });
         }
      }
      if (this.state.gravityTime > 0) {
         this.state.gravityTime -= 1;
         // Gravity pull effect
         this.pullDebris();
      }

      // Healing territory
      if (this.cursor.x === this.lastPlayerPos.x && this.cursor.y === this.lastPlayerPos.y) {
          const cell = this.grid.get(this.getHash(this.cursor.x, this.cursor.y));
          if (cell && cell.ownerId === null) {
             this.healTimer++;
             if (this.healTimer > 60) {
                 this.state.integrity = Math.min(this.state.maxIntegrity, this.state.integrity + 1);
                 this.healTimer = 0;
             }
          } else this.healTimer = 0;
      } else {
          this.lastPlayerPos = { ...this.cursor };
          this.healTimer = 0;
      }

      // Screen shake and flash decay
      if (this.state.screenShake > 0) {
          this.state.screenShake = Math.max(0, this.state.screenShake - 1);
      }
      if (this.state.screenFlash && this.state.screenFlash > 0) {
          this.state.screenFlash -= 0.02;
      }

      // Particles update
      for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.dx;
          p.y += p.dy;
          p.life -= 0.02; // Slower fade
          if (p.life <= 0) this.particles.splice(i, 1);
      }

      // Entities update (The Life-Code)
      for (let i = this.state.entities.length - 1; i >= 0; i--) {
         const ent = this.state.entities[i];
         ent.life -= 1;
         
         if (ent.type === 'Guardian') {
             // smoothly follow cursor
             ent.x += (this.cursor.x - ent.x) * 0.2;
             ent.y += (this.cursor.y - ent.y) * 0.2;
         } else if (ent.type === 'Drone' && ent.behavior === 'follow_path') {
             ent.pathOffset = (ent.pathOffset || 0) + 0.05;
             const t = (Math.sin(ent.pathOffset) + 1) / 2; // ping pong
             const bx = 10 * Math.pow(1-t, 2) + 52.5 * 2 * (1-t) * t + 95 * t*t;
             const by = 80 * Math.pow(1-t, 2) + 10  * 2 * (1-t) * t + 80 * t*t;
             ent.x += (((ent.startX || 0) + Math.floor(bx / 10)) - ent.x) * 0.5;
             ent.y += (((ent.startY || 0) + Math.floor(by / 10) - 8) - ent.y) * 0.5;
         } else if (ent.type === 'SEMANTIC_BLACK_HOLE') {
             const radius = ent.scale;
             for (let dx = -radius; dx <= radius; dx++) {
                 for (let dy = -radius; dy <= radius; dy++) {
                     if (dx*dx + dy*dy <= radius*radius) {
                         const hash = this.getHash(Math.floor(ent.x + dx), Math.floor(ent.y + dy));
                         const cell = this.grid.get(hash);
                         if (cell && cell.ownerId !== null && cell.ownerId !== 'debris') {
                            const signX = Math.sign(ent.x - (ent.x + dx));
                            const signY = Math.sign(ent.y - (ent.y + dy));
                            if (Math.random() < 0.3) {
                                this.grid.delete(hash);
                                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                                    const nextHash = this.getHash(Math.floor(ent.x + dx + signX), Math.floor(ent.y + dy + signY));
                                    cell.char = '0';
                                    cell.color = '#ff0000';
                                    cell.fontSizeMult = undefined;
                                    cell.fontWeight = undefined;
                                    cell.border = undefined;
                                    this.grid.set(nextHash, cell);
                                }
                            }
                         }
                     }
                 }
             }
         }

         // DOMEntities act physically in the game!
         if (ent.type === 'ASCII_ANIM' && ent.life % 5 === 0) {
             for(let dx=-2; dx<=2; dx++){
                for(let dy=-2; dy<=2; dy++){
                   const h = this.getHash(Math.floor(ent.x+dx), Math.floor(ent.y+dy));
                   const c = this.grid.get(h);
                   if (c && c.ownerId && c.ownerId !== 'debris' && c.ownerId !== 'memory_crystal') {
                       this.grid.delete(h);
                       this.addXP(2);
                       this.spawnParticles(Math.floor(ent.x+dx), Math.floor(ent.y+dy), 1);
                   }
                }
             }
         } else if (ent.life % 10 === 0 && ent.type !== 'SEMANTIC_BLACK_HOLE' && ent.type !== 'Guardian' && ent.type !== 'ASCII_ANIM') {
             const rad = Math.floor(ent.scale * 3);
             this.triggerWipe(Math.floor(ent.x), Math.floor(ent.y), 'null', rad);
         }

         if (ent.life <= 0) {
            this.state.entities.splice(i, 1);
         }
      }

      // Update projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
         const p = this.projectiles[i];
         let reflected = false;
         this.state.entities.forEach(g => {
            if (g.type === 'Guardian' && g.effect === 'reflect_projectiles') {
                const dx = p.x - g.x;
                const dy = p.y - g.y;
                if (Math.sqrt(dx*dx + dy*dy) <= g.scale * 4) {
                   p.dx *= -1;
                   p.dy *= -1;
                   p.ownerId = 'null';
                   p.color = '#00ff41';
                   reflected = true;
                }
            }
         });
         
         p.x += p.dx;
         p.y += p.dy;
         
         const hash = this.getHash(Math.round(p.x), Math.round(p.y));
         const cell = this.grid.get(hash);
         
         if (Math.round(p.x) === this.cursor.x && Math.round(p.y) === this.cursor.y && !this.state.glitchMode) {
             this.takeDamage(5); // Reduced from 10 to prevent instant death feel
             this.state.screenShake += 5;
             this.projectiles.splice(i, 1);
             continue;
         }
         
         if (cell && cell.ownerId === null && !cell.isWall && !this.state.glitchMode && p.ownerId !== 'null') {
             this.takeDamage(2);
             this.grid.set(hash, {
                 char: p.char,
                 color: p.color,
                 ownerId: p.ownerId,
                 life: 1
             });
             this.projectiles.splice(i, 1);
             continue;
         } else if (cell && cell.isWall && p.ownerId !== 'null') {
             this.projectiles.splice(i, 1); // Projectiles hit wall
             continue;
         } else if (cell && cell.ownerId !== null && cell.ownerId !== 'debris' && p.ownerId === 'null') {
             // Player projectile hits enemy
             this.grid.delete(hash);
             this.spawnParticles(Math.round(p.x), Math.round(p.y), 3);
             // Drop memory data segment for user instead of just debris
             if (Math.random() < 0.3) {
                 this.grid.set(hash, { char: '✧', color: '#ffcc00', ownerId: 'memory_crystal', life: 1 });
             } 
             this.addXP(2);
         }
      }

      // Update bosses
      if (Math.random() < 0.001 + (this.state.level * 0.0002) && this.bosses.length < 3) {
         this.spawnBoss();
      }
      this.bosses.forEach((b, bIdx) => {
          if (this.state.glitchMode) {
              b.art = b.art.map(x => x.replace(/[^\s]/g, '?'));
          }

          const civ = this.civs.find(c => c.id === b.civId);
          const behavior = civ?.behavior || 'FORTRESS';
          
          let targetX = this.cursor.x;
          let targetY = this.cursor.y;
          if (this.state.invisibleTime > 0) {
              targetX = b.x; // Boss stops pursuing
              targetY = b.y;
          }
          
          if (behavior === 'FORTRESS') {
              if (Date.now() - b.lastShootTime > Math.max(800, 2500 - this.state.level * 100) && !this.state.glitchMode && this.state.invisibleTime <= 0) {
                  this.projectiles.push({
                      x: b.x + b.width/2, y: b.y + b.height/2,
                      dx: Math.sign(targetX - b.x) * 0.5,
                      dy: Math.sign(targetY - b.y) * 0.5,
                      char: ';', color: '#ff0000', ownerId: b.civId
                  });
                  b.lastShootTime = Date.now();
              }
          } else if (behavior === 'SWARM') {
              if (Math.random() < 0.02 + (this.state.level * 0.002)) {
                 b.x += Math.sign(targetX - b.x);
                 b.y += Math.sign(targetY - b.y);
              }
          } else if (behavior === 'GLITCHER') {
              if (Math.random() < 0.005 + (this.state.level * 0.001)) {
                 b.x = targetX + Math.floor(Math.random() * 30 - 15);
                 b.y = targetY + Math.floor(Math.random() * 30 - 15);
              }
              if (Math.random() < 0.01 + (this.state.level * 0.001)) {
                  b.x += Math.sign(targetX - b.x);
                  b.y += Math.sign(targetY - b.y);
              }
          }
      });
      // 1. AI Expansion & Hunting
      this.civs.forEach(civ => {
        if (Math.random() < civ.expansionRate) {
          const owned = this.civOwnedCells.get(civ.id);
          if (owned && owned.length > 0) {
            const randomIndex = Math.floor(Math.random() * owned.length);
            const [x, y] = owned[randomIndex].split(',').map(Number);
            
            let dx = Math.floor(Math.random() * 3) - 1;
            let dy = Math.floor(Math.random() * 3) - 1;
            
            let targetX = this.cursor.x;
            let targetY = this.cursor.y;
            if (this.state.invisibleTime > 0) {
                targetX = x; // Does not pursue
                targetY = y;
            }
            
            if (civ.behavior === 'SWARM' && Math.random() < 0.6) {
                dx = Math.sign(targetX - x);
                dy = Math.sign(targetY - y);
            } else if (civ.behavior === 'GLITCHER' && Math.random() < 0.1) {
                dx = Math.floor(Math.random() * 10 - 5);
                dy = Math.floor(Math.random() * 10 - 5);
            }

            if (dx !== 0 || dy !== 0) {
              const tx = x + dx;
              const ty = y + dy;
              this.infect(tx, ty, civ.id);
              
              // Damage if hits user code
              const targetHash = this.getHash(tx, ty);
              const targetCell = this.grid.get(targetHash);
              
              if (targetCell && targetCell.action === 'PUSH_BACK') {
                 targetCell.fontSizeMult = Math.min(4, (targetCell.fontSizeMult || 2) + 0.5);
                 this.projectiles.push({
                     x: tx, y: ty, dx: -dx*2, dy: -dy*2, char: '>', color: '#ffffff', ownerId: 'null'
                 });
              } else {
                 this.infect(tx, ty, civ.id);
                 
                 // Damage if hits user code
                 const infectedTargetCell = this.grid.get(targetHash);
                 if (infectedTargetCell && infectedTargetCell.ownerId === null && !infectedTargetCell.isWall && targetHash !== `${this.cursor.x},${this.cursor.y}`) {
                    this.takeDamage(1); 
                    
                    // Mutation: AI eats your code, converts to its color, and feeds its Boss!
                    infectedTargetCell.ownerId = civ.id;
                    infectedTargetCell.char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
                    infectedTargetCell.color = civ.color;
                 
                 const boss = this.bosses.find(b => b.civId === civ.id);
                 if (boss) {
                     boss.hp += 5;
                     if (boss.hp > boss.maxHp + 50) {
                         boss.width += 1; // Boss physically grows!
                         boss.height += 1;
                         boss.maxHp += 50;
                     }
                 }
                 
                 // Glitcher might deform code
                 if (civ.behavior === 'GLITCHER' && Math.random() < 0.3) {
                     infectedTargetCell.char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
                 }
              }
              }
            }
          }
        }
      });

      // 2. Camera follow cursor
      this.camera.x += (this.cursor.x - this.camera.x) * 0.1;
      this.camera.y += (this.cursor.y - this.camera.y) * 0.1;
      
      // 3. Zoom interpolation
      this.zoom += (this.targetZoom - this.zoom) * 0.1;
    }

    moveCursor(dx: number, dy: number) {
      if (this.state.isGameOver) return;

      // PILLAR 4: Lien Sémantique (Super-User Trails)
      if (this.state.level >= 5) {
         const trailHash = this.getHash(this.cursor.x, this.cursor.y);
         const trailCell = this.grid.get(trailHash);
         if (!trailCell || trailCell.ownerId !== null) {
             this.grid.set(trailHash, { char: '.', color: '#00ffff', ownerId: null, life: 1 });
         }
      }

      this.cursor.x += dx;
      this.cursor.y += dy;
      sound.playMove();
      this.checkCollision();
    }

    checkCollision() {
      if (this.state.shieldTime > 0 || this.state.glitchMode) return; // Invulnerability window
      const hash = this.getHash(this.cursor.x, this.cursor.y);
      const cell = this.grid.get(hash);
      if (cell && cell.ownerId !== null && cell.ownerId !== 'debris') {
        this.takeDamage(5);
        // "Wipe" the cell we stepped on
        this.grid.delete(hash);
        sound.playHit();
      }
    }

    takeDamage(amount: number) {
      if (this.state.shieldTime > 0) return;
      
      const spamWords = ['null', 'undefined', '?', 'NaN', '0x00'];
      for(let i=0; i<amount * 2; i++) {
         const dx = Math.floor(Math.random() * 5 - 2);
         const dy = Math.floor(Math.random() * 5 - 2);
         const word = spamWords[Math.floor(Math.random() * spamWords.length)];
         
         const hash = this.getHash(this.cursor.x + dx, this.cursor.y + dy);
         const c = this.grid.get(hash);
         if (!c || c.ownerId === null) {
              this.grid.set(hash, {
                  char: word[0],
                  color: '#ff0000',
                  ownerId: 'ai-virus',
                  life: 1
              });
         }
      }
      this.state.screenShake += amount;
      sound.playCrash();

      this.state.integrity -= amount;
      if (this.state.integrity <= 0) {
        this.state.integrity = 0;
        this.state.isGameOver = true;
      } else {
        this.state.shieldTime = 30; // Temporary invulnerability after taking damage (prevents one-hit multi-kills!)
      }
    }

    setTypingDirection(dx: number, dy: number) {
      if (dx === 0 && dy === 0) {
          dx = 1; dy = 0; // Default right
      }
      this.state.typingDirection = { dx, dy };
    }

    typeChar(char: string) {
      if (this.state.isGameOver) return;
      
      if (char === 'Backspace') {
        if (this.state.currentBuffer.length > 0) {
            this.state.currentBuffer = this.state.currentBuffer.slice(0, -1);
            this.cursor.x -= this.state.typingDirection.dx;
            this.cursor.y -= this.state.typingDirection.dy;
            this.grid.delete(this.getHash(this.cursor.x, this.cursor.y));
            sound.playType('B', this.cursor.x);
        }
        return;
      }

      if (char === 'Enter') {
        this.executeCode();
        return;
      }

      if (char.length !== 1) return;

      if (!this.state.typingPosition) {
          this.state.typingPosition = { ...this.cursor };
      }

      this.state.currentBuffer += char;
      sound.playType(char, this.cursor.x);

      // PILLAR 4: Multi-Input (Spread-Shot)
      const writeAt = (x: number, y: number) => {
         const hash = this.getHash(x, y);
         this.grid.set(hash, {
            char,
            color: '#ffffff',
            ownerId: null,
            life: 1, // Restores full life
            isCorrupting: 0
         });
      };
      
      writeAt(this.cursor.x, this.cursor.y);
      if (this.state.level >= 10) {
          writeAt(this.cursor.x, this.cursor.y - 1);
          writeAt(this.cursor.x, this.cursor.y + 1);
      }
      
      // Crucial: advance cursor when typing!
      this.cursor.x += this.state.typingDirection.dx;
      this.cursor.y += this.state.typingDirection.dy;
    }

    executeCode() {
      const bufferRaw = this.state.currentBuffer.trim();
      if (!bufferRaw) return;

      const bufferClean = bufferRaw.replace(/;$/, '').trim();
      const lowerBuffer = bufferClean.toLowerCase();
      let actionTaken = false;
      let powerLevel = Math.max(2, Math.floor(bufferClean.length / 2)) * this.state.cursorPower;

      const fullBuffer = bufferClean.replace(/\s+/g, ' ');

      // 1. Guardian Protocol
      const normalizedBuffer = fullBuffer.replace(/\s+/g, '').toLowerCase();
      if (normalizedBuffer.includes('spawn(guardian') && normalizedBuffer.includes('circle') && normalizedBuffer.includes('reflect_projectiles')) {
         this.state.entities.push({
             id: 'Guardian_' + Date.now(),
             type: 'Guardian',
             shape: 'circle',
             x: this.cursor.x, y: this.cursor.y,
             scale: Math.max(4, powerLevel/4),
             life: 1000,
             effect: 'reflect_projectiles',
             cssFilter: (fullBuffer.includes('CSS.animate') || fullBuffer.includes('drop-shadow')) ? 'drop-shadow(0 0 15px #00FF41)' : undefined
         });
         actionTaken = true;
         powerLevel = 20;
      }
      
      // 2. Semantic Black Hole
      else if (normalizedBuffer.includes('while(true)') && normalizedBuffer.includes('purge') && normalizedBuffer.includes('mutate')) {
         this.state.entities.push({
             id: 'semantic_blackhole_' + Date.now(),
             type: 'SEMANTIC_BLACK_HOLE',
             shape: 'pulse',
             x: this.cursor.x, y: this.cursor.y,
             scale: 25,
             life: 1000,
         });
         sound.playTone(50, 'sawtooth', 2.0, 0.5, true);
         actionTaken = true;
         powerLevel = 25;
      }
      
      // 3. SVG Invocation
      else if (normalizedBuffer.includes('<svg') && normalizedBuffer.includes('animatedragon') && normalizedBuffer.includes('spawn(drone')) {
         const svgMatch = fullBuffer.match(/<svg[\s\S]*?<\/svg>/i) || bufferClean.match(/<svg[\s\S]*?<\/svg>/i);
         if (svgMatch) {
             this.state.entities.push({
                 id: 'svg_drone_path_' + Date.now(),
                 type: 'SVG_ANIMATED',
                 shape: 'custom',
                 x: this.cursor.x, y: this.cursor.y,
                 scale: 3,
                 life: 1000,
                 svgData: svgMatch[0]
             });
         }
         for (let t = 0; t <= 1; t += 0.05) {
             const bx = 10 * Math.pow(1-t, 2) + 52.5 * 2 * (1-t) * t + 95 * t*t;
             const by = 80 * Math.pow(1-t, 2) + 10  * 2 * (1-t) * t + 80 * t*t;
             const px = this.cursor.x + Math.floor(bx / 10);
             const py = this.cursor.y + Math.floor(by / 10) - 8;
             this.grid.set(this.getHash(px, py), { char: '+', color: '#00ffff', ownerId: null, life: 10, isWall: true });
         }
         this.state.entities.push({
             id: 'Drone_' + Date.now(),
             type: 'Drone',
             shape: 'drone',
             behavior: 'follow_path',
             x: this.cursor.x, y: this.cursor.y,
             scale: 1,
             life: 1000,
             pathOffset: 0,
             startX: this.cursor.x,
             startY: this.cursor.y
         });
         actionTaken = true;
         powerLevel = 10;
      }
      
      // 4. Data Fortress
      else if (normalizedBuffer.includes('font-weight:bold') && normalizedBuffer.includes('push_back')) {
         for (let i=-3; i<=3; i++) {
             for (let j=-3; j<=3; j++) {
                 if (Math.abs(i) === 3 || Math.abs(j) === 3) {
                     const h = this.getHash(this.cursor.x+i, this.cursor.y+j);
                     const c = this.grid.get(h) || { char: '#', color: '#ffffff', ownerId: null, life: 5 };
                     c.fontWeight = 'bold';
                     c.fontSizeMult = 2;
                     c.border = '2px solid #ffffff';
                     c.action = 'PUSH_BACK';
                     c.isWall = true;
                     c.ownerId = null;
                     this.grid.set(h, c);
                 }
             }
         }
         actionTaken = true;
         powerLevel = 15;
      }
      
      // 5. Symphonic Wipe
      else if (normalizedBuffer.includes('level.up()') && normalizedBuffer.includes('user_space')) {
         this.state.level++;
         this.grid.forEach((c, h) => {
             if (c.ownerId) {
                 c.ownerId = null; 
                 c.color = '#ffffff';
                 c.char = '¯\\_(ツ)_/¯'[Math.floor(Math.random() * 11)] || ' ';
             }
         });
         
         for(let i=-10; i<=10; i+=10) {
             for(let j=-5; j<=5; j+=5) {
                 this.state.entities.push({
                     id: 'ascii_celeb_' + Date.now() + Math.random(),
                     type: 'ASCII_ANIM',
                     shape: 'custom',
                     x: this.cursor.x + i, y: this.cursor.y + j,
                     scale: 1,
                     life: 300
                 });
             }
         }
         if ((sound as any).playSymphonicWipe) (sound as any).playSymphonicWipe();
         this.state.screenFlash = 1.0; 
         actionTaken = true;
         powerLevel = 50;
      }

      // 1. PILLAR: THE LIFE-CODE (DYNAMIC FUNCTION PARSER FOR INFINITE RULES)
      const funcMatch = bufferClean.match(/^([a-zA-Z_.]+)\s*\(\s*(?:([a-zA-Z_]+)\s*,?)?\s*(?:\{([^}]+)\})?\s*\)$/i);
      const actionFn = !actionTaken && funcMatch ? funcMatch[1].toLowerCase() : '';
      const targetFn = funcMatch && funcMatch[2] ? funcMatch[2] : 'undefined';
      const propsStr = funcMatch ? funcMatch[3] : '';
      
      let props: any = {};
      if (propsStr && !actionTaken) {
           propsStr.split(',').forEach(pair => {
               const parts = pair.split(':');
               if (parts.length === 2) {
                   const k = parts[0].trim();
                   const v = parts[1].trim().replace(/['"]/g, '');
                   props[k] = isNaN(Number(v)) ? v : Number(v);
               }
           });
      }

      // Check if it's a known function first
      if (!actionTaken && (actionFn === 'spawn' || actionFn === 'summon')) {
         this.state.entities.push({
            id: targetFn + Date.now(),
            type: targetFn,
            shape: props.shape || 'pulse',
            x: this.cursor.x,
            y: this.cursor.y,
            scale: props.scale || this.state.cursorScale,
            life: props.life || 500
         });
         actionTaken = true;
         powerLevel = 15 * this.state.cursorPower;
      } else if (actionFn.includes('css.animate') || actionFn === 'animate') {
         const newScale = props.scale || 1.5;
         this.state.cursorScale = Math.min(20, this.state.cursorScale * newScale);
         this.state.cursorPower = this.state.cursorScale; // Cursor gets physically more powerful
         actionTaken = true;
         powerLevel = this.state.cursorScale * 10;
      } else if (actionFn === 'mute' || actionFn === 'purge') {
         this.triggerWipe(this.cursor.x, this.cursor.y, 'null', (props.radius || 10) * this.state.cursorPower);
         actionTaken = true;
      } else if (actionFn === 'mutate') {
         const rad = props.radius || 5;
         for (let i=-rad; i<=rad; i++) {
            for(let j=-rad; j<=rad; j++) {
                const h = this.getHash(this.cursor.x+i, this.cursor.y+j);
                const c = this.grid.get(h);
                if (c && c.ownerId !== null) { // Mutates enemy cells into player side
                   c.char = props.char || '?';
                   c.color = props.color || '#00ff41';
                   c.ownerId = null;
                   c.life = 1;
                }
            }
         }
         actionTaken = true;
         powerLevel = 25;
      } else if (actionFn === 'animate' && targetFn === 'ascii') {
         this.state.entities.push({
             id: 'ascii_' + Date.now(),
             type: 'ASCII_ANIM',
             shape: 'custom',
             x: this.cursor.x, y: this.cursor.y,
             scale: powerLevel,
             life: 1000
         });
         actionTaken = true;
      }
      else if (actionFn === 'svg' || actionFn === 'draw') {
          let data = '';
          if (targetFn === 'dragon') {
              data = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#ff0044" stroke-width="2" d="M10,90 Q50,10 90,90 T50,50" stroke-dasharray="200" stroke-dashoffset="0"><animate attributeName="stroke-dashoffset" from="200" to="0" dur="2s" repeatCount="indefinite" /></path></svg>`;
          } else if (targetFn === 'gear') {
              data = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="#00ff41" stroke-width="4" fill="none" stroke-dasharray="10 5"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="3s" repeatCount="indefinite"/></circle></svg>`;
          } else {
              data = `<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="none" stroke="#00ffff" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="5s" repeatCount="indefinite"/></polygon></svg>`;
          }
          this.state.entities.push({
             id: 'svg_' + Date.now(),
             type: 'SVG_ANIMATED',
             shape: 'custom',
             x: this.cursor.x, y: this.cursor.y,
             scale: Math.max(5, powerLevel),
             life: 1000,
             svgData: data
          });
          actionTaken = true;
      }

      // 2. CSS (prop: value)
      const cssMatch = bufferClean.match(/^([a-z-]+)\s*:\s*(.+)$/i);
      if (!actionTaken && bufferClean.startsWith('<svg')) {
          this.state.entities.push({
             id: 'svg_' + Date.now(),
             type: 'SVG_ANIMATED',
             shape: 'custom',
             x: this.cursor.x, y: this.cursor.y,
             scale: powerLevel,
             life: 1000,
             svgData: bufferClean + (bufferClean.endsWith('</svg>') ? '' : '</svg>')
          });
          actionTaken = true;
      }
      else if (!actionTaken && cssMatch && !bufferClean.includes('{')) {
          const prop = cssMatch[1].toLowerCase();
          const val = cssMatch[2].toLowerCase();
          
          if (prop === 'filter' && val.includes('blur')) {
              // Blur enemies
              this.triggerWipe(this.cursor.x, this.cursor.y, 'null', powerLevel * 2); 
              this.state.entities.push({
                 id: 'blur_' + Date.now(),
                 type: 'CSS_BLUR',
                 shape: 'cloud',
                 x: this.cursor.x, y: this.cursor.y,
                 scale: powerLevel,
                 life: 300,
                 effect: { prop, val }
              });
          } else if (prop === 'color' || prop === 'background' || prop === 'background-color') {
              for (let i = -powerLevel; i <= powerLevel; i++) {
                 for (let j = -powerLevel; j <= powerLevel; j++) {
                    const h = this.getHash(this.cursor.x+i, this.cursor.y+j);
                    this.grid.set(h, { char: '#', color: val.replace(';', ''), ownerId: null, life: 1 });
                 }
              }
          } else if (prop === 'font-weight' && val.includes('bold')) {
              for (let i=-2; i<=2; i++) {
                  this.grid.set(this.getHash(this.cursor.x + i, this.cursor.y), { char: '#', color: '#ffffff', ownerId: null, life: 3, isWall: true });
              }
          } else if (prop === 'opacity' && val.includes('0')) {
              this.state.invisibleTime = 400;
          } else if (prop === 'font-size') {
              const sizeVal = parseFloat(val);
              if (!isNaN(sizeVal)) {
                  for (let i = -powerLevel; i <= powerLevel; i++) {
                     for (let j = -powerLevel; j <= powerLevel; j++) {
                        const h = this.getHash(this.cursor.x+i, this.cursor.y+j);
                        const c = this.grid.get(h);
                        if (c) c.fontSizeMult = sizeVal / 16;
                     }
                  }
              }
          } else if (prop === 'font-style' && val.includes('italic')) {
              for (let i=-powerLevel; i<=powerLevel; i++) {
                 for (let j=-powerLevel; j<=powerLevel; j++) {
                    const h = this.getHash(this.cursor.x+i, this.cursor.y+j);
                    const c = this.grid.get(h);
                    if (c) c.fontStyle = 'italic';
                 }
              }
          } else if (prop === 'font-weight' && val.includes('bold')) {
              for (let i=-powerLevel; i<=powerLevel; i++) {
                 for (let j=-powerLevel; j<=powerLevel; j++) {
                    const h = this.getHash(this.cursor.x+i, this.cursor.y+j);
                    const c = this.grid.get(h);
                    if (c) c.fontWeight = 'bold';
                 }
              }
          }
          actionTaken = true;
      }
      
      // JS / Rust functions (Super-Objects)
      else if (!actionTaken && (bufferClean.startsWith('function') || bufferClean.startsWith('fn ') || bufferClean.includes('() {'))) {
          this.state.entities.push({
              id: 'func_' + Date.now(),
              type: 'SUPER_OBJ',
              shape: 'matrix',
              x: this.cursor.x, y: this.cursor.y,
              scale: powerLevel / 2,
              life: 1000,
              hp: powerLevel * 10,
              behavior: bufferClean.includes('Rust') ? 'AGGRESSIVE' : 'DEFENSIVE'
          });
          actionTaken = true;
      }

      // 3. Impact Réel (if/else, while)
      else if (!actionTaken && (lowerBuffer.startsWith('if') || lowerBuffer.includes('else'))) {
          // Physically divides the map (creates a massive vertical or horizontal wall)
          const isHorizontal = Math.random() > 0.5;
          for (let i = -20; i <= 20; i++) {
              const wx = isHorizontal ? this.cursor.x + i : this.cursor.x;
              const wy = isHorizontal ? this.cursor.y : this.cursor.y + i;
              this.grid.set(this.getHash(wx, wy), { char: '|', color: '#00ffff', ownerId: null, life: 5, isWall: true });
          }
          actionTaken = true;
      }
      else if (!actionTaken && (lowerBuffer.startsWith('while(true)') || lowerBuffer.startsWith('while (true)'))) {
          // Black hole
          const bhPower = Math.min(10, powerLevel); // Cap size so it's not absolutely massive
          this.state.entities.push({
              id: 'blackhole_' + Date.now(),
              type: 'BLACK_HOLE',
              shape: 'pulse',
              x: this.cursor.x, y: this.cursor.y,
              scale: bhPower,
              life: 500,
          });
          this.state.integrity -= 5; // Slight energy cost
          actionTaken = true;
          powerLevel = bhPower; // use capped power for visual effect
      }
      else if (!actionTaken && lowerBuffer.includes('glitch: true')) {
          this.state.glitchMode = true;
          setTimeout(() => { if(this.state) this.state.glitchMode = false; }, 5000); // 5 sec glitch mode
          actionTaken = true;
      }
      // HTML TAGS
      else if (!actionTaken && lowerBuffer === '<b>') {
          this.state.shieldTime = 300;
          actionTaken = true;
          this.grid.set(this.getHash(this.cursor.x - 1, this.cursor.y), { char: '[', color: '#00ffff', ownerId: null, life: 1 });
          this.grid.set(this.getHash(this.cursor.x + 1, this.cursor.y), { char: ']', color: '#00ffff', ownerId: null, life: 1 });
      } else if (!actionTaken && lowerBuffer === '<i>') {
          for (let i=-5; i<=5; i++) {
             this.projectiles.push({ x: this.cursor.x, y: this.cursor.y, dx: i, dy: -5, char: '/', color: '#fff', ownerId: 'null' });
          }
          actionTaken = true;
      } else if (!actionTaken && lowerBuffer === '<marquee>') {
          for (let i=0; i<powerLevel*2; i++) {
             this.projectiles.push({ x: this.cursor.x, y: this.cursor.y + (Math.random()*10 - 5), dx: 1, dy: 0, char: '~', color: '#fff', ownerId: 'null' });
          }
          actionTaken = true;
      } 
      // OLD COMMANDS FALLBACK
      else if (!actionTaken && (lowerBuffer === 'wipe()' || lowerBuffer === 'wipe' || lowerBuffer === 'wipe_grid()')) {
          this.triggerWipe(this.cursor.x, this.cursor.y, 'null', powerLevel + 3);
          actionTaken = true;
      } else if (!actionTaken && (lowerBuffer === 'wall()' || lowerBuffer === 'wall')) {
          for (let i = -2; i <= 2; i++) {
              this.grid.set(this.getHash(this.cursor.x + i, this.cursor.y), { char: '#', color: '#888888', ownerId: null, life: 1, isWall: true });
          }
          actionTaken = true;
      } else if (!actionTaken && (lowerBuffer === 'trap()' || lowerBuffer === 'trap')) {
          for (let i = -2; i <= 2; i++) {
              for (let j = -2; j <= 2; j++) {
                  if (Math.abs(i)+Math.abs(j) <= 2) {
                     this.grid.set(this.getHash(this.cursor.x + i, this.cursor.y + j), { char: '*', color: '#ff8800', ownerId: null, life: 1, isTrap: true });
                  }
              }
          }
          actionTaken = true;
      } else if (!actionTaken && (lowerBuffer === 'recurse()' || lowerBuffer === 'recurse')) {
          for (let i=0; i<8; i++) {
              const angle = (i/8)*Math.PI*2;
              this.projectiles.push({
                  x: this.cursor.x, y: this.cursor.y,
                  dx: Math.cos(angle), dy: Math.sin(angle),
                  char: 'R', color: '#ffffff', ownerId: 'null'
              });
          }
          actionTaken = true;
      } else if (!actionTaken && (lowerBuffer === 'shield()' || lowerBuffer === 'shield')) {
          this.state.shieldTime = 100 * powerLevel;
          actionTaken = true;
      } else if (!actionTaken && (lowerBuffer === 'gravity()' || lowerBuffer === 'gravity')) {
          this.state.gravityTime = 150 * powerLevel;
          actionTaken = true;
      } else if (!actionTaken && lowerBuffer.length > 0) {
          const matchingCiv = this.civs.find(c => c.keywords.some(k => lowerBuffer === k.toLowerCase()));
          if (matchingCiv) {
              this.triggerWipe(this.cursor.x, this.cursor.y, matchingCiv.id, powerLevel + 2);
              this.state.score += 100 * powerLevel;
              this.addCombo();
              actionTaken = true;
          } else {
              // Poetic evolution of the world for normal text
              // The code crystallizes and fortifies
              if (this.state.typingPosition) {
                  let currX = this.state.typingPosition.x;
                  let currY = this.state.typingPosition.y;
                  for(let i=0; i<this.state.currentBuffer.length; i++) {
                      const hash = this.getHash(currX + i, currY);
                      const c = this.grid.get(hash);
                      if (c) {
                          c.color = '#33ffa8'; // Neon poetic green
                          c.isWall = (Math.random() > 0.8); // Sometimes crystallizes into wall
                      }
                  }
                  sound.playWipe(1, 'NONE'); // Small melodic sparkle
              }
          }
      }

      this.state.currentBuffer = "";
      this.state.typingPosition = null;

      if (actionTaken) {
         let langName = 'NONE';
         const cell = this.grid.get(this.getHash(this.cursor.x, this.cursor.y));
         if (cell && cell.ownerId) {
             const civ = this.civs.find(c => c.id === cell.ownerId);
             if (civ) langName = civ.name;
         }

         sound.playWipe(powerLevel, langName);
         this.state.screenShake = Math.min(15, powerLevel * 3);
         const particlesCount = Math.min(50, powerLevel * 10);
         this.spawnParticles(this.cursor.x, this.cursor.y, particlesCount);
         
         // Erase the typed word physically (optional, but requested: "le mot s'éclaire puis se dissipe dans une explosion de pixels")
         if (this.state.typingPosition) {
             const dx = this.state.typingDirection.dx;
             const dy = this.state.typingDirection.dy;
             // Best effort erase path
             let currX = this.state.typingPosition.x;
             let currY = this.state.typingPosition.y;
             for(let i=0; i<this.state.currentBuffer.length; i++) {
                 this.grid.delete(this.getHash(currX, currY));
                 currX += dx; currY += dy;
             }
         }
         
         this.state.currentBuffer = "";
         this.state.typingPosition = null;
      }
    }

    pasteRealCode(text: string) {
        if (this.state.isGameOver || text.length === 0) return;
        
        const lines = text.split('\n');
        let startX = this.cursor.x;
        let startY = this.cursor.y;
        
        let power = 0;
        
        lines.forEach((line, lineIdx) => {
            for (let i = 0; i < line.length; i++) {
               const char = line[i];
               if (char.trim() !== '') {
                   const nx = startX + i * this.state.typingDirection.dx - lineIdx * this.state.typingDirection.dy;
                   const ny = startY + i * this.state.typingDirection.dy + lineIdx * this.state.typingDirection.dx;
                   this.grid.set(this.getHash(nx, ny), {
                       char,
                       color: '#00ff41',
                       ownerId: null,
                       life: 1
                   });
                   power++;
               }
            }
        });
        
        if (power > 0) {
            this.state.typingPosition = { x: startX, y: startY };
            // Apply execute code logic on the pasted string so commands work
            this.state.currentBuffer = text.replace(/\n/g, ' ');
            this.executeCode();
            
            // Advance cursor
            this.cursor.x += lines[0].length * this.state.typingDirection.dx;
            this.cursor.y += lines[0].length * this.state.typingDirection.dy;
        }
    }

    executePower(key: string) {
        // Obsolete: F1-F12 handles Scripts now.
    }

    addXP(amount: number) {
        this.state.xp += amount;
        if (this.state.xp >= this.state.level * 100) { // Slower, more meaningful progression
            this.state.level++;
            this.state.xp = 0;
            this.state.integrity = this.state.maxIntegrity;
        }
    }

    addCombo() {
        this.state.combo++;
        this.state.comboTimer = 100 + (this.state.level * 10); // Keep combo alive longer at higher level
        sound.updateComboHum(this.state.combo);
    }

    pullDebris() {
        // Find debris and move it towards player
        const entries = Array.from(this.grid.entries());
        entries.forEach(([hash, cell]) => {
            if (cell.ownerId === 'debris' || cell.ownerId === 'memory_crystal') {
                const [x, y] = hash.split(',').map(Number);
                if (Math.random() < 0.2) {
                   const moveX = Math.sign(this.cursor.x - x);
                   const moveY = Math.sign(this.cursor.y - y);
                   this.grid.delete(hash);
                   
                   if (x + moveX === this.cursor.x && y + moveY === this.cursor.y) {
                      // Absorb
                      this.addXP(cell.ownerId === 'memory_crystal' ? 10 : 2);
                      this.state.integrity = Math.min(this.state.maxIntegrity, this.state.integrity + (cell.ownerId === 'memory_crystal' ? 5 : 1));
                      if (cell.ownerId === 'memory_crystal') {
                          this.state.cursorPower += 1;
                          this.addCombo();
                      }
                   } else {
                      this.grid.set(this.getHash(x + moveX, y + moveY), cell);
                   }
                }
            }
        });
    }

    spawnBoss() {
        // Giant code block that serves as a boss
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 20;
        const bx = Math.floor(this.cursor.x + Math.cos(angle) * dist);
        const by = Math.floor(this.cursor.y + Math.sin(angle) * dist);
        
        const civ = this.civs[Math.floor(Math.random() * this.civs.length)];
        
        this.bosses.push({
            id: `boss-${Date.now()}`,
            civId: civ.id,
            x: bx,
            y: by,
            width: 5,
            height: 5,
            hp: 20 + this.state.level * 10,
            maxHp: 20 + this.state.level * 10,
            art: civ.asciiArt || ['█████','███ ██','█ █ █','█████','█████'],
            lastShootTime: Date.now()
        });
        
        // Infect area immediately
        for(let i=0; i<5; i++){
            for(let j=0; j<5; j++){
                this.grid.set(this.getHash(bx+i, by+j), {
                    char: (civ.asciiArt && civ.asciiArt[j]?.[i]) ? civ.asciiArt[j][i] : '█',
                    color: civ.color,
                    ownerId: civ.id,
                    life: 1
                });
            }
        }
    }

    checkLanguageTrigger() {
      // Deprecated, execution is now manual via Enter
    }

    triggerWipe(x: number, y: number, civId: string, radius: number = 5) {
        this.spawnParticles(x, y, radius * 5); // Add particles
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                const dist = Math.sqrt(i*i + j*j);
                if (dist <= radius) {
                    const targetX = x + i;
                    const targetY = y + j;
                    const hash = this.getHash(targetX, targetY);
                    
                    const cell = this.grid.get(hash);
                    if (cell && cell.ownerId && cell.ownerId !== 'debris' && cell.ownerId !== null) {
                        this.addXP(1);
                    }

                    if (Math.random() > 0.2 && civId !== 'null') {
                        this.infect(targetX, targetY, civId);
                    } else {
                        // Boss damage check
                        this.bosses.forEach((b, idx) => {
                            if (targetX >= b.x && targetX <= b.x + b.width && targetY >= b.y && targetY <= b.y + b.height) {
                                b.hp -= 5;
                                if (b.hp <= 0) {
                                    this.addXP(50);
                                    this.bosses.splice(idx, 1);
                                }
                            }
                        });
                        this.grid.set(hash, { char: '*', color: '#aaaaaa', ownerId: 'debris', life: 0.5 });
                    }
                }
            }
        }
    }
  }
