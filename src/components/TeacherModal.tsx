import React, { useState } from 'react';
import { Lock, Unlock, X, ShieldCheck, BookOpen } from 'lucide-react';
import { DifficultyLevel, TeacherSettings } from '../types/game';
import { CURRICULUM_STANDARD } from '../data/questions';

interface TeacherModalProps {
  settings: TeacherSettings;
  onSaveSettings: (next: TeacherSettings, restartGame: boolean) => void;
  onClose: () => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [unlockedInSession, setUnlockedInSession] = useState(!settings.isLocked);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [studentName, setStudentName] = useState(settings.studentName);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(settings.difficulty);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [ttsEnabled, setTtsEnabled] = useState(settings.ttsEnabled);
  const [isLocked, setIsLocked] = useState(settings.isLocked);
  const [pinCode, setPinCode] = useState(settings.pinCode);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.pinCode) {
      setUnlockedInSession(true);
      setPinError('');
    } else {
      setPinError('비밀번호가 맞지 않습니다. (기본 비밀번호: 1234)');
    }
  };

  const handleApply = (restartGame: boolean) => {
    const cleanPin = pinCode.trim().length >= 4 ? pinCode.trim() : '1234';
    onSaveSettings(
      {
        studentName: studentName.trim(),
        difficulty,
        soundEnabled,
        ttsEnabled,
        isLocked,
        pinCode: cleanPin,
      },
      restartGame
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-modal-title"
    >
      <div className="bg-amber-50 pixel-panel w-full max-w-xl p-5 sm:p-6 text-slate-950 animate-float-in my-auto">
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-300 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {unlockedInSession ? (
              <Unlock className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            ) : (
              <Lock className="w-5 h-5 text-amber-700" aria-hidden="true" />
            )}
            <h2 id="teacher-modal-title" className="text-xl font-black">
              교사용 설정 및 수업 정보
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="교사용 설정 닫기"
            className="min-h-[42px] min-w-[42px] bg-white hover:bg-slate-200 border-2 border-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!unlockedInSession ? (
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <div className="bg-white border-2 border-slate-800 p-4">
              <p className="text-base font-bold text-slate-900">
                학생이 설정을 바꾸지 못하도록 교사용 설정이 잠겨 있습니다.
              </p>
              <p className="text-sm font-medium text-slate-600 mt-1">
                교사용 비밀번호를 입력해 잠금을 해제하세요. (초기 비밀번호: 1234)
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="teacher-pin-unlock" className="text-sm font-black text-slate-800">
                비밀번호 입력
              </label>
              <input
                id="teacher-pin-unlock"
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="1234"
                autoFocus
                className="min-h-[48px] px-3 bg-white border-3 border-slate-800 text-lg font-bold tracking-widest"
              />
              {pinError && (
                <p role="alert" className="text-sm font-bold text-rose-700">
                  {pinError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="pixel-btn min-h-[46px] px-4 bg-white text-slate-900 font-bold cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="pixel-btn min-h-[46px] px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer"
              >
                잠금 해제
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            {/* 학생 이름 (메모리 전용, 저장 안 함) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="student-name-input" className="text-sm font-black text-slate-900">
                학생 이름 (선택 사항 · 저장되지 않음)
              </label>
              <input
                id="student-name-input"
                type="text"
                maxLength={20}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="예: 김하늘"
                className="min-h-[46px] px-3 bg-white border-3 border-slate-800 text-base font-bold"
              />
              <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>
                  입력한 이름은 현재 화면에서만 표시되며, 기기나 외부 서버에 영구 저장·전송되지 않습니다.
                </span>
              </p>
            </div>

            {/* 난이도 선택 */}
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-black text-slate-900 mb-1">
                학습 난이도 설정
              </legend>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    level: 1 as DifficultyLevel,
                    title: '1단계 · 쉬움 (6~9개 채워진 상자)',
                    desc: '빈 칸 1~4개를 찾는 기초 단계로 시작합니다.',
                  },
                  {
                    level: 2 as DifficultyLevel,
                    title: '2단계 · 보통 (1~9개 전체 랜덤)',
                    desc: '1부터 9까지 모든 10의 보수를 덧셈 상황으로 풉니다.',
                  },
                  {
                    level: 3 as DifficultyLevel,
                    title: '3단계 · 도전 (덧셈·뺄셈 상황 혼합)',
                    desc: '더하기 상황과 빼기 상황(10 - N)을 함께 연습합니다.',
                  },
                ].map((opt) => (
                  <label
                    key={opt.level}
                    className={`p-3 border-3 cursor-pointer flex items-start gap-3 ${
                      difficulty === opt.level
                        ? 'bg-amber-200 border-slate-950'
                        : 'bg-white border-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={opt.level}
                      checked={difficulty === opt.level}
                      onChange={() => setDifficulty(opt.level)}
                      className="mt-1 w-4 h-4 accent-slate-950"
                    />
                    <div>
                      <div className="text-sm sm:text-base font-black text-slate-950">
                        {opt.title}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700">
                        {opt.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 음향 및 교사 잠금 설정 */}
            <div className="bg-white border-2 border-slate-800 p-3.5 flex flex-col gap-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm font-bold text-slate-900">8비트 효과음 사용</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 accent-slate-950"
                />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm font-bold text-slate-900">문제 자동으로 읽어주기 (음성)</span>
                <input
                  type="checkbox"
                  checked={ttsEnabled}
                  onChange={(e) => setTtsEnabled(e.target.checked)}
                  className="w-5 h-5 accent-slate-950"
                />
              </label>

              <div className="border-t border-slate-200 pt-2.5 flex flex-col gap-2">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-sm font-black text-slate-900">
                    교사용 설정 잠금 켜기 (학생 오조작 방지)
                  </span>
                  <input
                    type="checkbox"
                    checked={isLocked}
                    onChange={(e) => setIsLocked(e.target.checked)}
                    className="w-5 h-5 accent-slate-950"
                  />
                </label>

                {isLocked && (
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="teacher-pin-set" className="text-xs font-bold text-slate-700">
                      잠금 비밀번호 (4자리 이상)
                    </label>
                    <input
                      id="teacher-pin-set"
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-28 min-h-[38px] px-2 bg-slate-50 border-2 border-slate-700 text-sm font-bold text-center"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 성취기준 원문 안내 */}
            <div className="bg-slate-100 border-2 border-slate-300 p-3 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-black text-slate-900 mb-1">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>적용 교육과정 성취기준 (원문)</span>
              </div>
              <p className="font-bold text-slate-800">
                {CURRICULUM_STANDARD.code} {CURRICULUM_STANDARD.text}
              </p>
              <p className="text-slate-600 mt-0.5">{CURRICULUM_STANDARD.meta}</p>
            </div>

            {/* 저장/적용 버튼 */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleApply(false)}
                className="pixel-btn min-h-[46px] px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm cursor-pointer"
              >
                이름·잠금만 적용
              </button>
              <button
                type="button"
                onClick={() => handleApply(true)}
                className="pixel-btn min-h-[46px] px-5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm cursor-pointer"
              >
                설정 적용하고 새 문제로 시작
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
