import React, { useEffect, useState } from 'react';
import { Volume2, RotateCcw, ArrowRight, CheckCircle2, XCircle, Hand } from 'lucide-react';
import { DifficultyLevel, StoryQuestion } from '../types/game';
import { TOTAL_QUESTIONS } from '../data/questions';
import {
  playCorrectSound,
  playPlaceItemSound,
  playWrongSound,
  speakKorean,
} from '../utils/sound';

interface QuestionModalProps {
  question: StoryQuestion;
  difficulty: DifficultyLevel;
  hearts: number;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  onCorrectAnswer: (earnedPoints: number) => void;
  onWrongAnswer: () => number; // returns remaining hearts
  onCloseToStage: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  difficulty,
  hearts,
  soundEnabled,
  ttsEnabled,
  onCorrectAnswer,
  onWrongAnswer,
  onCloseToStage,
}) => {
  // 빈 칸에 학생이 직접 채워 넣은 구체물 인덱스 집합 (탐색/세기 도우미)
  const [placedSlots, setPlacedSlots] = useState<number[]>([]);
  const [wrongChoices, setWrongChoices] = useState<number[]>([]);
  const [status, setStatus] = useState<'answering' | 'wrong' | 'correct'>('answering');
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isEquationDropActive, setIsEquationDropActive] = useState(false);

  // 터치/포인터 드래그 지원 (구체물 & 선택지 숫자 카드 공용)
  const [dragState, setDragState] = useState<{
    kind: 'item' | 'choice';
    value?: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    setPlacedSlots([]);
    setWrongChoices([]);
    setStatus('answering');
    setEarnedPoints(0);
    setSelectedChoice(null);
    if (ttsEnabled) {
      speakKorean(question.storyText, true);
    }
  }, [question, ttsEnabled]);

  const submitAnswer = (choice: number) => {
    if (status === 'correct') return;
    if (hearts <= 0) return;

    setSelectedChoice(choice);

    if (choice === question.answer) {
      const pts = wrongChoices.length === 0 ? 100 : 50;
      setEarnedPoints(pts);
      setStatus('correct');
      // 정답 시 빈 칸 모두 자동으로 채워 완성 모습 보여주기
      const allRemaining = Array.from({ length: 10 }, (_, idx) => idx).filter(
        (idx) => idx >= question.givenCount
      );
      setPlacedSlots(allRemaining);
      playCorrectSound(soundEnabled);
      if (ttsEnabled) {
        speakKorean(
          `정답이에요! ${question.givenCount} 더하기 ${question.answer}은 10이에요.`,
          true
        );
      }
      onCorrectAnswer(pts);
    } else {
      playWrongSound(soundEnabled);
      if (!wrongChoices.includes(choice)) {
        setWrongChoices((prev) => [...prev, choice]);
      }
      setStatus('wrong');
      const remaining = onWrongAnswer();
      if (ttsEnabled && remaining > 0) {
        speakKorean('아쉬워요. 빈 칸을 하나씩 세어 보고 다시 골라 보세요.', true);
      }
    }
  };

  // 키보드 1~4, Enter 지원
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (status === 'correct') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCloseToStage();
        }
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        const ch = question.choices[idx];
        if (ch !== undefined && !wrongChoices.includes(ch)) {
          e.preventDefault();
          submitAnswer(ch);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status, question, wrongChoices]);

  const toggleSlot = (slotIdx: number) => {
    if (slotIdx < question.givenCount || status === 'correct') return;
    playPlaceItemSound(soundEnabled);
    setPlacedSlots((prev) =>
      prev.includes(slotIdx) ? prev.filter((i) => i !== slotIdx) : [...prev, slotIdx]
    );
  };

  // 포인터 드래그 종료 시 드롭 위치 판별 (마우스 + 터치 모두 동작)
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragState((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const eqTarget = el?.closest('[data-drop-equation="true"]');
      setIsEquationDropActive(Boolean(eqTarget));
    };

    const handlePointerUp = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (dragState.kind === 'item') {
        const slotEl = el?.closest('[data-slot-index]') as HTMLElement | null;
        if (slotEl) {
          const idx = Number(slotEl.dataset.slotIndex);
          if (!Number.isNaN(idx) && idx >= question.givenCount && !placedSlots.includes(idx)) {
            playPlaceItemSound(soundEnabled);
            setPlacedSlots((prev) => [...prev, idx]);
          }
        }
      } else if (dragState.kind === 'choice' && dragState.value !== undefined) {
        const eqEl = el?.closest('[data-drop-equation="true"]');
        if (eqEl) {
          submitAnswer(dragState.value);
        }
      }

      setIsEquationDropActive(false);
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, placedSlots, question.givenCount, soundEnabled]);

  const totalShownCount = question.givenCount + placedSlots.length;

  return (
    <section
      aria-label={`문제 ${question.index + 1} 도전 화면`}
      className="w-full max-w-4xl mx-auto px-3 sm:px-5 py-4 animate-float-in"
    >
      <div className="bg-amber-50 pixel-panel p-4 sm:p-6 flex flex-col gap-5">
        {/* 상단 문제 제목 & 음성 읽기 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-300 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl" aria-hidden="true">
              {question.emoji}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                문제 {question.index + 1} / {TOTAL_QUESTIONS} · {difficulty}단계
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">{question.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => speakKorean(question.storyText, true)}
            className="pixel-btn min-h-[46px] px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Volume2 className="w-5 h-5" aria-hidden="true" />
            <span>문제 듣기</span>
          </button>
        </div>

        {/* 실생활 이야기 문장 */}
        <div
          className="p-4 sm:p-5 border-3 border-slate-800"
          style={{ backgroundColor: question.bgTint }}
        >
          <p className="text-lg sm:text-xl font-bold text-slate-950 leading-relaxed">
            {question.storyText}
          </p>
        </div>

        {/* 10칸 구체물 상자 (Ten-Frame) + 드래그 채우기 */}
        <div className="bg-white border-3 border-slate-800 p-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {question.containerName} (모두 10칸)
            </h3>
            <p className="text-sm sm:text-base font-bold text-slate-700 tabular-nums">
              원래 {question.givenCount}
              {question.unit} · 채워 본 것 {placedSlots.length}
              {question.unit} · 합계 {totalShownCount}/10
            </p>
          </div>

          {/* 2행 5열 = 10칸 상자 */}
          <div
            className="grid grid-cols-5 gap-2 sm:gap-3 max-w-xl mx-auto w-full"
            role="group"
            aria-label="10칸 구체물 상자"
          >
            {Array.from({ length: 10 }).map((_, idx) => {
              const isGiven = idx < question.givenCount;
              const isPlaced = placedSlots.includes(idx);

              return (
                <button
                  key={idx}
                  type="button"
                  data-slot-index={idx}
                  onClick={() => toggleSlot(idx)}
                  disabled={isGiven || status === 'correct'}
                  aria-label={
                    isGiven
                      ? `${idx + 1}번 칸: 원래 있는 ${question.emoji}`
                      : isPlaced
                        ? `${idx + 1}번 칸: 내가 채운 ${question.emoji} (누르면 비우기)`
                        : `${idx + 1}번 빈 칸 (누르거나 끌어서 채우기)`
                  }
                  className={`min-h-[60px] sm:min-h-[72px] border-3 flex flex-col items-center justify-center relative select-none transition-transform ${
                    isGiven
                      ? 'bg-amber-100 border-slate-800 cursor-default'
                      : isPlaced
                        ? 'bg-emerald-100 border-emerald-700 cursor-pointer animate-pop-bounce'
                        : 'bg-slate-50 border-dashed border-slate-400 hover:border-sky-600 hover:bg-sky-50 cursor-pointer'
                  }`}
                >
                  <span className="absolute top-0.5 left-1.5 text-[11px] font-bold text-slate-500 tabular-nums">
                    {idx + 1}
                  </span>
                  {isGiven || isPlaced ? (
                    <span className="text-2xl sm:text-3xl leading-none" aria-hidden="true">
                      {question.emoji}
                    </span>
                  ) : (
                    <span className="text-lg font-black text-slate-400" aria-hidden="true">
                      ?
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 구체물 바구니: 드래그하거나 눌러서 빈 칸 채우기 연습 */}
          {status !== 'correct' && (
            <div className="bg-slate-100 border-2 border-slate-300 px-3 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Hand className="w-4 h-4 text-sky-700 shrink-0" aria-hidden="true" />
                <span>
                  어려우면 {question.emoji}를 끌어다 빈 칸에 놓거나, 빈 칸을 직접 눌러 세어 보세요!
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setDragState({ kind: 'item', x: e.clientX, y: e.clientY });
                  }}
                  onClick={() => {
                    const nextEmpty = Array.from({ length: 10 }, (_, i) => i).find(
                      (i) => i >= question.givenCount && !placedSlots.includes(i)
                    );
                    if (nextEmpty !== undefined) toggleSlot(nextEmpty);
                  }}
                  aria-label={`구체물 ${question.emoji} 끌어다 놓기 또는 빈 칸 하나 채우기`}
                  className="pixel-btn min-h-[48px] px-4 py-1.5 bg-amber-300 hover:bg-amber-200 text-slate-950 font-black text-base flex items-center gap-2 cursor-grab active:cursor-grabbing touch-none"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {question.emoji}
                  </span>
                  <span className="text-sm">하나 놓기</span>
                </button>

                {placedSlots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPlacedSlots([])}
                    className="min-h-[48px] px-3 py-1.5 bg-white hover:bg-slate-200 border-2 border-slate-400 text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    비우기
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 수식 표시 및 드롭 영역 */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-1">
          <div
            data-drop-equation="true"
            className={`px-5 py-3 border-3 flex items-center gap-3 text-2xl sm:text-3xl font-black tabular-nums transition-colors ${
              isEquationDropActive
                ? 'bg-sky-100 border-sky-600'
                : status === 'correct'
                  ? 'bg-emerald-100 border-emerald-700'
                  : 'bg-white border-slate-800'
            }`}
          >
            {question.equationMode === 'add' ? (
              <>
                <span>{question.givenCount}</span>
                <span>+</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[54px] min-h-[50px] px-3 border-3 ${
                    status === 'correct'
                      ? 'bg-emerald-500 text-white border-slate-900'
                      : 'bg-amber-100 text-slate-900 border-dashed border-slate-700'
                  }`}
                >
                  {status === 'correct' ? question.answer : '?'}
                </span>
                <span>=</span>
                <span>10</span>
              </>
            ) : (
              <>
                <span>10</span>
                <span>-</span>
                <span>{question.givenCount}</span>
                <span>=</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[54px] min-h-[50px] px-3 border-3 ${
                    status === 'correct'
                      ? 'bg-emerald-500 text-white border-slate-900'
                      : 'bg-amber-100 text-slate-900 border-dashed border-slate-700'
                  }`}
                >
                  {status === 'correct' ? question.answer : '?'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 4개 선택지 (클릭, 터치, 키보드 1~4, 드래그 모두 가능) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {question.choices.map((choice, idx) => {
            const isWrongTried = wrongChoices.includes(choice);
            const isCorrectChosen = status === 'correct' && choice === question.answer;

            return (
              <button
                key={choice}
                type="button"
                disabled={isWrongTried || status === 'correct'}
                onClick={() => submitAnswer(choice)}
                onPointerDown={(e) => {
                  if (isWrongTried || status === 'correct') return;
                  // 짧은 클릭과 드래그 구분을 위해 좌표 저장 후 일정 이동 시에만 드래그 전환
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const onMoveCheck = (mv: PointerEvent) => {
                    if (Math.hypot(mv.clientX - startX, mv.clientY - startY) > 12) {
                      window.removeEventListener('pointermove', onMoveCheck);
                      window.removeEventListener('pointerup', onUpCancel);
                      setDragState({
                        kind: 'choice',
                        value: choice,
                        x: mv.clientX,
                        y: mv.clientY,
                      });
                    }
                  };
                  const onUpCancel = () => {
                    window.removeEventListener('pointermove', onMoveCheck);
                    window.removeEventListener('pointerup', onUpCancel);
                  };
                  window.addEventListener('pointermove', onMoveCheck);
                  window.addEventListener('pointerup', onUpCancel);
                }}
                aria-label={`선택지 ${idx + 1}번: ${choice}${question.unit}${
                  isWrongTried ? ' (이미 선택해 틀림)' : ''
                }`}
                className={`pixel-btn min-h-[88px] p-3 flex flex-col items-center justify-center gap-1.5 relative cursor-pointer select-none touch-none ${
                  isCorrectChosen
                    ? 'bg-emerald-400 text-slate-950'
                    : isWrongTried
                      ? 'bg-slate-200 text-slate-500 opacity-75 cursor-not-allowed'
                      : 'bg-white hover:bg-amber-200 text-slate-950'
                }`}
              >
                <span className="absolute top-1.5 left-2 text-xs font-bold text-slate-500">
                  [{idx + 1}]
                </span>

                {isWrongTried && (
                  <span
                    className="absolute top-1.5 right-2 flex items-center gap-0.5 text-xs font-black text-rose-700"
                    aria-hidden="true"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>아님</span>
                  </span>
                )}

                {isCorrectChosen && (
                  <span
                    className="absolute top-1.5 right-2 flex items-center gap-0.5 text-xs font-black text-emerald-950"
                    aria-hidden="true"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>정답</span>
                  </span>
                )}

                <span className="text-3xl sm:text-4xl font-black tabular-nums leading-none mt-2">
                  {choice}
                </span>

                {/* 수량 직관 단서 (색 외에 점 개수로 크기 비교 가능) */}
                <div className="flex flex-wrap items-center justify-center gap-1 max-w-[90px]" aria-hidden="true">
                  {Array.from({ length: choice }).map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`w-2.5 h-2.5 inline-block border border-slate-800 ${
                        isWrongTried ? 'bg-slate-400' : 'bg-amber-400'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* 피드백 영역 (정답 / 오답 + 다시 풀기) */}
        {status === 'wrong' && (
          <div
            role="alert"
            className="bg-rose-50 border-3 border-rose-700 p-4 flex flex-wrap items-center justify-between gap-3 animate-float-in"
          >
            <div className="flex items-start gap-2.5">
              <XCircle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-base sm:text-lg font-black text-rose-900">
                  아쉬워요! ({selectedChoice}은(는) 10칸을 채우기엔 맞지 않아요)
                </p>
                <p className="text-sm sm:text-base font-bold text-rose-800 mt-0.5">
                  원래 있는 {question.givenCount}
                  {question.unit} 옆에 빈 칸이 몇 칸 남았는지 세어 보고 다시 골라 볼까요? (하트 -1)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatus('answering')}
              className="pixel-btn min-h-[46px] px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>다시 풀기</span>
            </button>
          </div>
        )}

        {status === 'correct' && (
          <div
            role="status"
            className="bg-emerald-100 border-3 border-emerald-800 p-4 flex flex-wrap items-center justify-between gap-3 animate-pop-bounce"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-800 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-lg sm:text-xl font-black text-emerald-950">
                  정답이에요! {question.givenCount} + {question.answer} = 10 완성!
                </p>
                <p className="text-sm sm:text-base font-bold text-emerald-900 mt-0.5">
                  ★ 별 1개와 +{earnedPoints}점을 얻었어요!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseToStage}
              className="pixel-btn min-h-[52px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base sm:text-lg flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>모험 계속하기</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* 포인터 드래그 중인 고스트 카드 */}
      {dragState && (
        <div
          aria-hidden="true"
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: dragState.x, top: dragState.y }}
        >
          {dragState.kind === 'item' ? (
            <div className="w-14 h-14 bg-amber-200 border-3 border-slate-900 flex items-center justify-center text-3xl shadow-lg">
              {question.emoji}
            </div>
          ) : (
            <div className="w-16 h-16 bg-amber-300 border-3 border-slate-900 flex items-center justify-center text-3xl font-black text-slate-950 shadow-lg">
              {dragState.value}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
