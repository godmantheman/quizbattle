import { MissionState } from '../types';

export function generateMissionsForPlayer(shuffledNames?: string[]): MissionState[] {
  const list: Omit<MissionState, 'status'>[] = [
    {
      id: 1,
      name: 'palm_scan',
      koreanName: '✋ 손바닥 인식',
      description: '화면의 손바닥을 2초 동안 꾹 누르고 있으세요!',
      data: { requiredTime: 2000 }
    },
    {
      id: 2,
      name: 'gugudan',
      koreanName: '🔢 구구단 레이스',
      description: '올바른 곱셈 답안을 빠르게 찾아 터치하세요!',
      data: generateGugudanData()
    },
    {
      id: 3,
      name: 'erase_chalk',
      koreanName: '🧼 칠판 지우기',
      description: '낙서가 가득한 칠판을 문질러 깨끗이 지우세요!',
      data: { totalBlocks: 16 } // 4x4 grid of messy blocks to wipe
    },
    {
      id: 4,
      name: 'bell_chime',
      koreanName: '🔔 방과후 종치기',
      description: '종을 15번 연속으로 빠르게 두드려 종소리를 울리세요!',
      data: { requiredTaps: 15 }
    },
    {
      id: 5,
      name: 'trash_sort',
      koreanName: '♻️ 교실 분리수거',
      description: '3개의 쓰레기를 각각 올바른 재활용통에 넣으세요!',
      data: generateTrashSortData()
    },
    {
      id: 6,
      name: 'locker_cipher',
      koreanName: '🔐 사물함 암호',
      description: '반짝이는 컬러 버튼 패턴을 그대로 따라 누르세요!',
      data: generateLockerCipherData()
    },
    {
      id: 7,
      name: 'pencil_sharpen',
      koreanName: '✏️ 연필 깎기',
      description: '화면에 표시된 "깎기" 버튼을 연타하여 연필을 뾰족하게 만드세요!',
      data: { requiredSpins: 12 }
    },
    {
      id: 8,
      name: 'catch_flies',
      koreanName: '🪰 파리 소탕작전',
      description: '교실을 날아다니는 파리 4마리를 빠르게 탭해서 잡으세요!',
      data: generateFliesData()
    },
    {
      id: 9,
      name: 'lunch_tray',
      koreanName: '🍱 급식 배식하기',
      description: '지정된 급식 반찬 3가지를 순서대로 식판에 담으세요!',
      data: generateLunchTrayData()
    },
    {
      id: 10,
      name: 'ascending_numbers',
      koreanName: '🚪 교실 탈출 암호',
      description: '화면에 보이는 5개의 숫자 카드를 "가장 작은 수"부터 순서대로 터치해 탈출하세요!',
      data: generateAscendingNumbersData()
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

function generateGugudanData() {
  const num1 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
  const num2 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
  const correctAnswer = num1 * num2;

  const choicesSet = new Set<number>();
  choicesSet.add(correctAnswer);

  while (choicesSet.size < 4) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const wrong = correctAnswer + offset;
    if (wrong > 0 && wrong <= 100) {
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

function generateTrashSortData() {
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

  // Shuffle and pick 3 random items
  const selected = [...allItems].sort(() => Math.random() - 0.5).slice(0, 3);
  return {
    items: selected,
    currentIndex: 0
  };
}

function generateLockerCipherData() {
  const colors = ['🔴 Red', '🔵 Blue', '🟢 Green', '🟡 Yellow'];
  const patternIndices: number[] = [];
  for (let i = 0; i < 4; i++) {
    patternIndices.push(Math.floor(Math.random() * 4));
  }
  return {
    colors,
    pattern: patternIndices, // sequence of index 0..3
    playerInputs: [] as number[]
  };
}

function generateFliesData() {
  const flies = [];
  for (let i = 0; i < 4; i++) {
    flies.push({
      id: i,
      x: 15 + Math.random() * 70, // percentage x (15% ~ 85%)
      y: 15 + Math.random() * 70, // percentage y (15% ~ 85%)
      speed: 1.5 + Math.random() * 2,
      scale: 0.8 + Math.random() * 0.4
    });
  }
  return { flies };
}

function generateLunchTrayData() {
  const menuItems = [
    { name: '🍚 쌀밥', type: 'rice' },
    { name: '🍲 김치찌개', type: 'soup' },
    { name: '🍗 닭강정', type: 'chicken' },
    { name: '🍳 계란말이', type: 'egg' },
    { name: '🥗 양배추 샐러드', type: 'salad' },
    { name: '🌭 소시지 구이', type: 'sausage' }
  ];

  const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
  const targetMenu = shuffled.slice(0, 3); // 3 items to serve
  const choices = [...targetMenu].sort(() => Math.random() - 0.5); // shuffled options to choose from

  return {
    targetMenu, // exact items in correct serving order
    choices, // options presented to user
    servedIndex: 0
  };
}

function generateAscendingNumbersData() {
  const numbersSet = new Set<number>();
  while (numbersSet.size < 5) {
    numbersSet.add(Math.floor(Math.random() * 90) + 10); // two-digit numbers 10-99
  }
  const numbers = Array.from(numbersSet);
  const sorted = [...numbers].sort((a, b) => a - b);
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);

  return {
    shuffled,
    sorted,
    currentIndex: 0 // next target sorted index to click
  };
}
