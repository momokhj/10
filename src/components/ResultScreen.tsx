import React from 'react';
import { RotateCcw, Trophy, HeartCrack } from 'lucide-react';
import { MAX_HEARTS, TOTAL_QUESTIONS } from '../data/questions';

interface ResultScreenProps {
  mode: 'CLEAR' | 'GAME_OVER';
  studentName: string;
  score: number;
  stars: number;
  hearts: number;
  solvedCount: number;
  firstTryCount: number;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  mode,
  studentName,
  score,
  stars,
  hearts,
  solvedCount,
  firstTryCount,
  onRestart,
}) => {
  const isClear = mode === 'CLEAR';

  return (
    <section
      aria-label={isClear ? '모험 완료 결과 화면' : '하트 소진 안내 화면'}
      className="w-full max-w-2xl mx-auto px-4 py-8 animate-float-in"
    >
      <div className="bg-amber-50 pixel-panel p-6 sm:p-8 text-center flex flex-col items-center gap-5">
        <div
          className={`w-20 h-20 border-4 border-slate-900 flex items-center justify-center ${
            isClear ? 'bg-amber-400' : 'bg-rose-200'
          }`}
          aria-hidden="true"
        >
          {isClear ? (
            <Trophy className="w-11 h-11 text-slate-950" />
          ) : (
            <HeartCrack className="w-11 h-11 text-rose-700" />
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
            {isClear
              ? `${studentName ? `${studentName} 학생, ` : ''}10개 상자를 모두 열었어요!`
              : `${studentName ? `${studentName} 학생, ` : ''}하트가 모두 떨어졌어요!`}
          </h1>
          <p className="text-base sm:text-lg font-bold text-slate-700 mt-2">
            {isClear
              ? '구체물을 보고 10을 만드는 수를 멋지게 찾았어요!'
              : '괜찮아요! 다시 시작해서 10을 채우는 모험에 도전해 볼까요?'}
          </p>
        </div>

        {/* 결과 요약 (깔끔한 그리드) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-950">
          <div className="bg-white border-3 border-slate-800 p-3">
            <div className="text-xs font-bold text-slate-600">최종 점수</div>
            <div className="text-2xl font-black font-pixel-num text-sky-700 mt-1">{score}</div>
          </div>

          <div className="bg-white border-3 border-slate-800 p-3">
            <div className="text-xs font-bold text-slate-600">모은 별</div>
            <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">★ {stars}</div>
          </div>

          <div className="bg-white border-3 border-slate-800 p-3">
            <div className="text-xs font-bold text-slate-600">푼 문제</div>
            <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
              {solvedCount}/{TOTAL_QUESTIONS}
            </div>
          </div>

          <div className="bg-white border-3 border-slate-800 p-3">
            <div className="text-xs font-bold text-slate-600">남은 하트</div>
            <div className="text-2xl font-black text-rose-600 mt-1 tabular-nums">
              ♥ {hearts}/{MAX_HEARTS}
            </div>
          </div>
        </div>

        {isClear && (
          <p className="text-sm sm:text-base font-bold text-slate-700">
            한 번에 맞힌 문제: {firstTryCount} / {TOTAL_QUESTIONS}문제
          </p>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="pixel-btn min-h-[58px] px-8 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-lg sm:text-xl flex items-center gap-2.5 cursor-pointer"
        >
          <RotateCcw className="w-6 h-6" aria-hidden="true" />
          <span>새로운 문제로 다시 시작하기</span>
        </button>
      </div>
    </section>
  );
};
