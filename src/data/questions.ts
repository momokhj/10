import { DifficultyLevel, StageBlock, StoryQuestion, StoryTemplate } from '../types/game';

export const CURRICULUM_STANDARD = {
  code: '[2수01-05]',
  text: '덧셈과 뺄셈이 이루어지는 실생활 상황과 연결하여 덧셈과 뺄셈의 의미를 이해한다.',
  meta: '공통 / 초1~2 / 수학 / (1) 수와 연산',
  topic: '구체물이 있는 10의 보수 알기',
  objective: '구체물을 보고 10의 보수를 알 수 있다.',
} as const;

export const MAX_HEARTS = 5;
export const TOTAL_QUESTIONS = 10;

/**
 * 교사가 쉽게 수정할 수 있는 실생활 상황 문제 템플릿 데이터
 * 각 문항은 '10칸 채우기(10의 보수)' 실생활 상황을 담고 있습니다.
 */
export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'apple-box',
    title: '사과 상자 채우기',
    emoji: '🍎',
    unit: '개',
    containerName: '사과 상자',
    storyAdd: '10칸 사과 상자에 사과가 {n}개 들어 있어요. 상자를 꽉 채우려면 사과가 몇 개 더 필요할까요?',
    storySub: '사과 10개를 담는 상자에서 {n}개는 이미 채웠어요. 남은 빈 칸은 몇 개일까요? (10 - {n})',
    bgTint: '#FEF2F2',
  },
  {
    id: 'chick-bus',
    title: '병아리 스쿨버스',
    emoji: '🐥',
    unit: '마리',
    containerName: '10인승 버스',
    storyAdd: '10명이 타는 버스에 병아리가 {n}마리 탔어요. 빈 자리에 몇 마리가 더 탈 수 있을까요?',
    storySub: '버스 자리 10개 중에 병아리가 {n}자리에 앉았어요. 비어 있는 자리는 몇 개일까요? (10 - {n})',
    bgTint: '#FEFCE8',
  },
  {
    id: 'cookie-gift',
    title: '쿠키 선물 상자',
    emoji: '🍪',
    unit: '개',
    containerName: '쿠키 상자',
    storyAdd: '쿠키 10개 선물 상자에 초코쿠키 {n}개를 담았어요. 10개를 채우려면 몇 개를 더 담아야 할까요?',
    storySub: '선물 상자 10칸 중 {n}칸에 쿠키를 넣었어요. 아직 채우지 못한 칸은 몇 칸일까요? (10 - {n})',
    bgTint: '#FFF7ED',
  },
  {
    id: 'pencil-case',
    title: '색연필 통 정리',
    emoji: '✏️',
    unit: '자루',
    containerName: '연필꽂이',
    storyAdd: '10자루 꽂는 연필꽂이에 색연필 {n}자루가 있어요. 빈 칸을 다 채우려면 몇 자루가 더 필요할까요?',
    storySub: '10자루용 연필꽂이에서 {n}자루를 꽂았어요. 남은 빈 칸은 몇 자루 자리일까요? (10 - {n})',
    bgTint: '#EFF6FF',
  },
  {
    id: 'strawberry-cake',
    title: '딸기 케이크 꾸미기',
    emoji: '🍓',
    unit: '개',
    containerName: '케이크 접시',
    storyAdd: '케이크 위에 딸기 10개를 올릴 거예요. 지금 {n}개를 올렸다면 몇 개를 더 올려야 할까요?',
    storySub: '딸기 10개 중에서 {n}개를 먼저 올렸어요. 앞으로 올려야 할 딸기는 몇 개일까요? (10 - {n})',
    bgTint: '#FFF1F2',
  },
  {
    id: 'balloon-party',
    title: '생일 풍선 모으기',
    emoji: '🎈',
    unit: '개',
    containerName: '풍선 거치대',
    storyAdd: '파티 풍선 10개를 모아야 해요. 지금 {n}개를 불었어요. 몇 개를 더 불면 10개가 될까요?',
    storySub: '목표 풍선 10개 중에서 {n}개를 준비했어요. 아직 더 만들어야 할 풍선은 몇 개일까요? (10 - {n})',
    bgTint: '#F0FDF4',
  },
  {
    id: 'fish-tank',
    title: '어항 속 물고기',
    emoji: '🐟',
    unit: '마리',
    containerName: '어항',
    storyAdd: '어항에 물고기 10마리가 살 수 있어요. 지금 {n}마리가 헤엄치고 있다면 몇 마리가 더 들어올 수 있을까요?',
    storySub: '10마리가 들어가는 어항에 {n}마리가 있어요. 더 들어올 수 있는 자리는 몇 마리분일까요? (10 - {n})',
    bgTint: '#ECFEFF',
  },
  {
    id: 'donut-box',
    title: '달콤한 도넛 한 상자',
    emoji: '🍩',
    unit: '개',
    containerName: '도넛 상자',
    storyAdd: '도넛 10개 상자에 {n}개가 들어 있어요. 몇 개를 더 넣어야 10개가 될까요?',
    storySub: '10개짜리 도넛 상자에서 {n}개가 먼저 찼어요. 남은 빈 자리는 몇 개일까요? (10 - {n})',
    bgTint: '#FDF4FF',
  },
  {
    id: 'tulip-garden',
    title: '학교 화단 꽃 심기',
    emoji: '🌷',
    unit: '송이',
    containerName: '꽃밭',
    storyAdd: '화단 10칸에 튤립 {n}송이를 심었어요. 10송이를 다 심으려면 몇 송이가 더 필요할까요?',
    storySub: '10칸 화단 중 {n}칸에 꽃을 심었어요. 아직 꽃을 심지 않은 칸은 몇 칸일까요? (10 - {n})',
    bgTint: '#ECFDF5',
  },
  {
    id: 'soccer-basket',
    title: '체육시간 공 바구니',
    emoji: '⚽',
    unit: '개',
    containerName: '공 바구니',
    storyAdd: '공 바구니 10칸에 축구공 {n}개가 있어요. 10개를 맞추려면 몇 개를 더 넣어야 할까요?',
    storySub: '축구공 10개 바구니에서 {n}개만 찾았어요. 아직 더 찾아야 할 공은 몇 개일까요? (10 - {n})',
    bgTint: '#F0FDF4',
  },
  {
    id: 'cupcake-tray',
    title: '빵집 컵케이크 진열대',
    emoji: '🧁',
    unit: '개',
    containerName: '진열대',
    storyAdd: '진열대 10칸 중 {n}칸에 컵케이크가 있어요. 빈 칸을 모두 채우려면 몇 개가 더 필요할까요?',
    storySub: '10개짜리 진열대에 {n}개가 놓여 있어요. 비어 있는 칸은 몇 개일까요? (10 - {n})',
    bgTint: '#FFFBEB',
  },
  {
    id: 'tangerine-basket',
    title: '맛있는 귤 바구니',
    emoji: '🍊',
    unit: '개',
    containerName: '귤 바구니',
    storyAdd: '바구니 10칸에 귤 {n}개가 담겨 있어요. 10개가 되려면 귤 몇 개가 더 필요할까요?',
    storySub: '귤 10개 중에서 {n}개만 바구니에 있어요. 나머지 빈 칸에 들어갈 귤은 몇 개일까요? (10 - {n})',
    bgTint: '#FFF7ED',
  },
  {
    id: 'car-parking',
    title: '장난감 주차장',
    emoji: '🚗',
    unit: '대',
    containerName: '주차장',
    storyAdd: '10칸 주차장에 자동차가 {n}대 주차되어 있어요. 몇 대가 더 들어올 수 있을까요?',
    storySub: '10칸 주차장 중 {n}칸이 찼어요. 남은 빈 주차 칸은 몇 개일까요? (10 - {n})',
    bgTint: '#EFF6FF',
  },
  {
    id: 'star-constellation',
    title: '밤하늘 별 모으기',
    emoji: '🌟',
    unit: '개',
    containerName: '별자리 판',
    storyAdd: '별자리 10칸 중 {n}개가 빛나고 있어요. 10개를 모두 채우려면 별이 몇 개 더 필요할까요?',
    storySub: '10개의 별 칸 중에서 {n}개가 켜졌어요. 아직 꺼져 있는 칸은 몇 개일까요? (10 - {n})',
    bgTint: '#EEF2FF',
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 4개 선택지 생성 (정답 1개 + 가까운 오답 3개, 1~9 범위 내 중복 없이 무작위 배치)
 */
function buildChoices(answer: number): number[] {
  const candidates = new Set<number>([answer]);
  const offsets = shuffleArray([-2, -1, 1, 2, -3, 3, -4, 4]);

  for (const offset of offsets) {
    if (candidates.size >= 4) break;
    const candidate = answer + offset;
    if (candidate >= 1 && candidate <= 9) {
      candidates.add(candidate);
    }
  }

  for (let n = 1; n <= 9 && candidates.size < 4; n++) {
    candidates.add(n);
  }

  return shuffleArray(Array.from(candidates));
}

/**
 * 난이도에 따라 10문항을 랜덤으로 출제합니다.
 * - 1단계(쉬움): 이미 6~9개가 채워져 있어 1~4개를 찾는 기초 단계
 * - 2단계(보통): 1~9 모든 수의 10의 보수를 고르게 랜덤 출제
 * - 3단계(도전): 1~9 모든 수 + 덧셈/뺄셈 상황 문장 혼합 출제
 */
export function generateQuestions(difficulty: DifficultyLevel): StoryQuestion[] {
  const shuffledTemplates = shuffleArray(STORY_TEMPLATES).slice(0, TOTAL_QUESTIONS);

  let givenPool: number[] = [];
  if (difficulty === 1) {
    // 6, 7, 8, 9를 고르게 섞어 10문항 구성
    givenPool = shuffleArray([6, 7, 8, 9, 6, 7, 8, 9, 7, 8]);
  } else {
    // 1..9 모든 숫자를 포함하고 1개 추가해 10문항 랜덤 구성
    const extra = Math.floor(Math.random() * 9) + 1;
    givenPool = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, extra]);
  }

  return shuffledTemplates.map((tpl, index) => {
    const givenCount = givenPool[index];
    const answer = 10 - givenCount;
    const equationMode: 'add' | 'sub' =
      difficulty === 3 && index % 2 === 1 ? 'sub' : 'add';
    const rawStory = equationMode === 'sub' ? tpl.storySub : tpl.storyAdd;
    const storyText = rawStory.replaceAll('{n}', String(givenCount));

    return {
      index,
      templateId: tpl.id,
      title: tpl.title,
      emoji: tpl.emoji,
      unit: tpl.unit,
      containerName: tpl.containerName,
      givenCount,
      answer,
      storyText,
      equationMode,
      choices: buildChoices(answer),
      bgTint: tpl.bgTint,
    };
  });
}

/**
 * 스테이지 상자 배치 생성: 10개의 물음표(?) 문제 상자 + 4개의 보너스 별(★) 상자
 */
export function createStageBlocks(): StageBlock[] {
  const blocks: StageBlock[] = [];
  // 스테이지 총 길이 약 3300px, 시작 x=260부터 일정 간격으로 배치
  // 2번째, 5번째, 7번째, 9번째 문제 사이에 보너스 별 상자 배치
  const starAfterQuestions = new Set([1, 4, 6, 8]);
  let currentX = 280;

  for (let q = 0; q < TOTAL_QUESTIONS; q++) {
    blocks.push({
      id: `q-${q}`,
      type: 'question',
      x: currentX,
      y: 200,
      questionIndex: q,
      opened: false,
      bumpOffset: 0,
    });
    currentX += 210;

    if (starAfterQuestions.has(q)) {
      blocks.push({
        id: `star-${q}`,
        type: 'star',
        x: currentX - 45,
        y: 165,
        opened: false,
        bumpOffset: 0,
      });
      currentX += 140;
    }
  }

  return blocks;
}
