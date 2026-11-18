import React from 'react';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  MessageSquareText,
  Lock,
  Unlock,
} from 'lucide-react';
import { MAX_HEARTS, TOTAL_QUESTIONS } from '../data/questions';

interface TopHudProps {
  studentName: string;
  hearts: number;
  stars: number;
  score: number;
  solvedCount: number;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  isFullscreen: boolean;
  isTeacherLocked: boolean;
  onToggleSound: () => void;
  onToggleTts: () => void;
  onToggleFullscreen: () => void;
  onRestart: () => void;
  onOpenTeacher: () => void;
}

function PixelHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="20"
      viewBox="0 0 11 10"
      aria-hidden="true"
      className="shrink-0"
      shapeRendering="crispEdges"
    >
      {/* 외곽선 */}
      <path
        d="M2 0h2v1h1v1h1V1h1V0h2v1h1v1h1v3h-1v2H9v1H8v1H7v1H4V9H3V8H2V7H1V5H0V2h1V1h1V0z"
        fill="#1E293B"
      />
      {/* 내부 색 */}
      <path
        d="M2 1h2v1h1v1h1V2h1V1h2v1h1v3H9v2H8v1H7v1H4V8H3V7H2V5H1V2h1V1z"
        fill={filled ? '#EF4444' : '#475569'}
      />
      {filled && <rect x="2" y="2" width="1" height="2" fill="#FCA5A5" />}
    </svg>
  );
}

export const TopHud: React.FC<TopHudProps> = ({
  studentName,
  hearts,
  stars,
  score,
  solvedCount,
  soundEnabled,
  ttsEnabled,
  isFullscreen,
  isTeacherLocked,
  onToggleSound,
  onToggleTts,
  onToggleFullscreen,
  onRestart,
  onOpenTeacher,
}) => {
  return (
    <header className="w-full bg-slate-900 text-white border-b-4 border-slate-950 px-3 sm:px-5 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        {/* Zone 1: 타이틀 & 학생 이름 (장식 알약 없이 깔끔한 텍스트) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base sm:text-lg font-black tracking-tight text-amber-300 whitespace-nowrap shrink-0">
            열 개 채우기 대모험
          </span>
          {studentName.trim() !== '' && (
            <>
              <span className="text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[140px]">
                {studentName.trim()} 학생
              </span>
            </>
          )}
        </div>

        {/* Zone 2: 핵심 게임 상태 (하트 5개, 별, 점수, 진행도 - 색+아이콘+숫자 병행) */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:text-base font-bold tabular-nums"
          aria-label={`남은 하트 ${hearts}개, 별 ${stars}개, 점수 ${score}점, 완료 문제 ${solvedCount}개 중 ${TOTAL_QUESTIONS}개`}
        >
          <div className="flex items-center gap-1.5" title={`하트 ${hearts}/${MAX_HEARTS}`}>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: MAX_HEARTS }).map((_, idx) => (
                <PixelHeart key={idx} filled={idx < hearts} />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-rose-300 font-pixel-num ml-1">
              {hearts}/{MAX_HEARTS}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
            ·
          </span>

          <div className="flex items-center gap-1 text-amber-300 whitespace-nowrap">
            <span aria-hidden="true">★</span>
            <span>별 {stars}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
            ·
          </span>

          <div className="flex items-center gap-1 text-sky-300 whitespace-nowrap">
            <span>점수</span>
            <span className="font-pixel-num text-sm">{score}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
            ·
          </span>

          <div className="text-emerald-300 whitespace-nowrap">
            <span>
              문제 {solvedCount}/{TOTAL_QUESTIONS}
            </span>
          </div>
        </div>

        {/* Zone 3: 기능 버튼 (모두 실제 작동하는 컨트롤) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            aria-pressed={soundEnabled}
            title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            className="min-h-[42px] min-w-[42px] px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border-2 border-slate-600 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline whitespace-nowrap">소리</span>
          </button>

          <button
            type="button"
            onClick={onToggleTts}
            aria-label={ttsEnabled ? '문제 읽어주기 끄기' : '문제 읽어주기 켜기'}
            aria-pressed={ttsEnabled}
            title={ttsEnabled ? '음성 읽기 켜짐' : '음성 읽기 꺼짐'}
            className={`min-h-[42px] px-2.5 py-2 border-2 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer ${
              ttsEnabled
                ? 'bg-sky-700 hover:bg-sky-600 border-sky-400 text-white'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span className="hidden md:inline whitespace-nowrap">읽어주기</span>
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? '전체 화면 나가기' : '전체 화면'}
            title={isFullscreen ? '전체 화면 나가기' : '전체 화면'}
            className="min-h-[42px] min-w-[42px] px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border-2 border-slate-600 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden lg:inline whitespace-nowrap">전체 화면</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            aria-label="처음부터 다시 시작"
            title="다시 시작"
            className="min-h-[42px] px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border-2 border-slate-600 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline whitespace-nowrap">다시 시작</span>
          </button>

          <button
            type="button"
            onClick={onOpenTeacher}
            aria-label="교사용 설정 열기"
            className="min-h-[42px] px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-950 flex items-center justify-center gap-1.5 text-xs font-black cursor-pointer whitespace-nowrap"
          >
            {isTeacherLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <Settings className="w-4 h-4" />
            <span>교사용</span>
          </button>
        </div>
      </div>
    </header>
  );
};
