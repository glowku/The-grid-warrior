import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCore } from './GameCore';

const CELL_SIZE = 24;
const ASCII_UI_COLOR = '#00ff41';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<GameCore>(new GameCore());
  const [stats, setStats] = useState({
    cpu: 0,
    dominance: 0,
    lang: 'NONE',
    topCivs: [] as { name: string, percent: number }[],
    integrity: 100,
    maxIntegrity: 100,
    combo: 0,
    level: 1,
    xp: 0,
    buffer: ""
  });
  const [isGlitching, setIsGlitching] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const core = coreRef.current;
    core.update();

    ctx.clearRect(0, 0, width, height);

    const scaledCell = CELL_SIZE * core.zoom;
    ctx.font = `${Math.max(8, scaledCell)}px "JetBrains Mono"`;
    ctx.textBaseline = 'top';

    const halfW = width / 2;
    const halfH = height / 2;

    const shakeAmount = Math.min(core.state.screenShake, 15);
    const offsetX = halfW + (core.state.screenShake > 0 ? (Math.random() - 0.5) * shakeAmount * 2 : 0);
    const offsetY = halfH + (core.state.screenShake > 0 ? (Math.random() - 0.5) * shakeAmount * 2 : 0);

    const startX = Math.floor(core.camera.x - halfW / scaledCell) - 1;
    const endX = Math.ceil(core.camera.x + halfW / scaledCell) + 1;
    const startY = Math.floor(core.camera.y - halfH / scaledCell) - 1;
    const endY = Math.ceil(core.camera.y + halfH / scaledCell) + 1;

    // Draw Grid Cells
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const cell = core.grid.get(`${x},${y}`);
        if (!cell) continue;

        const screenX = offsetX + (x - core.camera.x) * scaledCell;
        const screenY = offsetY + (y - core.camera.y) * scaledCell;

        if (screenX < -scaledCell || screenX > width || screenY < -scaledCell || screenY > height) continue;

        ctx.fillStyle = cell.color;
        if (cell.fontSizeMult || cell.fontWeight || cell.fontStyle) {
            const fStyle = cell.fontStyle || 'normal';
            const fWeight = cell.fontWeight || 'normal';
            const fSize = Math.max(8, scaledCell * (cell.fontSizeMult || 1));
            ctx.font = `${fStyle} ${fWeight} ${fSize}px "JetBrains Mono"`;
        }

        if (cell.isCorrupting && cell.isCorrupting > 0) {
            ctx.globalAlpha = Math.max(0.2, 1 - (cell.isCorrupting / 10));
            ctx.fillText(cell.char, screenX + (Math.random() * 4 - 2), screenY + (Math.random() * 4 - 2));
            ctx.globalAlpha = 1.0;
        } else if (cell.isHybrid) {
            ctx.fillStyle = cell.hybridColors![Math.floor(Date.now() / 100) % cell.hybridColors!.length];
            ctx.fillText(cell.char, screenX, screenY);
        } else {
            ctx.globalAlpha = Math.max(0.2, cell.life || 1);
            ctx.fillText(cell.char, screenX, screenY);
            ctx.globalAlpha = 1.0;
        }

        if (cell.fontSizeMult || cell.fontWeight || cell.fontStyle) {
            ctx.font = `${Math.max(8, scaledCell)}px "JetBrains Mono"`; // reset
        }
      }
    }

    // Draw Bosses
    core.bosses.forEach(b => {
      const sx = offsetX + (b.x - core.camera.x) * scaledCell;
      const sy = offsetY + (b.y - core.camera.y) * scaledCell;
      if (sx < -scaledCell * b.width || sx > width || sy < -scaledCell * b.height || sy > height) return;

      const civ = core.civs.find(c => c.id === b.civId);
      ctx.fillStyle = civ?.color || '#ff0000';
      b.art.forEach((row, i) => {
        ctx.fillText(row, sx, sy + i * scaledCell);
      });
      // HP Bar
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(sx, sy - 5, (b.hp / b.maxHp) * (b.width * scaledCell), 3);
    });

    // Draw Projectiles
    core.projectiles.forEach(p => {
      const sx = offsetX + (p.x - core.camera.x) * scaledCell;
      const sy = offsetY + (p.y - core.camera.y) * scaledCell;
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, sx, sy);
    });

    // Draw Particles
    core.particles.forEach(p => {
      const sx = offsetX + (p.x - core.camera.x) * scaledCell;
      const sy = offsetY + (p.y - core.camera.y) * scaledCell;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.life)})`;
      ctx.fillText(p.char, sx, sy);
    });

    // Draw Entities (ASCII directly in canvas)
    core.state.entities.forEach(ent => {
       const sx = offsetX + (ent.x - core.camera.x) * scaledCell;
       const sy = offsetY + (ent.y - core.camera.y) * scaledCell;
       if (sx < -scaledCell * 10 || sx > width || sy < -scaledCell * 10 || sy > height) return;
       
       ctx.fillStyle = '#00ffff';
       ctx.globalAlpha = Math.max(0.1, ent.life / 500);
       
       const baseScale = ent.scale * core.zoom;
       ctx.font = `${Math.max(8, CELL_SIZE * baseScale)}px "JetBrains Mono"`;

       const frame = Math.floor(Date.now() / 200);
       let char = `[${ent.type}]`;
       
       if (ent.type === 'CSS_BLUR') {
            ctx.filter = `blur(${ent.scale}px)`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText("≈≈≈", sx - scaledCell, sy);
            ctx.filter = 'none';
            char = '';
       } else if (ent.type === 'SUPER_OBJ') {
            const shapes = ["▚", "▞", "▛", "▟"];
            char = shapes[frame % shapes.length];
            ctx.fillStyle = ent.behavior === 'AGGRESSIVE' ? '#ff0055' : '#00ff41';
       } else if (ent.type === 'BLACK_HOLE') {
            ctx.fillStyle = '#0a001a';
            ctx.beginPath();
            ctx.arc(sx + scaledCell/2, sy + scaledCell/2, scaledCell * ent.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * core.zoom;
            ctx.beginPath();
            ctx.arc(sx + scaledCell/2, sy + scaledCell/2, scaledCell * ent.scale + (frame % 20), 0, Math.PI * 2);
            ctx.stroke();
            char = '';
       } else if (ent.type === 'ASCII_ANIM') {
            const animMap = ["(╯°□°)╯︵ ┻━┻", "(┬┬﹏┬┬)", "¯\\_(ツ)_/¯", "ʕ•ᴥ•ʔ", "ᕦ(ò_óˇ)ᕤ"];
            char = animMap[Math.floor(frame / 2) % animMap.length];
            ctx.fillStyle = `hsl(${Math.floor(Date.now() / 10) % 360}, 100%, 50%)`;
       } else if (ent.shape === 'shield') {
          char = frame % 2 === 0 ? "⟪🛡⟫" : "⟨🛡⟩";
       } else if (ent.shape === 'matrix') {
          char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
       } else if (ent.shape === 'pulse') {
          const pulse = ["·", "o", "O", "@", "O", "o"];
          char = pulse[frame % pulse.length];
       }

       if (char) {
           ctx.fillText(char, sx - (char.length > 2 ? scaledCell : 0), sy);
       }
       ctx.globalAlpha = 1.0;
       
       // Restore base font
       ctx.font = `${Math.max(8, scaledCell)}px "JetBrains Mono"`;
    });

    // Draw Cursor
    const cursorX = offsetX + (core.cursor.x - core.camera.x) * scaledCell;
    const cursorY = offsetY + (core.cursor.y - core.camera.y) * scaledCell;

    ctx.fillStyle = core.state.shieldTime > 0 ? '#00ffff' : (core.state.invisibleTime > 0 ? 'rgba(255,255,255,0.3)' : '#ffffff');
    if (Math.floor(Date.now() / 200) % 2 === 0 || Math.floor(Date.now() / 150) % 2 === 0) { // faster blink
      if (core.state.level >= 50) {
          ctx.font = `${Math.max(12, scaledCell * 1.5)}px "JetBrains Mono"`;
          ctx.fillStyle = `hsl(${Date.now() / 10 % 360}, 100%, 70%)`;
          ctx.fillText("✧", cursorX - scaledCell * 0.2, cursorY);
          ctx.font = `${Math.max(8, scaledCell)}px "JetBrains Mono"`;
          // Draw fractal lines around cursor
          for(let i=0; i<4; i++) {
              ctx.fillText("·", cursorX + Math.cos(Date.now()/500 + i*Math.PI/2) * scaledCell * 1.5, cursorY + Math.sin(Date.now()/500 + i*Math.PI/2) * scaledCell * 1.5);
          }
      } else if (core.state.level >= 10) {
          ctx.fillText("{ KERNEL }", cursorX - scaledCell * 3.5, cursorY);
      } else {
          ctx.fillText("_", cursorX, cursorY);
      }
    }

    // Draw Error/Damage Flashes
    if (core.state.isGameOver) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const loop = () => {
      draw(ctx, canvas.width, canvas.height);
      animationFrame = requestAnimationFrame(loop);
    };

    loop();

    // Stats updater
    const statsInterval = setInterval(() => {
      const core = coreRef.current;
      const totalCells = core.grid.size;

      // Utilisation d'un cast explicite ou d'une interface pour la cellule
      const cellsArray = Array.from(core.grid.values()) as any[];
      const userCells = cellsArray.filter(c => c.ownerId === null).length;

      const currentCell = core.grid.get(`${core.cursor.x},${core.cursor.y}`) as any;
      const langName = currentCell?.ownerId
        ? core.civs.find(c => c.id === currentCell.ownerId)?.name
        : 'USER_SPACE';

      // Calcul du top AI
      const civCounts: Record<string, number> = {};
      core.grid.forEach((c: any) => { // Cast ici pour éviter l'erreur ownerId
        if (c.ownerId && c.ownerId !== 'debris') {
          civCounts[c.ownerId] = (civCounts[c.ownerId] || 0) + 1;
        }
      });

      const topCivs = Object.entries(civCounts)
        .map(([id, count]) => ({
          name: core.civs.find(c => c.id === id)?.name || 'AI',
          percent: parseFloat(((count / Math.max(1, totalCells)) * 100).toFixed(1))
        }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 3);

      setStats({
        cpu: Math.floor(Math.random() * 15) + 5,
        dominance: parseFloat(((userCells / Math.max(1, totalCells)) * 100).toFixed(1)),
        lang: langName || 'NONE',
        topCivs,
        integrity: core.state.integrity,
        maxIntegrity: core.state.maxIntegrity,
        combo: core.state.combo,
        level: core.state.level,
        xp: core.state.xp,
        buffer: core.state.currentBuffer
      });
    }, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      clearInterval(statsInterval);
    };
  }, [draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const core = coreRef.current;
      if (showInstructions) setShowInstructions(false);

      const key = e.key.toLowerCase();
      // Arrow keys set both movement and typing direction!
      if (key === 'arrowup') { core.moveCursor(0, -1); core.setTypingDirection(0, -1); }
      else if (key === 'arrowdown') { core.moveCursor(0, 1); core.setTypingDirection(0, 1); }
      else if (key === 'arrowleft') { core.moveCursor(-1, 0); core.setTypingDirection(-1, 0); }
      else if (key === 'arrowright') { core.moveCursor(1, 0); core.setTypingDirection(1, 0); }

      if (key.match(/^f[1-9]$|^f1[0-2]$/)) {
         e.preventDefault();
         const match = key.match(/^f(\d+)$/);
         if (match) {
            const slotIndex = parseInt(match[1]) - 1;
            if (core.state.level >= slotIndex + 1 && core.state.memorySlots[slotIndex]) {
               core.pasteRealCode(core.state.memorySlots[slotIndex]);
            }
         }
         return;
      }

      // Copy paste / Macros
      if (e.ctrlKey) {
        if (key === 'c') {
          const cell: any = core.grid.get(`${core.cursor.x},${core.cursor.y}`);
          if (cell && cell.ownerId) {
            core.state.copiedLogic = { civId: cell.ownerId, char: cell.char, color: cell.color };
          }
        }
        if (key === 'v') {
          if (core.state.copiedLogic) {
            // Paste as our own logic bullet or convert cell directly
            core.grid.set(`${core.cursor.x},${core.cursor.y}`, {
              char: core.state.copiedLogic.char,
              color: core.state.copiedLogic.color,
              ownerId: null, // becomes ours
              life: 1
            });
          }
        }
        return;
      }

      // Typing
      if (e.key === 'Enter') {
        core.typeChar('Enter');
      } else if (e.key === 'Backspace') {
        core.typeChar('Backspace');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        core.typeChar(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => { };

    const handleWheel = (e: WheelEvent) => {
      const core = coreRef.current;
      core.targetZoom = Math.min(2, Math.max(0.1, core.targetZoom - e.deltaY * 0.001));
    };

    const handlePaste = (e: ClipboardEvent) => {
      const core = coreRef.current;
      const text = e.clipboardData?.getData('text');
      if (text) {
        core.pasteRealCode(text);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('paste', handlePaste);
    };
  }, [showInstructions]);

  const getBgStyle = () => {
     if (stats.level >= 10) return "bg-gradient-to-br from-[#020005] to-[#1a0b2e] text-purple-400 opacity-90 transition-all duration-1000";
     if (stats.level >= 5) return "bg-[#0b0a0a] text-orange-500 transition-all duration-1000";
     if (stats.level >= 3) return "bg-[#1f0000] text-red-500 scale-[1.01] transition-all duration-1000";
     if (stats.level >= 2) return "bg-[#000511] text-blue-500 transition-all duration-1000";
     return "bg-[#050505] text-gray-500 transition-all duration-1000";
  };

  return (
    <div className={`relative w-screen h-screen font-mono selection:bg-white/20 select-none overflow-hidden ${getBgStyle()}`}>
      
      {/* Parallax Background using pseudo-elements and strictly defined styles */}
      {stats.level >= 2 && stats.level < 10 && (
         <div className="absolute inset-0 pointer-events-none break-all font-mono opacity-10 text-[8px] leading-tight overflow-hidden text-[#ff0044]">
            {Array.from({length: 200}).map((_, i) => "ERROR_MEM_CORRUPT(0x" + Math.random().toString(16).substr(2, 6) + ")").join('  ')}
         </div>
      )}

      {stats.level >= 10 && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 mix-blend-screen scale-[1.5] animate-spin-slow">
             <div className="w-[100vw] h-[100vw] rounded-full border-[10px] border-dashed border-[#00ffff]/30" />
         </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ width: '100vw', height: '100vh', display: 'block' }}
        className={isGlitching ? 'crt-distortion' : ''}
      />

      {/* DOM layer for SVGs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {coreRef.current.state.entities.map((ent: any) => {
           if (ent.type === 'SVG_ANIMATED') {
               const scaledCell = CELL_SIZE * coreRef.current.zoom;
               const sx = (ent.x - coreRef.current.camera.x) * scaledCell + window.innerWidth / 2;
               const sy = (ent.y - coreRef.current.camera.y) * scaledCell + window.innerHeight / 2;
               const size = Math.max(30, scaledCell * ent.scale);
               return (
                  <div key={ent.id} style={{
                      position: 'absolute',
                      left: sx - size/2,
                      top: sy - size/2,
                      width: size,
                      height: size,
                      opacity: Math.max(0.1, ent.life / 500)
                  }} dangerouslySetInnerHTML={{ __html: ent.svgData || '' }} />
               );
           }
           return null;
        })}
      </div>

      {/* Sleek Bottom UI Bar */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-black/80 border-t border-[#00FF41]/30 backdrop-blur-md flex items-center justify-between px-8 z-50">
          <div className="flex items-center space-x-6 min-w-[300px]">
             <div className="text-[14px] font-bold text-[#00FF41] tracking-widest">LVL {stats.level}</div>
             <div className="w-[150px] h-2 bg-[#00FF41]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#00FF41] shadow-[0_0_10px_#00FF41]" style={{width: `${(stats.integrity/stats.maxIntegrity)*100}%`}}></div>
             </div>
             <div className="text-[12px] opacity-80 text-white">PWR: {coreRef.current.state.cursorPower}</div>
             {stats.combo > 1 && <div className="text-yellow-400 font-bold animate-pulse text-[12px]">COMBO x{stats.combo}</div>}
          </div>
          
          <div className="flex-1 flex justify-center space-x-2 text-[10px] text-gray-400 overflow-hidden px-4">
             {coreRef.current.state.memorySlots.map((slot, i) => (
                <div key={i} className={`px-2 py-1 border whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] ${stats.level > i ? "text-[#00FF41] border-[#00FF41]/50 bg-[#00FF41]/10" : "text-gray-600 border-gray-800 bg-black/50"} rounded`}>
                   <span className="font-bold opacity-50 mr-1">F{i+1}</span>{slot}
                </div>
             ))}
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-[#00FF41]/80 min-w-[250px] justify-end">
            <div>
              INJECT: <span className="text-white bg-black/50 px-2 py-1 border border-[#00ff41]/20 rounded">{stats.buffer}_</span>
            </div>
            <div className="w-[1px] h-6 bg-[#00FF41]/30"></div>
            <div className="font-mono">
              [ {coreRef.current.cursor.x.toString().padStart(4, ' ')} : {coreRef.current.cursor.y.toString().padStart(4, ' ')} ]
            </div>
          </div>
      </div>

      {/* CRT Elements */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {/* Intro Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[100]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center p-12 border border-[#00FF41]/20 bg-black/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,1)]"
            >
              <h1 className="text-2xl mb-8 tracking-[0.4em] font-bold" style={{ color: ASCII_UI_COLOR }}>GRID_WALKER.SYS</h1>
              <div className="text-[10px] opacity-80 space-y-3 font-mono uppercase tracking-[0.2em]">
                <p>MOVEMENT: <span className="text-white">[ARROWS ONLY]</span></p>
                <p>CODE INJECTION: <span className="text-white">[TYPE ANY WORD]</span></p>
                <p>EXECUTE/COMPILE: <span className="text-white">[ENTER]</span></p>
                <p>POWERS: <span className="text-white">WIPE / SHIELD / GRAVITY</span></p>
                <p>COPY/PASTE: <span className="text-white">[CTRL+C] on enemy / [CTRL+V]</span></p>
                <p>CAM_ZOOM: <span className="text-white">[MOUSE_WHEEL]</span></p>
              </div>
              <motion.div
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-10 px-4 py-2 border-t border-b border-[#00FF41]/30"
              >
                <span className="text-[10px] text-[#00FF41] tracking-[0.3em]">PRESS ANY KEY TO INITIALIZE SESSION</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
