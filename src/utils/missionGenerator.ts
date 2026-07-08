import { MissionState } from '../types';

export function generateMissionsForPlayer(
  shuffledNames?: string[],
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare' = 'normal'
): MissionState[] {
  const list: Omit<MissionState, 'status'>[] = [
    {
      id: 1,
      name: 'palm_scan',
      koreanName: '✋ 손바닥 인식',
      description: '화면의 손바닥을 꾹 누르고 있으세요!',
      data: {
        requiredTime:
          difficulty === 'easy' ? 1200 :
          difficulty === 'normal' ? 2000 :
          difficulty === 'hard' ? 3000 : 4500
      }
    },
    {
      id: 2,
      name: 'gugudan',
      koreanName: '🔢 구구단 레이스',
      description: difficulty === 'hard' || difficulty === 'nightmare'
        ? '어려운 곱셈 답안을 빠르게 찾아 터치하세요!'
        : '올바른 곱셈 답안을 빠르게 찾아 터치하세요!',
      data: generateGugudanData(difficulty)
    },
    {
      id: 3,
      name: 'erase_chalk',
      koreanName: '🧼 칠판 지우기',
      description: '낙서가 가득한 칠판을 문질러 깨끗이 지우세요!',
      data: {
        totalBlocks:
          difficulty === 'easy' ? 9 :
          difficulty === 'normal' ? 16 :
          difficulty === 'hard' ? 25 : 36
      }
    },
    {
      id: 4,
      name: 'bell_chime',
      koreanName: '🔔 방과후 종치기',
      description: '종을 마구 두드려 종소리를 울리세요!',
      data: {
        requiredTaps:
          difficulty === 'easy' ? 8 :
          difficulty === 'normal' ? 15 :
          difficulty === 'hard' ? 25 : 40
      }
    },
    {
      id: 5,
      name: 'trash_sort',
      koreanName: '♻️ 교실 분리수거',
      description: '쓰레기를 각각 올바른 재활용통에 넣으세요!',
      data: generateTrashSortData(difficulty)
    },
    {
      id: 6,
      name: 'locker_cipher',
      koreanName: '🔐 사물함 암호',
      description: '반짝이는 컬러 버튼 패턴을 그대로 따라 누르세요!',
      data: generateLockerCipherData(difficulty)
    },
    {
      id: 7,
      name: 'pencil_sharpen',
      koreanName: '✏️ 연필 깎기',
      description: '화면에 표시된 "깎기" 버튼을 연타하여 연필을 뾰족하게 만드세요!',
      data: {
        requiredSpins:
          difficulty === 'easy' ? 8 :
          difficulty === 'normal' ? 12 :
          difficulty === 'hard' ? 20 : 30
      }
    },
    {
      id: 8,
      name: 'catch_flies',
      koreanName: '🪰 파리 소탕작전',
      description: '교실을 날아다니는 파리들을 빠르게 탭해서 잡으세요!',
      data: generateFliesData(difficulty)
    },
    {
      id: 9,
      name: 'lunch_tray',
      koreanName: '🍱 급식 배식하기',
      description: '지정된 급식 반찬들을 순서대로 식판에 담으세요!',
      data: generateLunchTrayData(difficulty)
    },
    {
      id: 10,
      name: 'ascending_numbers',
      koreanName: '🚪 교실 탈출 암호',
      description: '숫자 카드를 "가장 작은 수"부터 순서대로 터치해 탈출하세요!',
      data: generateAscendingNumbersData(difficulty)
    },
    {
      id: 11,
      name: 'card_matching',
      koreanName: '🏫 카드 짝맞추기',
      description: '뒤집힌 카드들 중 똑같은 그림을 찾아 짝을 맞추세요!',
      data: generateCardMatchingData(difficulty)
    },
    {
      id: 12,
      name: 'pop_balloons',
      koreanName: '🎈 풍선 터뜨리기',
      description: '화면에 나타나는 알록달록한 풍선들을 모두 탭해서 터뜨리세요!',
      data: generatePopBalloonsData(difficulty)
    }
  ];

  let orderedList = list;
  if (shuffledNames) {
    orderedList = shuffledNames
      .map(name => list.find(m => m.name === name)!)
      .filter(Boolean);
  } else {
    orderedList = [...list].sort(() => Math.random() - 0.5);
  }

  // Map to add idle status and continuous ID
  return orderedList.map((item, index) => ({
    ...item,
    id: index + 1,
    status: 'idle'
  }));
}

