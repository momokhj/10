import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Sparkles } from 'lucide-react';
import { StageBlock } from '../types/game';
import { playBlockHitSound, playJumpSound, playStarSound } from '../utils/sound';

interface MarioStageProps {
  blocks: StageBlock[];
  playerX: number;
  soundEnabled: boolean;
  nextQuestionNumber: number;
  onUpdatePlayerX: (x: number) => void;
  onTriggerQuestion: (questionIndex: number) => void;
  onCollectStar: (blockId: string) => void;
}

interface FloatingEffect {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const VIRTUAL_W = 860;
const VIRTUAL_H = 380;
const GROUND_Y = 316;
const WORLD_W = 3050;
const PLAYER_W = 36;
const PLAYER_H = 44;
const BLOCK_SIZE = 44;

export const MarioStage: React.FC<MarioStageProps> = ({
  blocks,
  playerX,
  soundEnabled,
  nextQuestionNumber,
  onUpdatePlayerX,
  onTriggerQuestion,
  onCollectStar,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [statusBanner, setStatusBanner] = useState<string>(
    '방향키(또는 아래 버튼)로 걸어가서 점프하거나, 반짝이는 상자를 직접 눌러 보세요!'
  );

  // Physics & input refs for smooth 60fps loop without React re-render lag
  const stateRef = useRef({
    px: playerX,
    py: GROUND_Y - PLAYER_H,
    vx: 0,
    vy: 0,
    facing: 1 as 1 | -1,
    onGround: true,
    walkFrame: 0,
    autoTargetX: null as number | null,
    autoJumpQueued: false,
    leftPressed: false,
    rightPressed: false,
    jumpPressed: false,
    effects: [] as FloatingEffect[],
    bumpMap: {} as Record<string, number>,
    tick: 0,
    pointerStartX: null as number | null,
  });

  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  // Keep playerX synced when returning from modal or restarting
  useEffect(() => {
    stateRef.current.px = playerX;
    stateRef.current.py = GROUND_Y - PLAYER_H;
    stateRef.current.vy = 0;
    stateRef.current.onGround = true;
    stateRef.current.autoTargetX = null;
    stateRef.current.autoJumpQueued = false;
  }, [playerX]);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const st = stateRef.current;

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        st.rightPressed = true;
        st.autoTargetX = null;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        st.leftPressed = true;
        st.autoTargetX = null;
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (st.onGround) {
          st.vy = -11.4;
          st.onGround = false;
          playJumpSound(soundRef.current);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        moveToNextUnopened();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const st = stateRef.current;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        st.rightPressed = false;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        st.leftPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const moveToBlock = (block: StageBlock) => {
    const st = stateRef.current;
    st.autoTargetX = block.x + BLOCK_SIZE / 2 - PLAYER_W / 2;
    st.autoJumpQueued = true;
    setStatusBanner(
      block.type === 'star'
        ? '보너스 별 상자로 걸어가고 있어요!'
        : `${(block.questionIndex ?? 0) + 1}번 문제 상자로 걸어가고 있어요!`
    );
  };

  const moveToNextUnopened = () => {
    const nextBlock =
      blocksRef.current.find((b) => !b.opened && b.type === 'question') ??
      blocksRef.current.find((b) => !b.opened);
    if (nextBlock) {
      moveToBlock(nextBlock);
    }
  };

  const triggerJump = () => {
    const st = stateRef.current;
    if (st.onGround) {
      st.vy = -11.4;
      st.onGround = false;
      playJumpSound(soundRef.current);
    }
  };

  // Main 60fps canvas animation & physics loop
  useEffect(() => {
    let rafId = 0;
    let lastOpenedCooldown = 0;

    const loop = () => {
      const st = stateRef.current;
      st.tick += 1;
      if (lastOpenedCooldown > 0) lastOpenedCooldown -= 1;

      // 1. Horizontal movement (manual or auto-walk to tapped block)
      const speed = 4.6;
      if (st.autoTargetX !== null) {
        const diff = st.autoTargetX - st.px;
        if (Math.abs(diff) <= speed) {
          st.px = st.autoTargetX;
          st.vx = 0;
          st.autoTargetX = null;
          if (st.autoJumpQueued && st.onGround) {
            st.vy = -11.6;
            st.onGround = false;
            st.autoJumpQueued = false;
            playJumpSound(soundRef.current);
          }
        } else {
          st.vx = Math.sign(diff) * speed;
          st.facing = diff > 0 ? 1 : -1;
          st.px += st.vx;
          st.walkFrame += 0.22;
        }
      } else {
        if (st.rightPressed && !st.leftPressed) {
          st.vx = speed;
          st.facing = 1;
          st.walkFrame += 0.22;
        } else if (st.leftPressed && !st.rightPressed) {
          st.vx = -speed;
          st.facing = -1;
          st.walkFrame += 0.22;
        } else {
          st.vx = 0;
        }
        st.px += st.vx;
      }

      st.px = Math.max(24, Math.min(WORLD_W - 80, st.px));

      // 2. Vertical jump physics
      st.vy += 0.56; // Gravity
      const prevPy = st.py;
      st.py += st.vy;

      if (st.py >= GROUND_Y - PLAYER_H) {
        st.py = GROUND_Y - PLAYER_H;
        st.vy = 0;
        st.onGround = true;
      }

      // 3. Block head-bump collision check (Mario style: hitting block from underneath!)
      if (st.vy < 0 && lastOpenedCooldown === 0) {
        const playerCenterX = st.px + PLAYER_W / 2;
        const playerTop = st.py;

        for (const block of blocksRef.current) {
          const bx1 = block.x - 8;
          const bx2 = block.x + BLOCK_SIZE + 8;
          const blockBottom = block.y + BLOCK_SIZE;

          if (
            playerCenterX >= bx1 &&
            playerCenterX <= bx2 &&
            prevPy >= blockBottom - 14 &&
            playerTop <= blockBottom + 4
          ) {
            st.vy = 2.5; // Bounce downward gently
            st.bumpMap[block.id] = 12;
            lastOpenedCooldown = 20;

            if (!block.opened) {
              if (block.type === 'star') {
                playStarSound(soundRef.current);
                st.effects.push({
                  id: Date.now() + Math.random(),
                  x: block.x + BLOCK_SIZE / 2,
                  y: block.y - 10,
                  text: '★ +50점!',
                  color: '#FACC15',
                  life: 48,
                });
                setStatusBanner('반짝반짝 보너스 별을 찾았어요! (+50점)');
                onCollectStar(block.id);
              } else if (block.type === 'question' && block.questionIndex !== undefined) {
                playBlockHitSound(soundRef.current);
                onUpdatePlayerX(st.px);
                onTriggerQuestion(block.questionIndex);
              }
            } else {
              playBlockHitSound(soundRef.current);
              setStatusBanner('이미 열어 본 상자예요! 다음 ? 상자로 가 볼까요?');
            }
            break;
          }
        }
      }

      // Update block bump animations
      for (const key of Object.keys(st.bumpMap)) {
        if (st.bumpMap[key] > 0) {
          st.bumpMap[key] -= 1.5;
          if (st.bumpMap[key] < 0) st.bumpMap[key] = 0;
        }
      }

      // Update floating effects
      st.effects = st.effects
        .map((ef) => ({ ...ef, y: ef.y - 1.1, life: ef.life - 1 }))
        .filter((ef) => ef.life > 0);

      // 4. Draw 8-bit Pixel World on Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          const camX = Math.max(0, Math.min(WORLD_W - VIRTUAL_W, st.px - VIRTUAL_W * 0.34));

          // Sky
          ctx.fillStyle = '#5C94FC';
          ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

          // Distant pixel clouds (parallax 0.35)
          const cloudPositions = [90, 340, 620, 910, 1220, 1520, 1840, 2150, 2460, 2790];
          for (let i = 0; i < cloudPositions.length; i++) {
            const cx = Math.floor(cloudPositions[i] - camX * 0.35);
            const cy = 48 + (i % 3) * 26;
            if (cx > -100 && cx < VIRTUAL_W + 100) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(cx + 12, cy, 48, 18);
              ctx.fillRect(cx, cy + 8, 72, 16);
              ctx.fillStyle = '#DBEAFE';
              ctx.fillRect(cx + 4, cy + 20, 64, 4);
            }
          }

          // Distant pixel hills (parallax 0.55)
          const hillPositions = [60, 420, 820, 1200, 1600, 2000, 2420, 2800];
          for (let i = 0; i < hillPositions.length; i++) {
            const hx = Math.floor(hillPositions[i] - camX * 0.55);
            if (hx > -160 && hx < VIRTUAL_W + 160) {
              const hh = i % 2 === 0 ? 78 : 54;
              ctx.fillStyle = '#16A34A';
              ctx.fillRect(hx, GROUND_Y - hh, 110, hh);
              ctx.fillRect(hx + 16, GROUND_Y - hh - 16, 78, 16);
              ctx.fillRect(hx + 34, GROUND_Y - hh - 26, 42, 10);
              ctx.fillStyle = '#22C55E';
              ctx.fillRect(hx + 20, GROUND_Y - hh - 10, 14, 14);
            }
          }

          // Green pipes as friendly world landmarks
          const pipeXs = [150, 740, 1340, 1940, 2560];
          for (const pipeWorldX of pipeXs) {
            const pxScreen = Math.floor(pipeWorldX - camX);
            if (pxScreen > -70 && pxScreen < VIRTUAL_W + 70) {
              ctx.fillStyle = '#14532D';
              ctx.fillRect(pxScreen - 4, GROUND_Y - 56, 52, 20);
              ctx.fillRect(pxScreen, GROUND_Y - 36, 44, 36);
              ctx.fillStyle = '#22C55E';
              ctx.fillRect(pxScreen - 1, GROUND_Y - 53, 46, 14);
              ctx.fillRect(pxScreen + 3, GROUND_Y - 35, 38, 35);
              ctx.fillStyle = '#86EFAC';
              ctx.fillRect(pxScreen + 6, GROUND_Y - 52, 8, 12);
              ctx.fillRect(pxScreen + 8, GROUND_Y - 34, 6, 33);
            }
          }

          // Goal Flagpole & Pixel Castle at end of stage
          const goalX = Math.floor(2910 - camX);
          if (goalX < VIRTUAL_W + 150) {
            // Flagpole
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(goalX - 3, GROUND_Y - 170, 6, 170);
            ctx.fillStyle = '#FACC15';
            ctx.fillRect(goalX - 7, GROUND_Y - 180, 14, 14);
            // Red flag
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(goalX + 3, GROUND_Y - 166, 44, 26);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(goalX + 12, GROUND_Y - 159, 14, 12);

            // Pixel Castle
            const castleX = goalX + 66;
            ctx.fillStyle = '#94A3B8';
            ctx.fillRect(castleX, GROUND_Y - 88, 76, 88);
            ctx.fillStyle = '#64748B';
            ctx.fillRect(castleX + 16, GROUND_Y - 118, 44, 30);
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(castleX + 26, GROUND_Y - 46, 24, 46);
            // Battlements
            ctx.fillStyle = '#CBD5E1';
            for (let b = 0; b < 4; b++) {
              ctx.fillRect(castleX + b * 20, GROUND_Y - 96, 12, 10);
            }
          }

          // Ground bricks
          const firstTile = Math.floor(camX / 32) * 32;
          for (let tx = firstTile; tx < camX + VIRTUAL_W + 32; tx += 32) {
            const sx = Math.floor(tx - camX);
            // Grass top
            ctx.fillStyle = '#15803D';
            ctx.fillRect(sx, GROUND_Y, 32, 10);
            ctx.fillStyle = '#4ADE80';
            ctx.fillRect(sx, GROUND_Y, 32, 5);
            // Brick rows
            ctx.fillStyle = '#B45309';
            ctx.fillRect(sx, GROUND_Y + 10, 32, VIRTUAL_H - GROUND_Y - 10);
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(sx + 2, GROUND_Y + 12, 13, 12);
            ctx.fillRect(sx + 17, GROUND_Y + 12, 13, 12);
            ctx.fillRect(sx + 8, GROUND_Y + 28, 16, 12);
            ctx.fillStyle = '#78350F';
            ctx.fillRect(sx, GROUND_Y + 25, 32, 3);
            ctx.fillRect(sx + 15, GROUND_Y + 10, 2, 15);
          }

          // Next unopened question block target pointer
          const nextQ = blocksRef.current.find((b) => b.type === 'question' && !b.opened);

          // Draw Question (?) and Star (★) blocks
          for (const block of blocksRef.current) {
            const bx = Math.floor(block.x - camX);
            if (bx < -60 || bx > VIRTUAL_W + 60) continue;
            const bump = st.bumpMap[block.id] ?? 0;
            const by = Math.floor(block.y - bump);

            // Bouncing arrow above next target question block
            if (nextQ && nextQ.id === block.id) {
              const arrowBob = Math.sin(st.tick * 0.14) * 5;
              const ax = bx + BLOCK_SIZE / 2;
              const ay = by - 20 + arrowBob;
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(ax - 6, ay - 12, 12, 12);
              ctx.fillStyle = '#FACC15';
              ctx.fillRect(ax - 4, ay - 10, 8, 8);
              // Triangle tip
              ctx.beginPath();
              ctx.moveTo(ax - 10, ay);
              ctx.lineTo(ax + 10, ay);
              ctx.lineTo(ax, ay + 10);
              ctx.closePath();
              ctx.fillStyle = '#FACC15';
              ctx.fill();
              ctx.strokeStyle = '#1E293B';
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            // Block outer pixel border
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);

            if (block.opened) {
              ctx.fillStyle = '#78350F';
              ctx.fillRect(bx + 3, by + 3, BLOCK_SIZE - 6, BLOCK_SIZE - 6);
              ctx.fillStyle = '#B45309';
              ctx.fillRect(bx + 6, by + 6, BLOCK_SIZE - 12, BLOCK_SIZE - 12);
              ctx.fillStyle = '#FEF3C7';
              ctx.font = 'bold 20px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('✓', bx + BLOCK_SIZE / 2, by + BLOCK_SIZE / 2 + 1);
            } else if (block.type === 'star') {
              ctx.fillStyle = '#F59E0B';
              ctx.fillRect(bx + 3, by + 3, BLOCK_SIZE - 6, BLOCK_SIZE - 6);
              ctx.fillStyle = '#FEF08A';
              ctx.fillRect(bx + 6, by + 6, BLOCK_SIZE - 14, 5);
              ctx.fillStyle = '#1E293B';
              ctx.font = 'bold 24px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('★', bx + BLOCK_SIZE / 2, by + BLOCK_SIZE / 2 + 1);
            } else {
              // Question block
              const pulse = Math.sin(st.tick * 0.1) > 0;
              ctx.fillStyle = pulse ? '#FACC15' : '#EAB308';
              ctx.fillRect(bx + 3, by + 3, BLOCK_SIZE - 6, BLOCK_SIZE - 6);
              ctx.fillStyle = '#FEF9C3';
              ctx.fillRect(bx + 6, by + 6, BLOCK_SIZE - 14, 5);
              // Corner bolts
              ctx.fillStyle = '#92400E';
              ctx.fillRect(bx + 6, by + 6, 4, 4);
              ctx.fillRect(bx + BLOCK_SIZE - 10, by + 6, 4, 4);
              ctx.fillRect(bx + 6, by + BLOCK_SIZE - 10, 4, 4);
              ctx.fillRect(bx + BLOCK_SIZE - 10, by + BLOCK_SIZE - 10, 4, 4);

              ctx.fillStyle = '#1E293B';
              ctx.font = '900 24px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('?', bx + BLOCK_SIZE / 2, by + BLOCK_SIZE / 2 + 1);

              // Question number tag under block
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(bx + 10, by + BLOCK_SIZE + 4, 24, 16);
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 11px sans-serif';
              ctx.fillText(`${(block.questionIndex ?? 0) + 1}`, bx + BLOCK_SIZE / 2, by + BLOCK_SIZE + 12);
            }
          }

          // Draw 8-bit Explorer Character ("마리")
          const cx = Math.floor(st.px - camX);
          const cy = Math.floor(st.py);
          const legSwing = st.vx !== 0 && st.onGround ? Math.sin(st.walkFrame) * 4 : 0;

          // Shadow on ground
          ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
          ctx.fillRect(cx + 4, GROUND_Y - 2, PLAYER_W - 8, 4);

          // Red pixel cap
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(cx + 4, cy, 28, 10);
          ctx.fillRect(cx + (st.facing === 1 ? 8 : 0), cy + 6, 28, 5);
          // Cap badge
          ctx.fillStyle = '#FACC15';
          ctx.fillRect(cx + (st.facing === 1 ? 18 : 12), cy + 2, 6, 5);

          // Face
          ctx.fillStyle = '#FDBA74';
          ctx.fillRect(cx + 6, cy + 11, 24, 13);
          // Eye
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(cx + (st.facing === 1 ? 22 : 10), cy + 14, 4, 5);

          // Blue overalls body
          ctx.fillStyle = '#2563EB';
          ctx.fillRect(cx + 6, cy + 24, 24, 12);
          // Shirt sleeves
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(cx + 2, cy + 24, 6, 9);
          ctx.fillRect(cx + 28, cy + 24, 6, 9);
          // Buttons
          ctx.fillStyle = '#FACC15';
          ctx.fillRect(cx + 10, cy + 26, 4, 4);
          ctx.fillRect(cx + 22, cy + 26, 4, 4);

          // Shoes (walking or jumping)
          ctx.fillStyle = '#78350F';
          if (!st.onGround) {
            ctx.fillRect(cx + 4, cy + 34, 12, 8);
            ctx.fillRect(cx + 20, cy + 38, 12, 8);
          } else {
            ctx.fillRect(cx + 5 + legSwing, cy + 36, 11, 8);
            ctx.fillRect(cx + 20 - legSwing, cy + 36, 11, 8);
          }

          // Floating star/score effects
          for (const ef of st.effects) {
            const ex = Math.floor(ef.x - camX);
            ctx.save();
            ctx.globalAlpha = Math.min(1, ef.life / 16);
            ctx.fillStyle = '#0F172A';
            ctx.font = '900 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ef.text, ex + 2, ef.y + 2);
            ctx.fillStyle = ef.color;
            ctx.fillText(ef.text, ex, ef.y);
            ctx.restore();
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [onCollectStar, onTriggerQuestion, onUpdatePlayerX]);

  // Handle direct tap/click or swipe on canvas
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_W / rect.width;
    const scaleY = VIRTUAL_H / rect.height;
    const clickVX = (e.clientX - rect.left) * scaleX;
    const clickVY = (e.clientY - rect.top) * scaleY;

    const st = stateRef.current;
    st.pointerStartX = e.clientX;

    const camX = Math.max(0, Math.min(WORLD_W - VIRTUAL_W, st.px - VIRTUAL_W * 0.34));
    const worldClickX = clickVX + camX;

    // Check if user tapped directly on any block (generous hit box for special ed touch)
    const clickedBlock = blocksRef.current.find(
      (b) =>
        worldClickX >= b.x - 16 &&
        worldClickX <= b.x + BLOCK_SIZE + 16 &&
        clickVY >= b.y - 24 &&
        clickVY <= b.y + BLOCK_SIZE + 24
    );

    if (clickedBlock) {
      moveToBlock(clickedBlock);
      return;
    }

    // Otherwise, tap left/right of player to nudge or tap high to jump
    if (clickVY < GROUND_Y - 120) {
      triggerJump();
    } else if (worldClickX > st.px + PLAYER_W) {
      st.autoTargetX = Math.min(WORLD_W - 80, worldClickX - PLAYER_W / 2);
      st.autoJumpQueued = false;
    } else if (worldClickX < st.px) {
      st.autoTargetX = Math.max(24, worldClickX - PLAYER_W / 2);
      st.autoJumpQueued = false;
    }
  };

  return (
    <section
      aria-label="8비트 모험 스테이지"
      className="w-full max-w-5xl mx-auto flex flex-col gap-3 px-3 sm:px-4 py-3"
    >
      {/* 안내 배너 + 빠른 이동 버튼 */}
      <div className="bg-amber-50 pixel-panel-light px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
          <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {statusBanner}
          </p>
        </div>

        <button
          type="button"
          onClick={moveToNextUnopened}
          className="pixel-btn min-h-[46px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>{nextQuestionNumber}번 문제 상자로 바로 가기</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* 8비트 픽셀 캔버스 */}
      <div className="relative w-full bg-sky-400 pixel-panel overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          width={VIRTUAL_W}
          height={VIRTUAL_H}
          onPointerDown={handleCanvasPointerDown}
          className="w-full h-auto block pixel-canvas cursor-pointer touch-none"
          aria-label="캐릭터가 걸어가며 점프해 상자를 여는 8비트 스테이지 화면"
        />
      </div>

      {/* 큰 터치/클릭 아케이드 조작 버튼 (모바일·태블릿·마우스 모두 지원) */}
      <div className="bg-slate-800 pixel-panel-light px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="왼쪽으로 이동"
            onPointerDown={() => {
              stateRef.current.leftPressed = true;
              stateRef.current.autoTargetX = null;
            }}
            onPointerUp={() => {
              stateRef.current.leftPressed = false;
            }}
            onPointerLeave={() => {
              stateRef.current.leftPressed = false;
            }}
            onPointerCancel={() => {
              stateRef.current.leftPressed = false;
            }}
            className="pixel-btn min-h-[58px] min-w-[78px] px-4 bg-slate-100 hover:bg-white text-slate-950 font-black text-lg flex items-center justify-center gap-1.5 cursor-pointer select-none"
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
            <span>왼쪽</span>
          </button>

          <button
            type="button"
            aria-label="오른쪽으로 이동"
            onPointerDown={() => {
              stateRef.current.rightPressed = true;
              stateRef.current.autoTargetX = null;
            }}
            onPointerUp={() => {
              stateRef.current.rightPressed = false;
            }}
            onPointerLeave={() => {
              stateRef.current.rightPressed = false;
            }}
            onPointerCancel={() => {
              stateRef.current.rightPressed = false;
            }}
            className="pixel-btn min-h-[58px] min-w-[88px] px-4 bg-slate-100 hover:bg-white text-slate-950 font-black text-lg flex items-center justify-center gap-1.5 cursor-pointer select-none"
          >
            <span>오른쪽</span>
            <ArrowRight className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <p className="hidden lg:block text-sm font-bold text-slate-300">
          키보드: ← → 이동 · 스페이스바 점프 · 엔터 다음 상자
        </p>

        <button
          type="button"
          aria-label="점프해서 상자 열기"
          onClick={triggerJump}
          className="pixel-btn min-h-[58px] min-w-[136px] px-6 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-lg flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <ArrowUp className="w-6 h-6" aria-hidden="true" />
          <span>점프!</span>
        </button>
      </div>
    </section>
  );
};
