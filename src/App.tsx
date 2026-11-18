/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Star, Heart, HelpCircle, Shield } from 'lucide-react';
import {
  DifficultyLevel,
  GameScreen,
  StageBlock,
  StoryQuestion,
  TeacherSettings,
} from './types/game';
import {
  CURRICULUM_STANDARD,
  MAX_HEARTS,
  TOTAL_QUESTIONS,
  createStageBlocks,
  generateQuestions,
} from './data/questions';
import { TopHud } from './components/TopHud';
import { MarioStage } from './components/MarioStage';
import { QuestionModal } from './components/QuestionModal';
import { TeacherModal } from './components/TeacherModal';
import { ResultScreen } from './components/ResultScreen';
import { playGameOverSound, playVictorySound, stopSpeaking } from './utils/sound';

const DEFAULT_SETTINGS: TeacherSettings = {
  studentName: '',
  difficulty: 1,
  soundEnabled: true,
  ttsEnabled: false,
  isLocked: false,
  pinCode: '1234',
};

export default function App() {
  const appContainerRef = useRef<HTMLDivElement | null>(null);

  const [settings, setSettings] = useState<TeacherSettings>(DEFAULT_SETTINGS);
  const [screen, setScreen] = useState<GameScreen>('INTRO');
  const [questions, setQuestions] = useState<StoryQuestion[]>(() =>
    generateQuestions(DEFAULT_SETTINGS.difficulty)
  );
  const [blocks, setBlocks] = useState<StageBlock[]>(() => createStageBlocks());
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const [hearts, setHearts] = useState<number>(MAX_HEARTS);
  const [stars, setStars] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [firstTryCount, setFirstTryCount] = useState<number>(0);
  const [playerX, setPlayerX] = useState<number>(72);

  const [showTeacherModal, setShowTeacherModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenNotice, setFullscreenNotice] = useState<string>('');

  const gameOverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (gameOverTimeoutRef.current) {
        window.clearTimeout(gameOverTimeoutRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const resetGame = useCallback(
    (nextDifficulty: DifficultyLevel = settings.difficulty, goToStage = false) => {
      if (gameOverTimeoutRef.current) {
        window.clearTimeout(gameOverTimeoutRef.current);
        gameOverTimeoutRef.current = null;
      }
      stopSpeaking();
      setQuestions(generateQuestions(nextDifficulty));
      setBlocks(createStageBlocks());
      setActiveQuestionIndex(0);
      setHearts(MAX_HEARTS);
      setStars(0);
      setScore(0);
      setSolvedCount(0);
      setFirstTryCount(0);
      setPlayerX(72);
      setScreen(goToStage ? 'STAGE' : 'INTRO');
    },
    [settings.difficulty]
  );

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const target = appContainerRef.current ?? document.documentElement;
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else {
          throw new Error('Fullscreen API unsupported');
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      setFullscreenNotice('현재 화면 환경에서는 전체 화면 전환이 제한되어 있습니다.');
      window.setTimeout(() => setFullscreenNotice(''), 3000);
    }
  };

  const handleTriggerQuestion = useCallback((questionIndex: number) => {
    setActiveQuestionIndex(questionIndex);
    setScreen('QUESTION');
  }, []);

  const handleCollectStar = useCallback((blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, opened: true } : b))
    );
    setStars((s) => s + 1);
    setScore((sc) => sc + 50);
  }, []);

  const handleCorrectAnswer = useCallback(
    (earnedPoints: number) => {
      const targetId = `q-${activeQuestionIndex}`;
      setBlocks((prev) =>
        prev.map((b) => (b.id === targetId ? { ...b, opened: true } : b))
      );
      setScore((sc) => sc + earnedPoints);
      setStars((st) => st + 1);
      setSolvedCount((cnt) => cnt + 1);
      if (earnedPoints === 100) {
        setFirstTryCount((ft) => ft + 1);
      }
    },
    [activeQuestionIndex]
  );

  const handleWrongAnswer = useCallback(() => {
    let nextHearts = 0;
    setHearts((prev) => {
      nextHearts = Math.max(0, prev - 1);
      return nextHearts;
    });

    // React state updater runs synchronously here for calculation,
    // also guard against stale closure by computing from current hearts:
    const computedRemaining = Math.max(0, hearts - 1);
    if (computedRemaining === 0) {
      gameOverTimeoutRef.current = window.setTimeout(() => {
        playGameOverSound(settings.soundEnabled);
        setScreen('GAME_OVER');
      }, 650);
    }
    return computedRemaining;
  }, [hearts, settings.soundEnabled]);

  const handleReturnToStage = () => {
    stopSpeaking();
    if (solvedCount >= TOTAL_QUESTIONS) {
      playVictorySound(settings.soundEnabled);
      setScreen('CLEAR');
    } else {
      setScreen('STAGE');
    }
  };

  const handleSaveTeacherSettings = (next: TeacherSettings, restart: boolean) => {
    setSettings(next);
    if (restart) {
      resetGame(next.difficulty, true);
    }
  };

  const nextQuestionBlock = blocks.find((b) => b.type === 'question' && !b.opened);
  const nextQuestionNumber = nextQuestionBlock ? (nextQuestionBlock.questionIndex ?? 0) + 1 : TOTAL_QUESTIONS;
  const activeQuestion = questions[activeQuestionIndex];

  return (
    <div
      ref={appContainerRef}
      className="min-h-screen bg-slate-900 text-slate-950 flex flex-col"
    >
      <TopHud
        studentName={settings.studentName}
        hearts={hearts}
        stars={stars}
        score={score}
        solvedCount={solvedCount}
        soundEnabled={settings.soundEnabled}
        ttsEnabled={settings.ttsEnabled}
        isFullscreen={isFullscreen}
        isTeacherLocked={settings.isLocked}
        onToggleSound={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onToggleTts={() =>
          setSettings((prev) => {
            if (prev.ttsEnabled) stopSpeaking();
            return { ...prev, ttsEnabled: !prev.ttsEnabled };
          })
        }
        onToggleFullscreen={handleToggleFullscreen}
        onRestart={() => resetGame(settings.difficulty, screen !== 'INTRO')}
        onOpenTeacher={() => setShowTeacherModal(true)}
      />

      {fullscreenNotice && (
        <div
          role="status"
          className="bg-amber-300 text-slate-950 text-center text-sm font-bold py-1.5 px-4 border-b-2 border-slate-900"
        >
          {fullscreenNotice}
        </div>
      )}

      <main className="flex-1 flex flex-col justify-center py-4">
        {screen === 'INTRO' && (
          <section
            aria-label="게임 시작 안내"
            className="w-full max-w-4xl mx-auto px-4 py-4 animate-float-in"
          >
            <div className="bg-sky-500 pixel-panel p-5 sm:p-8 text-slate-950 flex flex-col gap-6">
              <div className="bg-amber-50 border-4 border-slate-900 p-5 sm:p-7 flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-sky-800">
                      {CURRICULUM_STANDARD.topic} · {settings.difficulty}단계 난이도
                    </p>
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-950 mt-1">
                      열 개 채우기 대모험
                    </h1>
                  </div>

                  {/* 픽셀 아이콘 장식 */}
                  <div className="flex items-center gap-2 text-3xl" aria-hidden="true">
                    <span>🍎</span>
                    <span>🐥</span>
                    <span>🍪</span>
                    <span>⭐</span>
                  </div>
                </div>

                <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                  {settings.studentName ? `${settings.studentName} 친구, 안녕! ` : ''}
                  주인공 &lsquo;마리&rsquo;와 함께 걸어가고 점프하면서{' '}
                  <strong className="text-amber-700">물음표(?) 상자 10개</strong>를 열어 보세요.
                  그림을 보고 <strong className="text-emerald-700">10개를 꽉 채우려면 몇 개가 더 필요한지</strong> 찾으면 별과 점수를 얻어요!
                </p>

                {/* 핵심 놀이 규칙 3가지 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border-3 border-slate-800 p-3.5 flex items-start gap-2.5">
                    <HelpCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-black text-slate-950">? 상자 10개 풀기</div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">
                        걸어가서 점프하거나 상자를 직접 누르면 이야기가 열려요.
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-3 border-slate-800 p-3.5 flex items-start gap-2.5">
                    <Star className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-black text-slate-950">★ 별 상자 보너스</div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">
                        중간에 숨은 별 상자를 점프해 치면 보너스 별과 점수를 얻어요.
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-3 border-slate-800 p-3.5 flex items-start gap-2.5">
                    <Heart className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-black text-slate-950">하트 5개로 도전</div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">
                        문제를 틀리면 하트 1개가 줄어들고, 다시 풀 수 있어요.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 시작 버튼 & 교사용 설정 버튼 */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTeacherModal(true)}
                    className="pixel-btn min-h-[52px] px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-slate-700" aria-hidden="true" />
                    <span>교사용 설정 (이름·난이도)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => resetGame(settings.difficulty, true)}
                    className="pixel-btn min-h-[60px] px-8 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xl flex items-center gap-2.5 cursor-pointer"
                  >
                    <Play className="w-6 h-6 fill-slate-950" aria-hidden="true" />
                    <span>모험 시작하기!</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {screen === 'STAGE' && (
          <MarioStage
            blocks={blocks}
            playerX={playerX}
            soundEnabled={settings.soundEnabled}
            nextQuestionNumber={nextQuestionNumber}
            onUpdatePlayerX={setPlayerX}
            onTriggerQuestion={handleTriggerQuestion}
            onCollectStar={handleCollectStar}
          />
        )}

        {screen === 'QUESTION' && activeQuestion && (
          <QuestionModal
            question={activeQuestion}
            difficulty={settings.difficulty}
            hearts={hearts}
            soundEnabled={settings.soundEnabled}
            ttsEnabled={settings.ttsEnabled}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            onCloseToStage={handleReturnToStage}
          />
        )}

        {(screen === 'CLEAR' || screen === 'GAME_OVER') && (
          <ResultScreen
            mode={screen}
            studentName={settings.studentName}
            score={score}
            stars={stars}
            hearts={hearts}
            solvedCount={solvedCount}
            firstTryCount={firstTryCount}
            onRestart={() => resetGame(settings.difficulty, true)}
          />
        )}
      </main>

      {showTeacherModal && (
        <TeacherModal
          settings={settings}
          onSaveSettings={handleSaveTeacherSettings}
          onClose={() => setShowTeacherModal(false)}
        />
      )}
    </div>
  );
}