function generateGugudanData(difficulty: string) {
  let num1 = 2;
  let num2 = 2;

  if (difficulty === 'easy') {
    num1 = Math.floor(Math.random() * 4) + 2; // 2 ~ 5
    num2 = Math.floor(Math.random() * 4) + 2; // 2 ~ 5
  } else if (difficulty === 'normal') {
    num1 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
    num2 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
  } else if (difficulty === 'hard') {
    num1 = Math.floor(Math.random() * 9) + 11; // 11 ~ 19
    num2 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
  } else { // nightmare
    num1 = Math.floor(Math.random() * 14) + 12; // 12 ~ 25
    num2 = Math.floor(Math.random() * 14) + 12; // 12 ~ 25
  }

  const correctAnswer = num1 * num2;
  const choicesSet = new Set<number>();
  choicesSet.add(correctAnswer);

  while (choicesSet.size < 4) {
    const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const wrong = correctAnswer + offset;
    if (wrong > 0 && wrong <= 650) {
      choicesSet.add(wrong);
    }
  }

  const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

  return {
    num1,
    num2,
    choices,
    correctAnswer
  };
}

function generateTrashSortData(difficulty: string) {
  const allItems = [
    { name: '🥛 우유갑', type: 'paper' },
    { name: '📝 찢어진 공책', type: 'paper' },
    { name: '📦 택배 박스', type: 'paper' },
    { name: '🥤 일회용 플라스틱 컵', type: 'plastic' },
    { name: '🧸 망가진 장난감', type: 'plastic' },
    { name: '🧴 페트병', type: 'plastic' },
    { name: '🥫 알루미늄 캔', type: 'metal' },
    { name: '📎 쇠클립', type: 'metal' },
    { name: '🥄 급식 숟가락', type: 'metal' }
  ];

  let count = 3;
  if (difficulty === 'easy') count = 2;
  else if (difficulty === 'normal') count = 3;
  else if (difficulty === 'hard') count = 5;
  else count = 7; // nightmare

  const selected = [...allItems].sort(() => Math.random() - 0.5).slice(0, count);
  return {
    items: selected,
    currentIndex: 0
  };
}

function generateLockerCipherData(difficulty: string) {
  const colors = ['🔴 Red', '🔵 Blue', '🟢 Green', '🟡 Yellow'];
  const patternIndices: number[] = [];
  
  let len = 4;
  if (difficulty === 'easy') len = 3;
  else if (difficulty === 'normal') len = 4;
  else if (difficulty === 'hard') len = 5;
  else len = 6; // nightmare

  for (let i = 0; i < len; i++) {
    patternIndices.push(Math.floor(Math.random() * 4));
  }
  return {
    colors,
    pattern: patternIndices,
    playerInputs: [] as number[]
  };
}

function generateFliesData(difficulty: string) {
  const flies = [];
  let count = 4;
  let speedBase = 1.5;
  let speedVar = 2.0;

  if (difficulty === 'easy') {
    count = 2;
    speedBase = 1.0;
    speedVar = 1.0;
  } else if (difficulty === 'normal') {
    count = 4;
    speedBase = 1.5;
    speedVar = 2.0;
  } else if (difficulty === 'hard') {
    count = 6;
    speedBase = 2.5;
    speedVar = 3.0;
  } else { // nightmare
    count = 9;
    speedBase = 3.5;
    speedVar = 4.0;
  }

  for (let i = 0; i < count; i++) {
    flies.push({
      id: i,
      x: 15 + Math.random() * 70, // percentage x (15% ~ 85%)
      y: 15 + Math.random() * 70, // percentage y (15% ~ 85%)
      speed: speedBase + Math.random() * speedVar,
      scale: 0.8 + Math.random() * 0.4
    });
  }
  return { flies };
}

function generateLunchTrayData(difficulty: string) {
  const menuItems = [
    { name: '🍚 쌀밥', type: 'rice' },
    { name: '🍲 김치찌개', type: 'soup' },
    { name: '🍗 닭강정', type: 'chicken' },
    { name: '🍳 계란말이', type: 'egg' },
    { name: '🥗 양배추 샐러드', type: 'salad' },
    { name: '🌭 소시지 구이', type: 'sausage' }
  ];

  let count = 3;
  if (difficulty === 'easy') count = 2;
  else if (difficulty === 'normal') count = 3;
  else if (difficulty === 'hard') count = 4;
  else count = 5; // nightmare

  const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
  const targetMenu = shuffled.slice(0, count);
  const choices = [...targetMenu].sort(() => Math.random() - 0.5);

  return {
    targetMenu,
    choices,
    servedIndex: 0
  };
}

function generateAscendingNumbersData(difficulty: string) {
  let count = 5;
  if (difficulty === 'easy') count = 3;
  else if (difficulty === 'normal') count = 5;
  else if (difficulty === 'hard') count = 7;
  else count = 9; // nightmare

  const numbersSet = new Set<number>();
  while (numbersSet.size < count) {
    numbersSet.add(Math.floor(Math.random() * 90) + 10); // two-digit numbers 10-99
  }
  const numbers = Array.from(numbersSet);
  const sorted = [...numbers].sort((a, b) => a - b);
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);

  return {
    shuffled,
    sorted,
    currentIndex: 0
  };
}

function generateCardMatchingData(difficulty: string) {
  const icons = ['🎒', '✏️', '🏫', '🎨', '⚽', '🍎', '📖', '📐'];
  let pairsCount = 3;

  if (difficulty === 'easy') pairsCount = 2;
  else if (difficulty === 'normal') pairsCount = 3;
  else if (difficulty === 'hard') pairsCount = 4;
  else pairsCount = 6; // nightmare (12 cards)

  const selectedIcons = icons.slice(0, pairsCount);
  const doubleList = [...selectedIcons, ...selectedIcons];
  const shuffled = doubleList
    .map((icon, idx) => ({ id: idx, value: icon, isFlipped: false, isMatched: false }))
    .sort(() => Math.random() - 0.5);

  return {
    cards: shuffled
  };
}

function generatePopBalloonsData(difficulty: string) {
  let balloonCount = 5;
  let speedBase = 0.45;
  let speedVar = 0.6;

  if (difficulty === 'easy') {
    balloonCount = 3;
    speedBase = 0.3;
    speedVar = 0.4;
  } else if (difficulty === 'normal') {
    balloonCount = 5;
    speedBase = 0.45;
    speedVar = 0.6;
  } else if (difficulty === 'hard') {
    balloonCount = 8;
    speedBase = 0.6;
    speedVar = 0.9;
  } else { // nightmare
    balloonCount = 12;
    speedBase = 0.8;
    speedVar = 1.2;
  }

  const balloons = [];
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-fuchsia-500', 'bg-cyan-500', 'bg-purple-500'];

  for (let i = 0; i < balloonCount; i++) {
    balloons.push({
      id: i,
      x: 10 + Math.random() * 80, // percentage x (10% ~ 90%)
      y: 100 + Math.random() * 40, // start below the viewport
      speed: speedBase + Math.random() * speedVar,
      size: 45 + Math.random() * 20, // 45px to 65px
      color: colors[i % colors.length]
    });
  }

  return { balloons };
}
