/**
 * Cyber Security Awareness - 2D Narrative Point & Click Game
 * game.js - Dialogue System, Hotspots, Exploration, Phishing Mini-game & Security Score / Day Cycle
 */

// โครงสร้าง State การทำงานของเกม
const gameState = {
  currentDay: 1,
  mode: 'intro', // 'intro' | 'explore' | 'inspect' | 'minigame' | 'day_complete' | 'game_over'
  score: 0,
  maxScore: 100,
  mistakesCount: 0,
  inventory: [],
  flags: {
    hasExploredRouter: false,
    routerScoreAwarded: false,
    hasExploredComputer: false,
    phishingQuestCompleted: false,
    phishingScoreAwarded: false,
    day1Completed: false,
    // Day 2 Flags
    hasExploredPhone: false,
    smsCurrentCase: 1,
    smsCase1Completed: false,
    smsCase2Completed: false,
    smsQuestCompleted: false,
    smsScoreAwarded: false,
    hasExploredUsb: false,
    usbQuestCompleted: false,
    usbScoreAwarded: false,
    hasExploredCamera: false,
    cameraQuestCompleted: false,
    cameraScoreAwarded: false,
    day2Completed: false
  },
  dialogueIndex: 0,
  isTyping: false,
  activeDialogueQueue: [] // ลิสต์ข้อความที่กำลังเปิดอ่าน
};

// บทสนทนาช่วงเปิดเรื่อง (Intro Dialogues)
const introDialogues = [
  {
    speaker: 'วิน (ตัวเอก)',
    avatar: '🧑‍💻',
    text: 'วันนี้เป็นวันแรกที่ผมกลับมาอยู่บ้าน...'
  },
  {
    speaker: 'วิน (ตัวเอก)',
    avatar: '🧑‍💻',
    text: 'ดูเหมือนมีหลายอย่างในบ้านที่ยังไม่ได้ตั้งค่าความปลอดภัย'
  },
  {
    speaker: 'วิน (ตัวเอก)',
    avatar: '💡',
    text: 'ลองกดสำรวจอุปกรณ์ในห้องนี้ดูหน่อยดีกว่า'
  }
];

// ข้อมูลจุดสำรวจในฉาก (Hotspot Data)
const hotspotData = {
  router: {
    name: 'เราเตอร์ Wi-Fi',
    speaker: 'วิน (ตัวเอก)',
    avatar: '📡',
    text: 'เราเตอร์นี้ยังใช้รหัสผ่านดั้งเดิมจากโรงงานอยู่เลย ควรเข้าไปเปลี่ยนนะ'
  }
};

// ตัวแปรควบคุมระบบ Typewriter และบทสนทนา
let typewriterTimer = null;
let dialogueAutoCloseTimer = null;
let currentGraphemes = [];
let currentGraphemeIndex = 0;
const TYPING_SPEED_MS = 30; // ความเร็วตัวอักษร

// เริ่มต้นทำงานเมื่อโหลดหน้าเว็บเรียบร้อย
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  console.log('✨ Cozy Cyber Security Game Initialized.');
  console.log('Canvas Ready:', { width: canvas?.width, height: canvas?.height });

  // วาดภาพฉากห้องสไตล์อบอุ่นบน Canvas
  if (canvas) {
    renderRoomScene(canvas);
  }

  initGameEvents();
  initHotspots();
  initDialogueSystem();
  initRouterModal();
  initPhishingModal();
  initSMSModal();
  initUsbModal();
  initCameraModal();
  initDayCompleteModal();
  initQuestLog();
  initGameSummaryScreen();
  updateScoreUI();

  // เริ่มบทสนทนาเปิดเรื่อง
  startIntroDialogue();
});

/**
 * กำหนด Event Listeners พื้นฐานของระบบเกม
 */
function initGameEvents() {
  const gameContainer = document.getElementById('game-container');

  // ตรวจจับการกดปุ่มทางคีย์บอร์ด
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      // ถ้าเปิด Modal ใดๆ อยู่ ไม่ให้ Spacebar เลื่อนบทสนทนา
      if (
        gameState.mode === 'minigame' || 
        gameState.mode === 'day_complete' || 
        gameState.mode === 'quest_log' ||
        gameState.mode === 'game_over'
      ) return;

      event.preventDefault(); // ป้องกันหน้าจอเลื่อน
      handleDialogueAdvance();
    } else if (event.code === 'Escape') {
      if (gameState.mode === 'game_over') return;

      if (gameState.mode === 'quest_log') {
        closeQuestLogModal();
      } else if (gameState.mode === 'minigame') {
        closeRouterModal();
        closePhishingModal();
        closeSMSModal();
        closeUsbModal();
        closeCameraModal();
      } else if (gameState.mode === 'inspect') {
        closeDialogueBox();
      }
    }
  });

  // ป้องกันการคลิก Canvas เมื่อกดโดน UI หรือ Modal
  if (gameContainer) {
    gameContainer.addEventListener('click', (event) => {
      if (
        event.target.closest('#dialogue-box') || 
        event.target.closest('.hotspot-btn') ||
        event.target.closest('#router-modal-backdrop') ||
        event.target.closest('#phishing-modal-backdrop') ||
        event.target.closest('#day-complete-backdrop') ||
        event.target.closest('#quest-log-backdrop') ||
        event.target.closest('#quest-log-btn') ||
        event.target.closest('#sms-modal-backdrop') ||
        event.target.closest('#usb-modal-backdrop') ||
        event.target.closest('#camera-modal-backdrop') ||
        event.target.closest('#screen-fade-transition') ||
        event.target.closest('#game-summary-backdrop')
      ) {
        return;
      }
      // Point & Click coordinates logic
    });
  }
}

/**
 * เริ่มต้นระบบจุดสำรวจ (Hotspots)
 */
function initHotspots() {
  const routerBtn = document.getElementById('hotspot-router');
  const computerBtn = document.getElementById('hotspot-computer');
  const phoneBtn = document.getElementById('hotspot-phone');
  const usbBtn = document.getElementById('hotspot-usb');
  const cameraBtn = document.getElementById('hotspot-camera');

  if (routerBtn) {
    routerBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📡 Hotspot Router clicked!');
      openRouterModal();
    };
  }

  if (computerBtn) {
    computerBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🖥️ Hotspot Computer clicked!');
      openPhishingModal();
    };
  }

  if (phoneBtn) {
    phoneBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📱 Hotspot Phone clicked!');
      openSMSModal();
    };
  }

  if (usbBtn) {
    usbBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('💾 Hotspot USB clicked!');
      openUsbModal();
    };
  }

  if (cameraBtn) {
    cameraBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📹 Hotspot Camera clicked!');
      openCameraModal();
    };
  }

  // จุดสำรวจสิ่งของตกแต่ง (Easter Eggs & Interactive Props)
  const bookshelfBtn = document.getElementById('hotspot-bookshelf');
  const coffeeNoteBtn = document.getElementById('hotspot-coffee-note');
  const powerstripBtn = document.getElementById('hotspot-powerstrip');

  if (bookshelfBtn) {
    bookshelfBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📚 Hotspot Bookshelf clicked!');
      inspectBookshelf();
    };
  }

  if (coffeeNoteBtn) {
    coffeeNoteBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('☕ Hotspot Coffee & Note clicked!');
      inspectCoffeeNote();
    };
  }

  if (powerstripBtn) {
    powerstripBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔌 Hotspot Power Strip clicked!');
      inspectPowerstrip();
    };
  }
}

/**
 * ==========================================================================
 * ระบบจุดสำรวจสิ่งของตกแต่งในห้อง (Easter Eggs & Interactive Props)
 * ==========================================================================
 */

/**
 * สำรวจชั้นหนังสือ (Bookshelf)
 */
function inspectBookshelf() {
  if (gameState.mode === 'minigame' || gameState.mode === 'game_over') return;

  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '📚',
      text: 'มีหนังสือ Cyber Security 101 วางอยู่... เคล็ดลับบอกว่าควรรองรับและเปิดใช้งาน 2FA (Two-Factor Authentication) ในทุกบัญชีเสมอ เพื่อเพิ่มความปลอดภัยอีกชั้น!'
    }
  ];

  updateStatusIndicator('📚 กำลังสำรวจชั้นหนังสือ');
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * สำรวจแก้วกาแฟและกระดาษโน้ตบนโต๊ะ (Coffee Mug & Post-it Note)
 */
function inspectCoffeeNote() {
  if (gameState.mode === 'minigame' || gameState.mode === 'game_over') return;

  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '☕',
      text: 'แก้วกาแฟยังอุ่นๆ อยู่เลย ข้างๆ มีกระดาษโน้ตเขียนเตือนใจว่า: "อย่าเขียนรหัสผ่านแปะไว้ใต้คีย์บอร์ดหรือหน้าจอนะ!" แอบน่ารักและเตือนสติได้ดีมาก'
    }
  ];

  updateStatusIndicator('☕ กำลังสำรวจแก้วกาแฟและโน้ตบนโต๊ะ');
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * สำรวจปลั๊กไฟพ่วงใต้โต๊ะ (Power Strip under Desk)
 */
function inspectPowerstrip() {
  if (gameState.mode === 'minigame' || gameState.mode === 'game_over') return;

  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '🔌',
      text: 'สายไฟและปลั๊กพ่วงใต้โต๊ะถูกจัดวางอย่างเป็นระเบียบ ไม่เสียบอุปกรณ์โหลดไฟเกิน และมีระบบตัดไฟอัตโนมัติ ช่วยปกป้องฮาร์ดแวร์คอมพิวเตอร์จากไฟกระชาก'
    }
  ];

  updateStatusIndicator('🔌 กำลังสำรวจปลั๊กไฟพ่วงใต้โต๊ะ');
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * เริ่มต้นระบบกล่องข้อความและปุ่มปิด
 */
function initDialogueSystem() {
  const dialogueBox = document.getElementById('dialogue-box');
  const closeBtn = document.getElementById('dialogue-close-btn');

  if (dialogueBox) {
    dialogueBox.addEventListener('click', (e) => {
      // หากคลิกที่ปุ่มปิด ให้ทำงานที่ปุ่มปิดเท่านั้น
      if (e.target.closest('#dialogue-close-btn')) return;
      e.stopPropagation();
      handleDialogueAdvance();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDialogueBox();
    });
  }
}

/**
 * เริ่มเล่นบทสนทนาเปิดเกม
 */
function startIntroDialogue() {
  gameState.mode = 'intro';
  gameState.activeDialogueQueue = [...introDialogues];
  gameState.dialogueIndex = 0;

  updateStatusIndicator('💡 โหมดบทนำ');
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * การสำรวจวัตถุเมื่อผู้เล่นคลิก Hotspot เราเตอร์
 */
function inspectObject(key) {
  const item = hotspotData[key];
  if (!item) return;

  if (key === 'router') {
    gameState.flags.hasExploredRouter = true;
    
    // ได้รับ +50 คะแนนเมื่อสำรวจเราเตอร์สำเร็จ (ให้ครั้งแรก)
    if (!gameState.flags.routerScoreAwarded) {
      gameState.flags.routerScoreAwarded = true;
      addScore(50);
      updateQuestLogUI();

      // อัปเดตไอคอน/Tooltip ของเราเตอร์
      const routerBtn = document.getElementById('hotspot-router');
      if (routerBtn) {
        const tooltip = routerBtn.querySelector('.hotspot-tooltip');
        if (tooltip) tooltip.textContent = 'ตรวจสอบเราเตอร์ Wi-Fi (ตรวจสอบแล้ว ✅)';
      }
    }
  }

  gameState.mode = 'inspect';
  gameState.activeDialogueQueue = [item];
  gameState.dialogueIndex = 0;

  updateStatusIndicator(`🔍 กำลังสำรวจ: ${item.name}`);
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * เปิดการแสดงผลกล่องข้อความ
 */
function openDialogueBox() {
  const dialogueBox = document.getElementById('dialogue-box');
  if (dialogueBox) {
    dialogueBox.classList.remove('hidden');
  }
}

/**
 * ปิดกล่องข้อความและกลับเข้าสู่โหมดสำรวจห้อง
 */
function closeDialogueBox() {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }
  if (dialogueAutoCloseTimer) {
    clearTimeout(dialogueAutoCloseTimer);
    dialogueAutoCloseTimer = null;
  }
  gameState.isTyping = false;
  setPlayerTalkingAnimation(false);

  const dialogueBox = document.getElementById('dialogue-box');
  if (dialogueBox) {
    dialogueBox.classList.add('hidden');
  }

  // เข้าสู่โหมดสำรวจห้อง
  gameState.mode = 'explore';
  updateStatusIndicator('🔍 โหมดสำรวจห้อง (คลิกที่จุดกะพริบ)');
  console.log('🚪 เข้าสู่โหมดสำรวจห้อง');

  // หากคะแนน Day 1 ครบ 100/100 และยังไม่เคยแสดงป๊อปอัปฉลอง ให้แสดงทันที
  if (gameState.currentDay === 1 && gameState.flags.day1Completed && !gameState.flags.dayCompleteModalShown) {
    setTimeout(() => {
      showDayCompleteModal();
    }, 400);
  }
}

/**
 * ==========================================================================
 * ระบบ Security Score & Day Complete
 * ==========================================================================
 */

/**
 * เพิ่มคะแนนความปลอดภัยและอัปเดต UI
 */
function addScore(points) {
  gameState.score = Math.min(gameState.maxScore, gameState.score + points);
  updateScoreUI();

  console.log(`🛡️ ได้รับคะแนน +${points}! Security Score: ${gameState.score}/${gameState.maxScore}`);

  // ตรวจสอบเมื่อคะแนน Day 1 ครบ 100/100
  if (gameState.currentDay === 1 && gameState.score >= gameState.maxScore && !gameState.flags.day1Completed) {
    gameState.flags.day1Completed = true;
    scheduleDayCompletionCheck();
  }
}

/**
 * อัปเดตการแสดงผลแถบ Security Score และ Day Tracker ที่มุมขวาบน
 */
function updateScoreUI() {
  const scoreTextElem = document.getElementById('score-text');
  const scoreFillElem = document.getElementById('score-progress-fill');
  const dayTextElem = document.getElementById('day-text');

  if (scoreTextElem) {
    scoreTextElem.textContent = `Security Score: ${gameState.score}/${gameState.maxScore}`;
  }

  if (scoreFillElem) {
    const percentage = Math.round((gameState.score / gameState.maxScore) * 100);
    scoreFillElem.style.width = `${percentage}%`;
  }

  if (dayTextElem) {
    dayTextElem.textContent = `Day ${gameState.currentDay}`;
  }
}

/**
 * ตรวจสอบความพร้อมและเปิดป๊อปอัปภารกิจ Day 1 สำเร็จ
 */
function scheduleDayCompletionCheck() {
  setTimeout(() => {
    const routerModal = document.getElementById('router-modal-backdrop');
    const phishingModal = document.getElementById('phishing-modal-backdrop');
    const dialogueBox = document.getElementById('dialogue-box');

    const isRouterOpen = routerModal && !routerModal.classList.contains('hidden');
    const isPhishingOpen = phishingModal && !phishingModal.classList.contains('hidden');
    const isDialogueOpen = dialogueBox && !dialogueBox.classList.contains('hidden');

    // ถ้าไม่มีหน้าต่างใดเปิดค้างอยู่ ให้เปิดป๊อปอัปฉลองทันที
    if (!isRouterOpen && !isPhishingOpen && !isDialogueOpen) {
      showDayCompleteModal();
    }
  }, 600);
}

/**
 * เล่นเสียงกระดิ่ง (Bell Chime Effect) ด้วย Web Audio API
 */
function playBellChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // เสียงกระดิ่งใสกังวาน 4 โน้ต (C6, E6, G6, C7)
    const chimeFrequencies = [1046.50, 1318.51, 1567.98, 2093.00];
    chimeFrequencies.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);

      const startTime = audioCtx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.45);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

/**
 * เริ่มต้นระบบปุ่มของ Day Complete Modal
 */
function initDayCompleteModal() {
  const btnNextDay = document.getElementById('btn-next-day');

  if (btnNextDay) {
    btnNextDay.addEventListener('click', (e) => {
      e.stopPropagation();
      transitionToDay2();
    });
  }
}

/**
 * ==========================================================================
 * ระบบเปลี่ยนผ่านสู่วันถัดไป (Transition to Day 2)
 * ==========================================================================
 */
function transitionToDay2() {
  console.log('🌅 Starting Transition to Day 2...');

  // 1. ปิดหน้าต่าง Day Complete Modal
  const dayCompleteBackdrop = document.getElementById('day-complete-backdrop');
  if (dayCompleteBackdrop) {
    dayCompleteBackdrop.classList.add('hidden');
    dayCompleteBackdrop.setAttribute('aria-hidden', 'true');
  }

  // 2. แสดงเอฟเฟกต์หน้าจอดับมืด (Fade to Black) พร้อมข้อความกลางจอ
  const fadeOverlay = document.getElementById('screen-fade-transition');
  const fadeText = document.getElementById('fade-day-text');
  if (fadeText) fadeText.textContent = 'ช่วงบ่ายวันถัดไป... (Day 2)';
  if (fadeOverlay) {
    fadeOverlay.classList.remove('hidden');
    fadeOverlay.setAttribute('aria-hidden', 'false');
  }

  // 3. เล่นเสียงกระดิ่ง (Bell Chime Effect)
  playBellChimeSound();

  // 4. ทำฉาก Fade-out มืดลง 1.5 วินาที (1500ms) แล้วอัปเดตสถานะเกม
  setTimeout(() => {
    // รีเซ็ตคะแนนและเปลี่ยนหัวแถบเป็น Day 2
    gameState.currentDay = 2;
    gameState.score = 0;
    gameState.maxScore = 100;
    gameState.mode = 'intro_day2';
    gameState.flags.smsCurrentCase = 1;
    gameState.flags.smsCase1Completed = false;
    gameState.flags.smsCase2Completed = false;
    gameState.flags.smsQuestCompleted = false;
    gameState.flags.smsScoreAwarded = false;
    gameState.flags.usbQuestCompleted = false;
    gameState.flags.usbScoreAwarded = false;
    gameState.flags.cameraQuestCompleted = false;
    gameState.flags.cameraScoreAwarded = false;
    gameState.flags.day2Completed = false;

    // เปลี่ยนแถบมุมขวาบนเป็น 'Day 2' และ Security Score: 0/100
    const dayTextElem = document.getElementById('day-text');
    if (dayTextElem) dayTextElem.textContent = 'Day 2';
    updateScoreUI();

    // เปลี่ยนแสงของห้อง (ปรับโทนสีพื้นหลังหรือหน้าต่าง) ให้เป็นช่วงบ่าย/เย็น
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.classList.add('afternoon-lighting');
    }

    // ปิด Hotspot เดิมของ Day 1 (คอมพิวเตอร์ และ เราเตอร์)
    const compBtn = document.getElementById('hotspot-computer');
    const routerBtn = document.getElementById('hotspot-router');
    if (compBtn) compBtn.classList.add('hidden');
    if (routerBtn) routerBtn.classList.add('hidden');

    // เปิด Hotspot ใหม่ของ Day 2 (สมาร์ตโฟน, Flash Drive, และ กล้องวงจรปิด)
    const phoneBtn = document.getElementById('hotspot-phone');
    const usbBtn = document.getElementById('hotspot-usb');
    const cameraBtn = document.getElementById('hotspot-camera');
    if (phoneBtn) phoneBtn.classList.remove('hidden');
    if (usbBtn) usbBtn.classList.remove('hidden');
    if (cameraBtn) cameraBtn.classList.remove('hidden');

    // วาดฉากใหม่อัปเดตแสงช่วงบ่าย
    const canvas = document.getElementById('game-canvas');
    if (canvas) renderRoomScene(canvas);

    // อัปเดตสมุดภารกิจเป็นเควสต์ของ Day 2
    updateQuestLogUI();

    // ค่อยๆ จางหน้าจอดำออก (Fade In)
    setTimeout(() => {
      if (fadeOverlay) {
        fadeOverlay.classList.add('hidden');
        fadeOverlay.setAttribute('aria-hidden', 'true');
      }

      // เริ่มต้นบทสนทนาใหม่ของ Day 2
      startDay2Dialogue();
    }, 450);

  }, 1500);
}

/**
 * เริ่มต้นบทสนทนาใหม่สำหรับ Day 2
 */
function startDay2Dialogue() {
  gameState.mode = 'intro_day2';
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '📱',
      text: 'ช่วงบ่ายวันนี้มีเรื่องผิดปกติเกิดขึ้นหลายอย่าง! ทั้งข้อความ SMS แปลกๆ ในมือถือ มีแฟลชไดรฟ์ปริศนาตกอยู่บนพื้น และกล้องวงจรปิดก็แจ้งเตือนความปลอดภัย'
    },
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '🔍',
      text: 'ลองไปตรวจสอบสมาร์ตโฟนบนโต๊ะ แฟลชไดรฟ์บนพื้น และกล้องวงจรปิดที่ชั้นวางกันเถอะ!'
    }
  ];
  gameState.dialogueIndex = 0;

  updateStatusIndicator('🔍 โหมดสำรวจห้อง (Day 2)');
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * แสดงป๊อปอัปแจ้งเตือนภารกิจ Day 1 สำเร็จ
 */
function showDayCompleteModal() {
  if (gameState.flags.dayCompleteModalShown) return;
  gameState.flags.dayCompleteModalShown = true;
  gameState.mode = 'day_complete';

  const modalBackdrop = document.getElementById('day-complete-backdrop');
  const scoreValueElem = document.getElementById('day-complete-score-value');

  if (scoreValueElem) {
    scoreValueElem.textContent = `${gameState.score}/${gameState.maxScore} 🛡️`;
  }

  if (modalBackdrop) {
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }

  updateStatusIndicator('🎉 ภารกิจ Day 1 สำเร็จเรียบร้อย!');
  console.log('🏆 Triggered Day 1 Completed Modal!');
}

/**
 * ==========================================================================
 * ระบบสมุดบันทึกภารกิจ (Quest Log System)
 * ==========================================================================
 */
function initQuestLog() {
  const questBtn = document.getElementById('quest-log-btn');
  const closeBtn = document.getElementById('quest-log-close-btn');
  const btnCloseQuest = document.getElementById('btn-close-quest');
  const backdrop = document.getElementById('quest-log-backdrop');

  if (questBtn) {
    questBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuestLogModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeQuestLogModal();
    });
  }

  if (btnCloseQuest) {
    btnCloseQuest.addEventListener('click', (e) => {
      e.stopPropagation();
      closeQuestLogModal();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeQuestLogModal();
      }
    });
  }

  updateQuestLogUI();
}

/**
 * เปิดหน้าต่างสมุดบันทึกภารกิจ
 */
function openQuestLogModal() {
  if (gameState.mode !== 'quest_log') {
    gameState.previousMode = gameState.mode;
  }
  gameState.mode = 'quest_log';

  // อัปเดตรายการภารกิจ
  updateQuestLogUI();

  const backdrop = document.getElementById('quest-log-backdrop');
  if (backdrop) {
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
  }
  console.log('📓 เปิดสมุดบันทึกภารกิจ');
}

/**
 * ปิดหน้าต่างสมุดบันทึกภารกิจ
 */
function closeQuestLogModal() {
  const backdrop = document.getElementById('quest-log-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  // คืนค่าโหมดเดิม
  gameState.mode = gameState.previousMode || 'explore';
}

/**
 * อัปเดตสถานะของรายการภารกิจในสมุดบันทึก
 */
function updateQuestLogUI() {
  const subtitleElem = document.getElementById('quest-log-subtitle');
  const progressTextElem = document.getElementById('quest-progress-count');
  const badgeDot = document.getElementById('quest-badge-dot');

  const itemRouter = document.getElementById('quest-item-router');
  const checkRouter = document.getElementById('quest-check-router');
  const statusRouter = document.getElementById('quest-status-router');

  const itemPhishing = document.getElementById('quest-item-phishing');
  const checkPhishing = document.getElementById('quest-check-phishing');
  const statusPhishing = document.getElementById('quest-status-phishing');

  const itemSMS = document.getElementById('quest-item-sms');
  const checkSMS = document.getElementById('quest-check-sms');
  const statusSMS = document.getElementById('quest-status-sms');

  const itemUsb = document.getElementById('quest-item-usb');
  const checkUsb = document.getElementById('quest-check-usb');
  const statusUsb = document.getElementById('quest-status-usb');

  const itemCamera = document.getElementById('quest-item-camera');
  const checkCamera = document.getElementById('quest-check-camera');
  const statusCamera = document.getElementById('quest-status-camera');

  if (gameState.currentDay === 1) {
    if (subtitleElem) subtitleElem.textContent = 'รายการสิ่งที่ต้องทำใน Day 1';
    if (itemRouter) itemRouter.classList.remove('hidden');
    if (itemPhishing) itemPhishing.classList.remove('hidden');
    if (itemSMS) itemSMS.classList.add('hidden');
    if (itemUsb) itemUsb.classList.add('hidden');
    if (itemCamera) itemCamera.classList.add('hidden');

    const isRouterDone = Boolean(gameState.flags.routerScoreAwarded);
    const isPhishingDone = Boolean(gameState.flags.phishingQuestCompleted);

    // 1. ภารกิจเราเตอร์
    if (itemRouter && checkRouter && statusRouter) {
      if (isRouterDone) {
        itemRouter.classList.add('completed');
        checkRouter.textContent = '[✓]';
        statusRouter.textContent = 'สำเร็จแล้ว ✅';
      } else {
        itemRouter.classList.remove('completed');
        checkRouter.textContent = '[ ]';
        statusRouter.textContent = 'ยังไม่สำเร็จ';
      }
    }

    // 2. ภารกิจ Phishing
    if (itemPhishing && checkPhishing && statusPhishing) {
      if (isPhishingDone) {
        itemPhishing.classList.add('completed');
        checkPhishing.textContent = '[✓]';
        statusPhishing.textContent = 'สำเร็จแล้ว ✅';
      } else {
        itemPhishing.classList.remove('completed');
        checkPhishing.textContent = '[ ]';
        statusPhishing.textContent = 'ยังไม่สำเร็จ';
      }
    }

    // ความคืบหน้ารวม Day 1
    const completedCount = (isRouterDone ? 1 : 0) + (isPhishingDone ? 1 : 0);
    if (progressTextElem) {
      progressTextElem.textContent = `สำเร็จ ${completedCount}/2 ภารกิจ`;
    }

    if (badgeDot) {
      if (completedCount === 2) {
        badgeDot.classList.add('all-done');
      } else {
        badgeDot.classList.remove('all-done');
      }
    }
  } else {
    // ภารกิจ Day 2
    if (subtitleElem) subtitleElem.textContent = 'รายการสิ่งที่ต้องทำใน Day 2';
    if (itemRouter) itemRouter.classList.add('hidden');
    if (itemPhishing) itemPhishing.classList.add('hidden');
    if (itemSMS) itemSMS.classList.remove('hidden');
    if (itemUsb) itemUsb.classList.remove('hidden');
    if (itemCamera) itemCamera.classList.remove('hidden');

    const isSMSDone = Boolean(gameState.flags.smsQuestCompleted);
    const isUsbDone = Boolean(gameState.flags.usbQuestCompleted);
    const isCameraDone = Boolean(gameState.flags.cameraQuestCompleted);

    // 3. ภารกิจ SMS Scam
    if (itemSMS && checkSMS && statusSMS) {
      if (isSMSDone) {
        itemSMS.classList.add('completed');
        checkSMS.textContent = '[✓]';
        statusSMS.textContent = 'สำเร็จแล้ว ✅';
      } else {
        itemSMS.classList.remove('completed');
        checkSMS.textContent = '[ ]';
        statusSMS.textContent = 'ยังไม่สำเร็จ';
      }
    }

    // 4. ภารกิจ USB Drop Attack
    if (itemUsb && checkUsb && statusUsb) {
      if (isUsbDone) {
        itemUsb.classList.add('completed');
        checkUsb.textContent = '[✓]';
        statusUsb.textContent = 'สำเร็จแล้ว ✅';
      } else {
        itemUsb.classList.remove('completed');
        checkUsb.textContent = '[ ]';
        statusUsb.textContent = 'ยังไม่สำเร็จ';
      }
    }

    // 5. ภารกิจ กล้องวงจรปิด IoT
    if (itemCamera && checkCamera && statusCamera) {
      if (isCameraDone) {
        itemCamera.classList.add('completed');
        checkCamera.textContent = '[✓]';
        statusCamera.textContent = 'สำเร็จแล้ว ✅';
      } else {
        itemCamera.classList.remove('completed');
        checkCamera.textContent = '[ ]';
        statusCamera.textContent = 'ยังไม่สำเร็จ';
      }
    }

    // ความคืบหน้า Day 2
    const completedCount = (isSMSDone ? 1 : 0) + (isUsbDone ? 1 : 0) + (isCameraDone ? 1 : 0);
    if (progressTextElem) {
      progressTextElem.textContent = `สำเร็จ ${completedCount}/3 ภารกิจ`;
    }

    if (badgeDot) {
      if (completedCount === 3) {
        badgeDot.classList.add('all-done');
      } else {
        badgeDot.classList.remove('all-done');
      }
    }
  }
}

/**
 * ==========================================================================
 * ระบบมินิเกม Admin Dashboard ของเราเตอร์ (Router Security Mini-Game)
 * ==========================================================================
 */
function initRouterModal() {
  const modalBackdrop = document.getElementById('router-modal-backdrop');
  const closeBtn = document.getElementById('router-modal-close-btn');
  const btnChoiceA = document.getElementById('btn-router-choice-a');
  const btnChoiceB = document.getElementById('btn-router-choice-b');
  const btnChoiceC = document.getElementById('btn-router-choice-c');
  const retryBtn = document.getElementById('router-retry-btn');

  // ปุ่มกากบาทสีแดงปิดหน้าต่าง
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRouterModal();
    });
  }

  // คลิกพื้นที่นอกหน้าต่าง (Backdrop) เพื่อปิด
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeRouterModal();
      }
    });
  }

  // ชอยส์ A: 12345678 (ผิด)
  if (btnChoiceA) {
    btnChoiceA.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRouterChoice('A');
    });
  }

  // ชอยส์ B: password2026 (ผิด)
  if (btnChoiceB) {
    btnChoiceB.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRouterChoice('B');
    });
  }

  // ชอยส์ C: H0m3@Net_Sec!99 (ถูก - ปลอดภัยสูง)
  if (btnChoiceC) {
    btnChoiceC.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRouterChoice('C');
    });
  }

  // ปุ่มลองใหม่ในกล่องเตือน
  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const feedbackBox = document.getElementById('router-feedback-box');
      if (feedbackBox) {
        feedbackBox.classList.add('hidden');
      }
    });
  }
}

/**
 * เปิด Modal หน้า Admin Dashboard เราเตอร์ (192.168.1.1)
 */
function openRouterModal() {
  gameState.flags.hasExploredRouter = true;
  gameState.mode = 'minigame';

  // ซ่อนกล่องบทสนทนาด้านล่าง
  closeDialogueBox();

  updateStatusIndicator('🌐 กำลังตั้งค่าเราเตอร์ Wi-Fi (192.168.1.1)');

  const modalBackdrop = document.getElementById('router-modal-backdrop');
  const routerCard = document.getElementById('router-modal-card');
  const statusCard = document.getElementById('router-status-card');
  const statusTitle = document.getElementById('router-status-title');
  const statusIcon = document.getElementById('router-status-icon');
  const meterFill = document.getElementById('router-meter-fill');
  const meterLabel = document.getElementById('router-meter-label');
  const passwordPreview = document.getElementById('router-password-preview');
  const feedbackBox = document.getElementById('router-feedback-box');
  const successOverlay = document.getElementById('router-success-overlay');

  if (routerCard) {
    routerCard.classList.remove('shake-animation');
  }
  if (feedbackBox) {
    feedbackBox.className = 'feedback-box hidden';
  }
  if (successOverlay) {
    successOverlay.classList.add('hidden');
    successOverlay.setAttribute('aria-hidden', 'true');
  }

  if (gameState.flags.routerScoreAwarded) {
    // กรณีเคยตั้งรหัสผ่านสำเร็จแล้ว
    if (statusCard) statusCard.classList.add('secure');
    if (statusIcon) statusIcon.textContent = '🛡️';
    if (statusTitle) statusTitle.textContent = 'สถานะความปลอดภัย: สูง (100% ปลอดภัย)';
    if (meterFill) {
      meterFill.className = 'router-meter-fill high';
      meterFill.style.width = '100%';
    }
    if (meterLabel) meterLabel.textContent = 'ระดับความปลอดภัย: 100% (ปลอดภัยสูง)';
    if (passwordPreview) {
      passwordPreview.textContent = 'P@ssw0rd_Sec2026!';
      passwordPreview.className = 'input-display strong';
    }
  } else {
    // กรณียังไม่ได้ตั้งรหัสผ่านใหม่
    if (statusCard) statusCard.classList.remove('secure');
    if (statusIcon) statusIcon.textContent = '⚠️';
    if (statusTitle) statusTitle.textContent = 'สถานะ: ใช้รหัสผ่านเริ่มต้น (admin/admin) เสี่ยงต่อการถูกแฮก';
    if (meterFill) {
      meterFill.className = 'router-meter-fill low';
      meterFill.style.width = '20%';
    }
    if (meterLabel) meterLabel.textContent = 'ระดับความปลอดภัย: 20% (เสี่ยงสูง)';
    if (passwordPreview) {
      passwordPreview.textContent = 'admin (รหัสผ่านเริ่มต้นโรงงาน)';
      passwordPreview.className = 'input-display';
    }
  }

  if (modalBackdrop) {
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

/**
 * ปิด Modal หน้าต่างเราเตอร์
 */
function closeRouterModal() {
  const modalBackdrop = document.getElementById('router-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }

  gameState.mode = 'explore';

  if (gameState.flags.routerScoreAwarded) {
    updateStatusIndicator('✅ ตั้งค่าเราเตอร์ปลอดภัยแล้ว!');
    const routerBtn = document.getElementById('hotspot-router');
    if (routerBtn) {
      const tooltip = routerBtn.querySelector('.hotspot-tooltip');
      if (tooltip) tooltip.textContent = 'ตรวจสอบเราเตอร์ Wi-Fi (ตรวจสอบแล้ว ✅)';
    }
  } else {
    updateStatusIndicator('🔍 โหมดสำรวจห้อง (คลิกที่จุดกะพริบ)');
  }

  // หากคะแนนครบ 100/100 และยังไม่เคยแสดงป๊อปอัปฉลอง ให้แสดงทันที
  if (gameState.flags.day1Completed && !gameState.flags.dayCompleteModalShown) {
    setTimeout(() => {
      showDayCompleteModal();
    }, 400);
  }
}

/**
 * จัดการตัวเลือกการตั้งรหัสผ่านเราเตอร์ (ชอยส์ A, B, C)
 */
function handleRouterChoice(choice) {
  const routerCard = document.getElementById('router-modal-card');
  const statusCard = document.getElementById('router-status-card');
  const statusTitle = document.getElementById('router-status-title');
  const statusIcon = document.getElementById('router-status-icon');
  const meterFill = document.getElementById('router-meter-fill');
  const meterLabel = document.getElementById('router-meter-label');
  const passwordPreview = document.getElementById('router-password-preview');
  const feedbackBox = document.getElementById('router-feedback-box');
  const feedbackTitle = document.getElementById('router-feedback-title');
  const feedbackMsg = document.getElementById('router-feedback-message');
  const successOverlay = document.getElementById('router-success-overlay');

  if (choice === 'B') {
    // เลือกข้อ B (รหัสผ่านปลอดภัยสูง P@ssw0rd_Sec2026!): ถูกต้อง!
    if (passwordPreview) {
      passwordPreview.textContent = 'P@ssw0rd_Sec2026!';
      passwordPreview.className = 'input-display strong';
    }

    // แถบความปลอดภัยเปลี่ยนเป็นสีเขียว 100%
    if (statusCard) statusCard.classList.add('secure');
    if (statusIcon) statusIcon.textContent = '🛡️';
    if (statusTitle) statusTitle.textContent = 'สถานะความปลอดภัย: สูง (100% ปลอดภัย)';
    if (meterFill) {
      meterFill.className = 'router-meter-fill high';
      meterFill.style.width = '100%';
    }
    if (meterLabel) meterLabel.textContent = 'ระดับความปลอดภัย: 100% (ปลอดภัยสูง)';

    // แสดงแอนิเมชันติ๊กถูกสีเขียว
    if (successOverlay) {
      successOverlay.classList.remove('hidden');
      successOverlay.setAttribute('aria-hidden', 'false');
    }
    if (feedbackBox) feedbackBox.classList.add('hidden');

    // เพิ่ม Security Score +50
    if (!gameState.flags.routerScoreAwarded) {
      gameState.flags.routerScoreAwarded = true;
      addScore(50);
      updateQuestLogUI();
    }

    // ซ่อน Hotspot เราเตอร์ Wi-Fi เมื่อทำสำเร็จ
    const routerBtn = document.getElementById('hotspot-router');
    if (routerBtn) {
      routerBtn.classList.add('hidden');
    }

    console.log('📡 Router Password Updated Successfully! Score:', gameState.score);

    // ปิดหน้าต่างหลังแสดงติ๊กถูก 750ms และให้ตัวละครพูดสรุป
    setTimeout(() => {
      closeRouterModal();
      triggerRouterSuccessDialogue();
    }, 750);
  } else {
    // เลือกข้อ A: เตือนว่า 'รหัสผ่านง่ายเกินไป เสี่ยงต่อการโดน Brute Force' ให้เลือกใหม่
    gameState.mistakesCount++;
    console.log(`⚠️ Weak router password selected (${choice})! Total mistakes:`, gameState.mistakesCount);

    if (passwordPreview) {
      passwordPreview.textContent = '12345678';
      passwordPreview.className = 'input-display';
    }

    // หน้าจอสั่นเบาๆ (Screen Shake)
    if (routerCard) {
      routerCard.classList.remove('shake-animation');
      void routerCard.offsetWidth;
      routerCard.classList.add('shake-animation');
    }

    // กล่องข้อความแจ้งเตือนสีแดง
    if (feedbackBox && feedbackTitle && feedbackMsg) {
      feedbackTitle.textContent = 'รหัสผ่านง่ายเกินไป เสี่ยงต่อการโดน Brute Force';
      feedbackMsg.textContent = 'รหัสผ่านตัวเลขเรียง 8 หลักถูกคาดเดาและเจาะระบบได้ในเสี้ยววินาที กรุณาเลือกรหัสผ่านที่มีความซับซ้อนสูง';
      feedbackBox.className = 'feedback-box danger';
      feedbackBox.classList.remove('hidden');
    }
  }
}

/**
 * แสดงกล่องข้อความเมื่อตั้งรหัสผ่านเราเตอร์สำเร็จ
 */
function triggerRouterSuccessDialogue() {
  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '🧑‍💻',
      text: 'เปลี่ยนรหัสผ่านที่ซับซ้อนแล้ว ค่อยโล่งใจหน่อย'
    }
  ];

  openDialogueBox();
  showCurrentDialogue();
}

/**
 * ==========================================================================
 * ระบบมินิเกมตรวจจับอีเมลหลอกลวง (Phishing Detection Mini-Game)
 * ==========================================================================
 */
function initPhishingModal() {
  const modalBackdrop = document.getElementById('phishing-modal-backdrop');
  const closeBtn = document.getElementById('email-modal-close-btn');
  const btnChoiceA = document.getElementById('btn-choice-a');
  const btnChoiceB = document.getElementById('btn-choice-b');
  const previewLink = document.getElementById('email-preview-link');
  const feedbackCloseBtn = document.getElementById('feedback-close-btn');

  // ปิดหน้าต่างด้วยปุ่มกากบาทสีแดงบนหัวหน้าต่าง
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closePhishingModal();
    });
  }

  // คลิกพื้นที่นอกหน้าต่าง (Backdrop) เพื่อปิด
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closePhishingModal();
      }
    });
  }

  // ปุ่มสีน้ำเงิน: 'คลิกลิงก์เพื่อกู้คืนบัญชี' (คำตอบผิด / โดนขโมยรหัสผ่าน)
  if (btnChoiceA) {
    btnChoiceA.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePhishingChoice('A');
    });
  }

  // ปุ่มสีแดง/ส้ม: 'ทำเครื่องหมายว่าเป็น Phishing และลบอีเมล' (คำตอบถูก)
  if (btnChoiceB) {
    btnChoiceB.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePhishingChoice('B');
    });
  }

  // ลิงก์ปุ่มกดในเนื้อหา: หากคลิกถือว่าโดนขโมยรหัสผ่านเช่นกัน
  if (previewLink) {
    previewLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handlePhishingChoice('A');
    });
  }

  // ปุ่มลองใหม่อีกครั้งในกล่องแจ้งเตือนสีแดง
  if (feedbackCloseBtn) {
    feedbackCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const feedbackBox = document.getElementById('phishing-feedback-box');
      if (feedbackBox) {
        feedbackBox.classList.add('hidden');
      }
    });
  }
}

/**
 * เปิด Modal มินิเกมหน้าจอคอมพิวเตอร์
 */
function openPhishingModal() {
  gameState.flags.hasExploredComputer = true;
  gameState.mode = 'minigame';

  // ซ่อนกล่องบทสนทนาด้านล่าง
  closeDialogueBox();

  updateStatusIndicator('🖥️ กำลังตรวจสอบอีเมลบนคอมพิวเตอร์');

  // รีเซ็ตการแสดงผลของ Modal
  const modalBackdrop = document.getElementById('phishing-modal-backdrop');
  const actionsArea = document.getElementById('email-actions-area');
  const feedbackBox = document.getElementById('phishing-feedback-box');
  const successOverlay = document.getElementById('phishing-success-overlay');
  const emailCard = document.getElementById('email-modal-card');

  if (emailCard) {
    emailCard.classList.remove('shake-animation');
  }
  if (feedbackBox) {
    feedbackBox.className = 'feedback-box hidden';
  }
  if (successOverlay) {
    successOverlay.classList.add('hidden');
    successOverlay.setAttribute('aria-hidden', 'true');
  }
  if (actionsArea) {
    actionsArea.style.display = 'grid';
  }

  if (modalBackdrop) {
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

/**
 * ปิด Modal มินิเกมและกลับสู่การสำรวจ
 */
function closePhishingModal() {
  const modalBackdrop = document.getElementById('phishing-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }

  gameState.mode = 'explore';

  if (gameState.flags.phishingQuestCompleted) {
    updateStatusIndicator('✅ ตรวจสอบอีเมลสำเร็จแล้ว!');
    
    // อัปเดตไอคอนของ Hotspot คอมพิวเตอร์เพื่อบอกว่าเควสต์สำเร็จแล้ว
    const compHotspot = document.getElementById('hotspot-computer');
    if (compHotspot) {
      const tooltip = compHotspot.querySelector('.hotspot-tooltip');
      if (tooltip) tooltip.textContent = 'ตรวจสอบโต๊ะทำงาน (ตรวจสอบแล้ว ✅)';
    }
  } else {
    updateStatusIndicator('🔍 โหมดสำรวจห้อง (คลิกที่จุดกะพริบ)');
  }

  // หากคะแนนครบ 100/100 และยังไม่เคยแสดงป๊อปอัปฉลอง ให้แสดงทันที
  if (gameState.flags.day1Completed && !gameState.flags.dayCompleteModalShown) {
    setTimeout(() => {
      showDayCompleteModal();
    }, 400);
  }
}

/**
 * ตรวจคำตอบการตัดสินใจในอีเมล
 */
function handlePhishingChoice(choice) {
  const feedbackBox = document.getElementById('phishing-feedback-box');
  const iconElem = document.getElementById('feedback-icon');
  const titleElem = document.getElementById('feedback-title');
  const msgElem = document.getElementById('feedback-message');
  const actionsArea = document.getElementById('email-actions-area');
  const feedbackCloseBtn = document.getElementById('feedback-close-btn');

  if (choice === 'B') {
    // เลือกปุ่ม Phishing: ถูกต้อง! (+50 คะแนน)
    gameState.flags.phishingQuestCompleted = true;
    if (!gameState.flags.phishingScoreAwarded) {
      gameState.flags.phishingScoreAwarded = true;
      addScore(50);
    }
    updateQuestLogUI();

    // 1. แสดงแอนิเมชันติ๊กถูกสีเขียว (Green checkmark animation)
    const successOverlay = document.getElementById('phishing-success-overlay');
    if (successOverlay) {
      successOverlay.classList.remove('hidden');
      successOverlay.setAttribute('aria-hidden', 'false');
    }

    if (actionsArea) actionsArea.style.display = 'none';
    if (feedbackBox) feedbackBox.classList.add('hidden');

    // เปลี่ยนไอคอน Hotspot จอคอมเป็นเครื่องหมายติ๊กถูกสีเขียว
    const compBtn = document.getElementById('hotspot-computer');
    if (compBtn) {
      compBtn.classList.add('completed');
      const core = compBtn.querySelector('.hotspot-core');
      if (core) core.textContent = '✅';
      const tooltip = compBtn.querySelector('.hotspot-tooltip');
      if (tooltip) tooltip.textContent = 'ตรวจสอบหน้าจอคอมพิวเตอร์ (ตรวจสอบแล้ว ✅)';
    }

    console.log('🏆 Phishing Quest Completed Successfully! Score:', gameState.score);

    // 2. ปิดหน้าต่างอีเมลหลังแสดงติ๊กถูก 750ms และเปิดกล่องข้อความพูดสรุป
    setTimeout(() => {
      closePhishingModal();
      triggerPhishingSuccessDialogue();
    }, 750);
  } else {
    // เลือกปุ่มคลิกลิงก์: ผิด / โดนขโมยรหัสผ่าน
    gameState.mistakesCount++;
    console.log('⚠️ Made a mistake in Phishing Email! Total mistakes:', gameState.mistakesCount);

    // 1. หน้าจอสั่นเบาๆ (Screen Shake Effect)
    const emailCard = document.getElementById('email-modal-card');
    if (emailCard) {
      emailCard.classList.remove('shake-animation');
      void emailCard.offsetWidth; // Force reflow
      emailCard.classList.add('shake-animation');
    }

    // 2. แจ้งเตือนสีแดง: 'อันตราย! คุณเผลอกดลิงก์ปลอม สังเกต URL ที่ไม่ใช่โดเมนทางการของธนาคาร'
    if (feedbackBox && iconElem && titleElem && msgElem) {
      feedbackBox.className = 'feedback-box danger';
      iconElem.textContent = '🚨';
      titleElem.textContent = 'อันตราย! คุณเผลอกดลิงก์ปลอม สังเกต URL ที่ไม่ใช่โดเมนทางการของธนาคาร';
      msgElem.textContent = 'ลิงก์ update-login-bank.fake เป็นเว็บไซต์ฟิชชิง ธนาคารจริงจะไม่มีการส่งลิงก์เพื่อให้กรอกข้อมูลฉุกเฉินในลักษณะนี้';

      if (feedbackCloseBtn) {
        feedbackCloseBtn.textContent = '🔄 ลองใหม่อีกครั้ง';
      }

      feedbackBox.classList.remove('hidden');
    }
  }
}

/**
 * แสดงกล่องข้อความเมื่อตรวจจับ Phishing สำเร็จ
 */
function triggerPhishingSuccessDialogue() {
  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '😊',
      text: 'ยอดเยี่ยม! คุณระบุอีเมลหลอกลวงได้ถูกต้อง'
    }
  ];

  openDialogueBox();
  showCurrentDialogue();
}

/**
 * ==========================================================================
 * ระบบมินิเกมตรวจจับ SMS Scam (SMS Scam Detection Mini-Game)
 * ==========================================================================
 */
/**
 * ==========================================================================
 * ระบบมินิเกมตรวจจับ SMS Scam (SMS Scam Detection Mini-Game: 2 Cases)
 * ==========================================================================
 */

// ข้อมูลสถานการณ์ SMS หลอกลวงทั้ง 2 เคส
const smsScenarios = [
  {
    caseIndex: 1,
    avatar: '📦',
    name: 'Express-Delivery',
    phone: '+66 81-992-XXXX',
    pill: 'เคสที่ 1/2',
    date: 'วันนี้ 09:30 น.',
    text: 'พัสดุของคุณไม่สามารถจัดส่งได้เนื่องจากค้างชำระค่าธรรมเนียม 18 บาท คลิก <a href="#" class="sms-fake-link" id="sms-fake-link" onclick="return false;">bit.ly/express-track18</a>',
    dangerTitle: 'อันตราย! คุณเผลอกดลิงก์พัสดุปลอม',
    dangerMsg: 'มิจฉาชีพมักใช้ลิงก์ย่อ (bit.ly) หลอกให้กรอกข้อมูลบัตรเครดิตเพื่อดูดเงิน ขนส่งจริงจะไม่มีการส่ง SMS เรียกเก็บเงินค่าธรรมเนียมในลักษณะนี้เด็ดขาด',
    safeTitle: 'ถูกต้อง! บล็อก SMS พัสดุปลอมสำเร็จ',
    safeMsg: 'ยอดเยี่ยม! คุณสังเกตเห็นลิงก์ย่อน่าสงสัยและบล็อกเบอร์ทันที... แต่มีข้อความแปลกๆ อีกฉบับส่งเข้ามาพอดี!'
  },
  {
    caseIndex: 2,
    avatar: '💸',
    name: 'Easy-Cash-Loan',
    phone: '+66 94-811-XXXX',
    pill: 'เคสที่ 2/2',
    date: 'วันนี้ 13:15 น.',
    text: 'ยินดีด้วย! บัญชีของคุณได้รับอนุมัติวงเงินกู้ 50,000 บาท ดอกเบี้ย 0% ดาวน์โหลดแอปและกดรับสิทธิ์: <a href="#" class="sms-fake-link" id="sms-fake-link" onclick="return false;">http://loan-quick-cash.apk/download</a>',
    dangerTitle: 'อันตรายขั้นวิกฤต! เสี่ยงโดนแอปดูดเงิน (.apk)',
    dangerMsg: 'ไฟล์ .apk จากภายนอก Store มักเป็นมัลแวร์ประเภท Accessibility Service ที่สามารถดักจับรหัสผ่าน OTP และควบคุมหน้าจอเพื่อโอนเงินออกจากบัญชีของคุณได้ทันที!',
    safeTitle: 'ยอดเยี่ยมมาก! บล็อกแอปดูดเงินและ SMS หลอกลวงสำเร็จ',
    safeMsg: 'ถูกต้องที่สุด! สถาบันการเงินที่ถูกกฎหมายจะไม่มีการส่งลิงก์ดาวน์โหลดไฟล์ .apk ผ่านทาง SMS การบล็อกเบอร์และรายงาน Spam ช่วยปกป้องบัญชีได้อย่างปลอดภัย'
  }
];

function initSMSModal() {
  const modalBackdrop = document.getElementById('sms-modal-backdrop');
  const closeBtn = document.getElementById('sms-modal-close-btn');
  const btnDanger = document.getElementById('btn-sms-danger');
  const btnSafe = document.getElementById('btn-sms-safe');
  const feedbackCloseBtn = document.getElementById('sms-feedback-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSMSModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeSMSModal();
      }
    });
  }

  if (btnDanger) {
    btnDanger.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSMSChoice('danger');
    });
  }

  if (btnSafe) {
    btnSafe.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSMSChoice('safe');
    });
  }

  if (feedbackCloseBtn) {
    feedbackCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSMSFeedbackAction();
    });
  }
}

function renderSMSCase(caseNumber) {
  const scenario = smsScenarios[caseNumber - 1];
  if (!scenario) return;

  const avatar = document.getElementById('sms-contact-avatar');
  const title = document.getElementById('sms-window-title');
  const pill = document.getElementById('sms-case-pill');
  const phone = document.getElementById('sms-sender-phone');
  const datePill = document.getElementById('sms-date-pill');
  const msgText = document.getElementById('sms-message-text');
  const actionsArea = document.getElementById('sms-actions-area');
  const feedbackBox = document.getElementById('sms-feedback-box');
  const successOverlay = document.getElementById('sms-success-overlay');

  if (avatar) avatar.textContent = scenario.avatar;
  if (title) title.textContent = scenario.name;
  if (pill) pill.textContent = scenario.pill;
  if (phone) phone.textContent = scenario.phone;
  if (datePill) datePill.textContent = scenario.date;
  if (msgText) msgText.innerHTML = scenario.text;

  if (actionsArea) actionsArea.style.display = 'flex';
  if (feedbackBox) feedbackBox.className = 'feedback-box hidden';
  if (successOverlay) successOverlay.classList.add('hidden');

  const fakeLink = document.getElementById('sms-fake-link');
  if (fakeLink) {
    fakeLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleSMSChoice('danger');
    };
  }
}

function openSMSModal() {
  gameState.flags.hasExploredPhone = true;
  gameState.mode = 'minigame';
  closeDialogueBox();
  updateStatusIndicator('📱 กำลังตรวจสอบข้อความ SMS บนมือถือ');

  const currentCase = gameState.flags.smsCurrentCase || 1;
  renderSMSCase(currentCase);

  const modalBackdrop = document.getElementById('sms-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeSMSModal() {
  const modalBackdrop = document.getElementById('sms-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
  gameState.mode = 'explore';
  updateStatusIndicator('🔍 โหมดสำรวจห้อง (Day 2)');
}

function handleSMSChoice(choice) {
  const currentCase = gameState.flags.smsCurrentCase || 1;
  const scenario = smsScenarios[currentCase - 1];
  const feedbackBox = document.getElementById('sms-feedback-box');
  const iconElem = document.getElementById('sms-feedback-icon');
  const titleElem = document.getElementById('sms-feedback-title');
  const msgElem = document.getElementById('sms-feedback-message');
  const actionsArea = document.getElementById('sms-actions-area');
  const feedbackCloseBtn = document.getElementById('sms-feedback-close-btn');

  if (!feedbackBox || !iconElem || !titleElem || !msgElem) return;

  if (choice === 'safe') {
    if (currentCase === 1) {
      gameState.flags.smsCase1Completed = true;
      feedbackBox.className = 'feedback-box correct';
      iconElem.textContent = '🛡️';
      titleElem.textContent = scenario.safeTitle;
      msgElem.textContent = scenario.safeMsg;
      if (feedbackCloseBtn) feedbackCloseBtn.textContent = 'ไปต่อยังเคสที่ 2/2 ➔';
      if (actionsArea) actionsArea.style.display = 'none';
      feedbackBox.classList.remove('hidden');
    } else {
      // ผ่านทั้ง 2 เคส (+40 คะแนน)
      gameState.flags.smsCase2Completed = true;
      gameState.flags.smsQuestCompleted = true;
      if (!gameState.flags.smsScoreAwarded) {
        gameState.flags.smsScoreAwarded = true;
        addScore(40);
      }
      updateQuestLogUI();

      const successOverlay = document.getElementById('sms-success-overlay');
      if (successOverlay) successOverlay.classList.remove('hidden');
      if (actionsArea) actionsArea.style.display = 'none';
      if (feedbackBox) feedbackBox.classList.add('hidden');

      const phoneHotspot = document.getElementById('hotspot-phone');
      if (phoneHotspot) {
        phoneHotspot.classList.add('completed');
        const core = phoneHotspot.querySelector('.hotspot-core');
        if (core) core.textContent = '✅';
        const tooltip = phoneHotspot.querySelector('.hotspot-tooltip');
        if (tooltip) tooltip.textContent = 'ตรวจสอบสมาร์ตโฟนแล้ว (ปลอดภัย ✅)';
      }

      console.log('📱 SMS Scam Quest Completed! Score:', gameState.score);

      setTimeout(() => {
        closeSMSModal();
        triggerSMSSuccessDialogue();
        checkDay2Completion();
      }, 850);
    }
  } else {
    // ผิด: กดลิงก์
    gameState.mistakesCount++;
    console.log(`⚠️ Mistake on SMS Case ${currentCase}! Total mistakes:`, gameState.mistakesCount);
    feedbackBox.className = 'feedback-box danger';
    iconElem.textContent = '🚨';
    titleElem.textContent = scenario.dangerTitle;
    msgElem.textContent = scenario.dangerMsg;
    if (feedbackCloseBtn) feedbackCloseBtn.textContent = '🔄 ลองวิเคราะห์ใหม่อีกครั้ง';
    feedbackBox.classList.remove('hidden');
  }
}

function handleSMSFeedbackAction() {
  const feedbackBox = document.getElementById('sms-feedback-box');
  const feedbackCloseBtn = document.getElementById('sms-feedback-close-btn');

  if (feedbackCloseBtn && feedbackCloseBtn.textContent.includes('ไปต่อ')) {
    gameState.flags.smsCurrentCase = 2;
    renderSMSCase(2);
  } else {
    if (feedbackBox) feedbackBox.classList.add('hidden');
  }
}

function triggerSMSSuccessDialogue() {
  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '😊',
      text: 'ยอดเยี่ยมมาก! บล็อกเบอร์ SMS หลอกลวงและไม่หลงเชื่อแอปดูดเงิน .apk ปลอดภัยไปอีกขั้น!'
    }
  ];
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * ==========================================================================
 * ระบบมินิเกมตรวจจับ USB Drop Attack (Flash Drive บนพื้นห้อง)
 * ==========================================================================
 */
function initUsbModal() {
  const modalBackdrop = document.getElementById('usb-modal-backdrop');
  const closeBtn = document.getElementById('usb-modal-close-btn');
  const btnChoiceA = document.getElementById('btn-usb-choice-a');
  const btnChoiceB = document.getElementById('btn-usb-choice-b');
  const retryBtn = document.getElementById('usb-retry-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeUsbModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeUsbModal();
      }
    });
  }

  if (btnChoiceA) {
    btnChoiceA.addEventListener('click', (e) => {
      e.stopPropagation();
      handleUsbChoice('A');
    });
  }

  if (btnChoiceB) {
    btnChoiceB.addEventListener('click', (e) => {
      e.stopPropagation();
      handleUsbChoice('B');
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const feedbackBox = document.getElementById('usb-feedback-box');
      if (feedbackBox) feedbackBox.classList.add('hidden');
    });
  }
}

function openUsbModal() {
  gameState.flags.hasExploredUsb = true;
  gameState.mode = 'minigame';
  closeDialogueBox();
  updateStatusIndicator('💾 กำลังตรวจสอบแฟลชไดรฟ์ปริศนา');

  const modalBackdrop = document.getElementById('usb-modal-backdrop');
  const card = document.getElementById('usb-modal-card');
  const feedbackBox = document.getElementById('usb-feedback-box');
  const successOverlay = document.getElementById('usb-success-overlay');
  const choicesArea = document.getElementById('usb-choices-area');

  if (card) card.classList.remove('shake-animation');
  if (feedbackBox) feedbackBox.className = 'feedback-box hidden';
  if (successOverlay) successOverlay.classList.add('hidden');
  if (choicesArea) choicesArea.style.display = 'grid';

  if (modalBackdrop) {
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeUsbModal() {
  const modalBackdrop = document.getElementById('usb-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
  gameState.mode = 'explore';
  updateStatusIndicator('🔍 โหมดสำรวจห้อง (Day 2)');
}

function handleUsbChoice(choice) {
  const card = document.getElementById('usb-modal-card');
  const feedbackBox = document.getElementById('usb-feedback-box');
  const iconElem = document.getElementById('usb-feedback-icon');
  const titleElem = document.getElementById('usb-feedback-title');
  const msgElem = document.getElementById('usb-feedback-message');
  const successOverlay = document.getElementById('usb-success-overlay');
  const choicesArea = document.getElementById('usb-choices-area');

  if (choice === 'B') {
    // ถูกต้อง: อย่าเสียบเข้าคอมเด็ดขาด (+30 คะแนน)
    gameState.flags.usbQuestCompleted = true;
    if (!gameState.flags.usbScoreAwarded) {
      gameState.flags.usbScoreAwarded = true;
      addScore(30);
    }
    updateQuestLogUI();

    if (successOverlay) successOverlay.classList.remove('hidden');
    if (choicesArea) choicesArea.style.display = 'none';
    if (feedbackBox) feedbackBox.classList.add('hidden');

    const usbHotspot = document.getElementById('hotspot-usb');
    if (usbHotspot) {
      usbHotspot.classList.add('completed');
      const core = usbHotspot.querySelector('.hotspot-core');
      if (core) core.textContent = '✅';
      const tooltip = usbHotspot.querySelector('.hotspot-tooltip');
      if (tooltip) tooltip.textContent = 'ตรวจสอบแฟลชไดรฟ์แล้ว (ปลอดภัย ✅)';
    }

    console.log('💾 USB Drop Attack Handled! Score:', gameState.score);

    setTimeout(() => {
      closeUsbModal();
      triggerUsbSuccessDialogue();
      checkDay2Completion();
    }, 800);
  } else {
    // ผิด: นำไปเสียบคอม
    gameState.mistakesCount++;
    console.log('⚠️ Mistake on USB Drop Attack! Total mistakes:', gameState.mistakesCount);

    if (card) {
      card.classList.remove('shake-animation');
      void card.offsetWidth;
      card.classList.add('shake-animation');
    }

    if (feedbackBox && iconElem && titleElem && msgElem) {
      feedbackBox.className = 'feedback-box danger';
      iconElem.textContent = '🚨';
      titleElem.textContent = 'อันตรายร้ายแรง! คุณตกเป็นเหยื่อ USB Drop Attack';
      msgElem.textContent = 'แฮกเกอร์มักจงใจนำ Flash Drive ปลอม หรือ BadUSB ที่ดัดแปลงเป็น Keyboard Emulator มาวางทิ้งไว้ เมื่อเสียบเข้าคอมพิวเตอร์ เครื่องจะสั่งรันสคริปต์อัตโนมัติ ติดตั้ง Ransomware หรือขโมยรหัสผ่านทั้งหมดในทันที!';
      feedbackBox.classList.remove('hidden');
    }
  }
}

function triggerUsbSuccessDialogue() {
  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '😊',
      text: 'ตัดสินใจรอบคอบมาก! แฟลชไดรฟ์ที่ตกอยู่ตามพื้นอาจเป็น BadUSB หรือมีมัลแวร์แฝง ไม่ควรเสียบเข้าเครื่องเด็ดขาด'
    }
  ];
  openDialogueBox();
  showCurrentDialogue();
}

/**
 * ==========================================================================
 * ระบบมินิเกมตรวจจับความปลอดภัยกล้อง IoT (IP Camera)
 * ==========================================================================
 */
function initCameraModal() {
  const modalBackdrop = document.getElementById('camera-modal-backdrop');
  const closeBtn = document.getElementById('camera-modal-close-btn');
  const btnChoiceA = document.getElementById('btn-camera-choice-a');
  const btnChoiceB = document.getElementById('btn-camera-choice-b');
  const retryBtn = document.getElementById('camera-retry-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCameraModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeCameraModal();
      }
    });
  }

  if (btnChoiceA) {
    btnChoiceA.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCameraChoice('A');
    });
  }

  if (btnChoiceB) {
    btnChoiceB.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCameraChoice('B');
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const feedbackBox = document.getElementById('camera-feedback-box');
      if (feedbackBox) feedbackBox.classList.add('hidden');
    });
  }
}

function openCameraModal() {
  gameState.flags.hasExploredCamera = true;
  gameState.mode = 'minigame';
  closeDialogueBox();
  updateStatusIndicator('📹 กำลังจัดการกล้องวงจรปิด IoT');

  const modalBackdrop = document.getElementById('camera-modal-backdrop');
  const card = document.getElementById('camera-modal-card');
  const feedbackBox = document.getElementById('camera-feedback-box');
  const successOverlay = document.getElementById('camera-success-overlay');
  const choicesArea = document.getElementById('camera-choices-area');

  if (card) card.classList.remove('shake-animation');
  if (feedbackBox) feedbackBox.className = 'feedback-box hidden';
  if (successOverlay) successOverlay.classList.add('hidden');
  if (choicesArea) choicesArea.style.display = 'grid';

  // อัปเดตเวลาบนหน้าจอ CCTV
  const clock = document.getElementById('cctv-live-clock');
  if (clock) {
    const now = new Date();
    clock.textContent = now.toTimeString().split(' ')[0];
  }

  if (modalBackdrop) {
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeCameraModal() {
  const modalBackdrop = document.getElementById('camera-modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.classList.add('hidden');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
  gameState.mode = 'explore';
  updateStatusIndicator('🔍 โหมดสำรวจห้อง (Day 2)');
}

function handleCameraChoice(choice) {
  const card = document.getElementById('camera-modal-card');
  const statusCard = document.getElementById('camera-status-card');
  const statusIcon = document.getElementById('camera-status-icon');
  const statusTitle = document.getElementById('camera-status-title');
  const portStatus = document.getElementById('cctv-port-status');
  const fwStatus = document.getElementById('cctv-fw-status');
  const autoStatus = document.getElementById('cctv-auto-status');
  const feedbackBox = document.getElementById('camera-feedback-box');
  const iconElem = document.getElementById('camera-feedback-icon');
  const titleElem = document.getElementById('camera-feedback-title');
  const msgElem = document.getElementById('camera-feedback-message');
  const successOverlay = document.getElementById('camera-success-overlay');
  const choicesArea = document.getElementById('camera-choices-area');

  if (choice === 'B') {
    // ถูกต้อง: ปิด Default Port และเปิด Auto-Update (+30 คะแนน)
    gameState.flags.cameraQuestCompleted = true;
    if (!gameState.flags.cameraScoreAwarded) {
      gameState.flags.cameraScoreAwarded = true;
      addScore(30);
    }
    updateQuestLogUI();

    if (statusCard) statusCard.classList.add('secure');
    if (statusIcon) statusIcon.textContent = '🛡️';
    if (statusTitle) statusTitle.textContent = 'สถานะ: พอร์ตปลอดภัย และเปิดอัปเดต Firmware อัตโนมัติแล้ว';
    if (portStatus) { portStatus.textContent = 'ปิดการเข้าถึงภายนอกแล้ว (Secure ✅)'; portStatus.className = 'audit-val safe'; }
    if (fwStatus) { fwStatus.textContent = 'เวอร์ชันล่าสุด v2.4.0 (Secure ✅)'; fwStatus.className = 'audit-val safe'; }
    if (autoStatus) { autoStatus.textContent = 'เปิดใช้งานอัตโนมัติ (Enabled ✅)'; autoStatus.className = 'audit-val safe'; }

    if (successOverlay) successOverlay.classList.remove('hidden');
    if (choicesArea) choicesArea.style.display = 'none';
    if (feedbackBox) feedbackBox.classList.add('hidden');

    const cameraHotspot = document.getElementById('hotspot-camera');
    if (cameraHotspot) {
      cameraHotspot.classList.add('completed');
      const core = cameraHotspot.querySelector('.hotspot-core');
      if (core) core.textContent = '✅';
      const tooltip = cameraHotspot.querySelector('.hotspot-tooltip');
      if (tooltip) tooltip.textContent = 'ตรวจสอบกล้อง IoT แล้ว (ปลอดภัย ✅)';
    }

    console.log('📹 Camera Security Configured! Score:', gameState.score);

    setTimeout(() => {
      closeCameraModal();
      triggerCameraSuccessDialogue();
      checkDay2Completion();
    }, 800);
  } else {
    // ผิด: ใช้การตั้งค่าเดิม
    gameState.mistakesCount++;
    console.log('⚠️ Mistake on Camera Security! Total mistakes:', gameState.mistakesCount);

    if (card) {
      card.classList.remove('shake-animation');
      void card.offsetWidth;
      card.classList.add('shake-animation');
    }

    if (feedbackBox && iconElem && titleElem && msgElem) {
      feedbackBox.className = 'feedback-box danger';
      iconElem.textContent = '🚨';
      titleElem.textContent = 'อันตราย! พอร์ตเริ่มต้นและเฟิร์มแวร์เก่าเป็นเป้าหมายหลักของแฮกเกอร์';
      msgElem.textContent = 'กล้องวงจรปิดที่เปิดพอร์ต RTSP (554) สู่สาธารณะและไม่ได้อัปเดตเฟิร์มแวร์ มักถูกบอตเน็ตอย่าง Mirai สแกนเจาะเข้ามาดูภาพสดตลอด 24 ชั่วโมง หรือถูกยึดไปใช้เป็นฐานโจมตี DDoS เว็บไซต์อื่น!';
      feedbackBox.classList.remove('hidden');
    }
  }
}

function triggerCameraSuccessDialogue() {
  gameState.mode = 'inspect';
  gameState.dialogueIndex = 0;
  gameState.activeDialogueQueue = [
    {
      speaker: 'วิน (ตัวเอก)',
      avatar: '😊',
      text: 'ตั้งค่ากล้องวงจรปิดเรียบร้อย! ปิดพอร์ตภายนอกและเปิดอัปเดต Firmware แล้ว ป้องกัน Botnet แอบส่องภาพในบ้านได้แน่นอน'
    }
  ];
  openDialogueBox();
  showCurrentDialogue();
}

function checkDay2Completion() {
  const isAllDone = 
    Boolean(gameState.flags.smsQuestCompleted) && 
    Boolean(gameState.flags.usbQuestCompleted) && 
    Boolean(gameState.flags.cameraQuestCompleted);

  if (isAllDone && !gameState.flags.day2Completed) {
    gameState.flags.day2Completed = true;
    console.log('🎉 Day 2 All Quests Completed! Total Day 2 Score:', gameState.score);
    setTimeout(() => {
      showGameSummaryScreen();
    }, 700);
  }
}

/**
 * อัปเดตข้อความ Badge สถานะด้านบน
 */
function updateStatusIndicator(text) {
  const statusElem = document.getElementById('game-status-hint');
  if (statusElem) {
    statusElem.textContent = text;
  }
}

/**
 * ==========================================================================
 * ระบบสรุปผลเมื่อจบภารกิจทั้งหมด (Game Over / Certificate Screen)
 * ==========================================================================
 */
function initGameSummaryScreen() {
  const restartBtn = document.getElementById('btn-restart-game');
  if (restartBtn) {
    restartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      restartGame();
    });
  }
}

/**
 * แสดงหน้าต่างสรุปผลจบเกมเต็มจอ
 */
function showGameSummaryScreen() {
  gameState.mode = 'game_over';

  const summaryBackdrop = document.getElementById('game-summary-backdrop');
  const rankBadge = document.getElementById('cert-rank-badge');
  const rankLetter = document.getElementById('cert-rank-letter');
  const rankTitle = document.getElementById('cert-rank-title');
  const rankDesc = document.getElementById('cert-rank-desc');

  const threatsCountElem = document.getElementById('cert-threats-count');
  const safetyPercentElem = document.getElementById('cert-safety-percent');
  const mistakesCountElem = document.getElementById('cert-mistakes-count');

  // สถิติผลสรุป
  if (threatsCountElem) threatsCountElem.textContent = '5 / 5';
  if (safetyPercentElem) safetyPercentElem.textContent = '100%';
  if (mistakesCountElem) {
    mistakesCountElem.textContent = `${gameState.mistakesCount} ครั้ง`;
    mistakesCountElem.style.color = gameState.mistakesCount === 0 ? '#1a7f4c' : '#b8753d';
  }

  // ประเมินระดับ (Rating):
  // ถ้าทำถูกต้องทั้งหมด (mistakesCount === 0): ได้ระดับ 'S Rank - Cyber Guardian ผู้พิทักษ์บ้านปลอดภัย'
  // ถ้ามีตอบผิด: ได้ระดับ 'A Rank - ผู้ตรวจการไซเบอร์ฝึกหัด'
  if (gameState.mistakesCount === 0) {
    if (rankBadge) rankBadge.className = 'cert-rank-badge rank-s';
    if (rankLetter) rankLetter.textContent = 'S';
    if (rankTitle) {
      rankTitle.className = 'cert-rank-title';
      rankTitle.textContent = 'S Rank - Cyber Guardian ผู้พิทักษ์บ้านปลอดภัย';
    }
    if (rankDesc) {
      rankDesc.textContent = 'ยอดเยี่ยมไร้ที่ติ! ตัดสินใจถูกต้องแม่นยำทุกสถานการณ์ ปราศจากข้อผิดพลาด ปกป้องบ้านได้อย่างสมบูรณ์แบบ';
    }
  } else {
    if (rankBadge) rankBadge.className = 'cert-rank-badge rank-a';
    if (rankLetter) rankLetter.textContent = 'A';
    if (rankTitle) {
      rankTitle.className = 'cert-rank-title title-a';
      rankTitle.textContent = 'A Rank - ผู้ตรวจการไซเบอร์ฝึกหัด';
    }
    if (rankDesc) {
      rankDesc.textContent = `ทำได้ดีมาก! มีข้อผิดพลาด ${gameState.mistakesCount} ครั้ง แต่สามารถกอบกู้สถานการณ์และกำจัดภัยคุกคามจนบ้านปลอดภัยได้สำเร็จ`;
    }
  }

  if (summaryBackdrop) {
    summaryBackdrop.classList.remove('hidden');
    summaryBackdrop.setAttribute('aria-hidden', 'false');
  }

  updateStatusIndicator('🏆 ภารกิจทั้งหมดเสร็จสมบูรณ์!');
  console.log('🎓 Certificate Screen Displayed! Rating:', gameState.mistakesCount === 0 ? 'S Rank' : 'A Rank');
}

/**
 * รีเซ็ต State ทั้งหมดเพื่อเริ่มเล่นใหม่ที่ Day 1
 */
function restartGame() {
  console.log('🔄 Restarting Game back to Day 1...');

  // 1. ปิดหน้าต่างสรุปผล
  const summaryBackdrop = document.getElementById('game-summary-backdrop');
  if (summaryBackdrop) {
    summaryBackdrop.classList.add('hidden');
    summaryBackdrop.setAttribute('aria-hidden', 'true');
  }

  // ปิด Modal อื่นๆ ถ้ามี
  const routerBackdrop = document.getElementById('router-modal-backdrop');
  const phishingBackdrop = document.getElementById('phishing-modal-backdrop');
  const dayCompleteBackdrop = document.getElementById('day-complete-backdrop');
  const smsBackdrop = document.getElementById('sms-modal-backdrop');
  const usbBackdrop = document.getElementById('usb-modal-backdrop');
  const cameraBackdrop = document.getElementById('camera-modal-backdrop');
  const questBackdrop = document.getElementById('quest-log-backdrop');

  if (routerBackdrop) routerBackdrop.classList.add('hidden');
  if (phishingBackdrop) phishingBackdrop.classList.add('hidden');
  if (dayCompleteBackdrop) dayCompleteBackdrop.classList.add('hidden');
  if (smsBackdrop) smsBackdrop.classList.add('hidden');
  if (usbBackdrop) usbBackdrop.classList.add('hidden');
  if (cameraBackdrop) cameraBackdrop.classList.add('hidden');
  if (questBackdrop) questBackdrop.classList.add('hidden');

  // 2. รีเซ็ต State ทั้งหมด
  gameState.currentDay = 1;
  gameState.mode = 'intro';
  gameState.score = 0;
  gameState.maxScore = 100;
  gameState.mistakesCount = 0;
  gameState.flags = {
    hasExploredRouter: false,
    routerScoreAwarded: false,
    hasExploredComputer: false,
    phishingQuestCompleted: false,
    phishingScoreAwarded: false,
    day1Completed: false,
    dayCompleteModalShown: false,
    hasExploredPhone: false,
    smsCurrentCase: 1,
    smsCase1Completed: false,
    smsCase2Completed: false,
    smsQuestCompleted: false,
    smsScoreAwarded: false,
    hasExploredUsb: false,
    usbQuestCompleted: false,
    usbScoreAwarded: false,
    hasExploredCamera: false,
    cameraQuestCompleted: false,
    cameraScoreAwarded: false,
    day2Completed: false
  };
  gameState.dialogueIndex = 0;
  gameState.isTyping = false;

  // 3. รีเซ็ต Header UI
  const dayTextElem = document.getElementById('day-text');
  if (dayTextElem) dayTextElem.textContent = 'Day 1';
  updateScoreUI();

  // รีเซ็ตสถานะภายในของ Modals
  const routerStatusCard = document.getElementById('router-status-card');
  const routerStatusIcon = document.getElementById('router-status-icon');
  const routerStatusTitle = document.getElementById('router-status-title');
  const routerMeterFill = document.getElementById('router-meter-fill');
  const routerMeterLabel = document.getElementById('router-meter-label');
  const routerPasswordPreview = document.getElementById('router-password-preview');
  const routerFeedback = document.getElementById('router-feedback-box');
  const routerSuccess = document.getElementById('router-success-overlay');

  if (routerStatusCard) routerStatusCard.classList.remove('secure');
  if (routerStatusIcon) routerStatusIcon.textContent = '⚠️';
  if (routerStatusTitle) routerStatusTitle.textContent = 'สถานะ: ใช้รหัสผ่านเริ่มต้น (admin/admin) เสี่ยงต่อการถูกแฮก';
  if (routerMeterFill) {
    routerMeterFill.className = 'router-meter-fill low';
    routerMeterFill.style.width = '20%';
  }
  if (routerMeterLabel) routerMeterLabel.textContent = 'ระดับความปลอดภัย: 20% (เสี่ยงสูง)';
  if (routerPasswordPreview) {
    routerPasswordPreview.textContent = 'admin (รหัสผ่านเริ่มต้นโรงงาน)';
    routerPasswordPreview.className = 'input-display';
  }
  if (routerFeedback) routerFeedback.className = 'feedback-box hidden';
  if (routerSuccess) routerSuccess.classList.add('hidden');

  const phishingActions = document.getElementById('email-actions-area');
  const phishingFeedback = document.getElementById('phishing-feedback-box');
  if (phishingActions) phishingActions.style.display = 'grid';
  if (phishingFeedback) phishingFeedback.className = 'feedback-box hidden';

  const smsActions = document.getElementById('sms-actions-area');
  const smsFeedback = document.getElementById('sms-feedback-box');
  if (smsActions) smsActions.style.display = 'flex';
  if (smsFeedback) smsFeedback.className = 'feedback-box hidden';

  // รีเซ็ต Camera modal elements
  const cameraStatusCard = document.getElementById('camera-status-card');
  const cameraStatusIcon = document.getElementById('camera-status-icon');
  const cameraStatusTitle = document.getElementById('camera-status-title');
  const portStatus = document.getElementById('cctv-port-status');
  const fwStatus = document.getElementById('cctv-fw-status');
  const autoStatus = document.getElementById('cctv-auto-status');
  const cameraChoices = document.getElementById('camera-choices-area');
  const cameraFeedback = document.getElementById('camera-feedback-box');
  const cameraSuccess = document.getElementById('camera-success-overlay');

  if (cameraStatusCard) cameraStatusCard.classList.remove('secure');
  if (cameraStatusIcon) cameraStatusIcon.textContent = '⚠️';
  if (cameraStatusTitle) cameraStatusTitle.textContent = 'สถานะ: พอร์ตเริ่มต้น RTSP (554) เปิดสาธารณะ และเฟิร์มแวร์ยังไม่อัปเดต';
  if (portStatus) { portStatus.textContent = 'พอร์ต 554 (เปิดสู่สาธารณะ)'; portStatus.className = 'audit-val danger'; }
  if (fwStatus) { fwStatus.textContent = 'v1.0.2 (มีช่องโหว่ Botnet Mirai)'; fwStatus.className = 'audit-val warning'; }
  if (autoStatus) { autoStatus.textContent = 'ปิดการทำงาน (Disabled)'; autoStatus.className = 'audit-val danger'; }
  if (cameraChoices) cameraChoices.style.display = 'grid';
  if (cameraFeedback) cameraFeedback.className = 'feedback-box hidden';
  if (cameraSuccess) cameraSuccess.classList.add('hidden');

  // รีเซ็ต USB modal elements
  const usbChoices = document.getElementById('usb-choices-area');
  const usbFeedback = document.getElementById('usb-feedback-box');
  const usbSuccess = document.getElementById('usb-success-overlay');
  if (usbChoices) usbChoices.style.display = 'grid';
  if (usbFeedback) usbFeedback.className = 'feedback-box hidden';
  if (usbSuccess) usbSuccess.classList.add('hidden');

  // รีเซ็ตสถานะแอนิเมชันตัวละคร
  setPlayerTalkingAnimation(false);

  // 4. รีเซ็ต Hotspots
  const compBtn = document.getElementById('hotspot-computer');
  const routerBtn = document.getElementById('hotspot-router');
  const phoneBtn = document.getElementById('hotspot-phone');
  const usbBtn = document.getElementById('hotspot-usb');
  const cameraBtn = document.getElementById('hotspot-camera');

  if (compBtn) {
    compBtn.classList.remove('hidden');
    compBtn.classList.remove('completed');
    const core = compBtn.querySelector('.hotspot-core');
    if (core) core.textContent = '🖥️';
    const tooltip = compBtn.querySelector('.hotspot-tooltip');
    if (tooltip) tooltip.textContent = 'ตรวจสอบหน้าจอคอมพิวเตอร์';
  }

  if (routerBtn) {
    routerBtn.classList.remove('hidden');
    routerBtn.classList.remove('completed');
    const core = routerBtn.querySelector('.hotspot-core');
    if (core) core.textContent = '📡';
    const tooltip = routerBtn.querySelector('.hotspot-tooltip');
    if (tooltip) tooltip.textContent = 'ตรวจสอบเราเตอร์ Wi-Fi';
  }

  if (phoneBtn) {
    phoneBtn.classList.add('hidden');
    phoneBtn.classList.remove('completed');
    const core = phoneBtn.querySelector('.hotspot-core');
    if (core) core.textContent = '📱';
    const tooltip = phoneBtn.querySelector('.hotspot-tooltip');
    if (tooltip) tooltip.textContent = 'ตรวจสอบสมาร์ตโฟน';
  }

  if (usbBtn) {
    usbBtn.classList.add('hidden');
    usbBtn.classList.remove('completed');
    const core = usbBtn.querySelector('.hotspot-core');
    if (core) core.textContent = '💾';
    const tooltip = usbBtn.querySelector('.hotspot-tooltip');
    if (tooltip) tooltip.textContent = 'ตรวจสอบแฟลชไดรฟ์ปริศนา';
  }

  if (cameraBtn) {
    cameraBtn.classList.add('hidden');
    cameraBtn.classList.remove('completed');
    const core = cameraBtn.querySelector('.hotspot-core');
    if (core) core.textContent = '📹';
    const tooltip = cameraBtn.querySelector('.hotspot-tooltip');
    if (tooltip) tooltip.textContent = 'ตรวจสอบกล้องวงจรปิด IoT';
  }

  // 5. รีเซ็ตแสงห้องและ Canvas เป็นฉาก Day 1
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) gameContainer.classList.remove('afternoon-lighting');

  const canvas = document.getElementById('game-canvas');
  if (canvas) renderRoomScene(canvas);

  // 6. รีเซ็ต Quest Log
  updateQuestLogUI();

  // 7. เริ่มต้นบทสนทนา Day 1 ใหม่
  startIntroDialogue();
}

/**
 * แปลงข้อความเป็น Grapheme Clusters สำหรับภาษาไทย (สระ/วรรณยุกต์ไม่แตก)
 */
function splitGraphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * แสดงบทสนทนาปัจจุบันในคิว พร้อมเอฟเฟกต์ Typewriter
 */
function showCurrentDialogue() {
  const current = gameState.activeDialogueQueue[gameState.dialogueIndex];
  if (!current) return;

  const speakerElem = document.getElementById('dialogue-speaker');
  const avatarElem = document.getElementById('dialogue-avatar');
  const textElem = document.getElementById('dialogue-text');
  const arrowElem = document.getElementById('dialogue-arrow');

  if (!textElem) return;

  // อัปเดตผู้พูดและ Avatar
  if (speakerElem) speakerElem.textContent = current.speaker;
  if (avatarElem) {
    avatarElem.innerHTML = `<span class="avatar-placeholder-icon">${current.avatar}</span>`;
  }

  // ซ่อนสัญลักษณ์ลูกศรขณะพิมพ์
  if (arrowElem) arrowElem.classList.remove('visible');

  // ล้างการพิมพ์เดิม
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }

  gameState.isTyping = true;
  currentGraphemes = splitGraphemes(current.text);
  currentGraphemeIndex = 0;
  textElem.innerHTML = '<span class="typing-cursor"></span>';

  // เริ่มแอนิเมชันตัวละครเด้งตามจังหวะพูดคุย (Talking Bounce)
  setPlayerTalkingAnimation(true);

  // เริ่มพิมพ์
  typeNextGrapheme();
}

/**
 * พิมพ์ตัวอักษรทีละตัว
 */
function typeNextGrapheme() {
  const textElem = document.getElementById('dialogue-text');

  if (!textElem) return;

  if (currentGraphemeIndex < currentGraphemes.length) {
    currentGraphemeIndex++;
    const currentText = currentGraphemes.slice(0, currentGraphemeIndex).join('');
    textElem.innerHTML = `${escapeHTML(currentText)}<span class="typing-cursor"></span>`;

    typewriterTimer = setTimeout(typeNextGrapheme, TYPING_SPEED_MS);
  } else {
    completeTyping();
  }
}

/**
 * สิ้นสุดการพิมพ์และแสดงข้อความแบบเต็มทันที
 */
function completeTyping() {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }

  gameState.isTyping = false;
  // ตัวละครหยุดเด้งพูด กลับสู่ท่าหายใจปกติ (Idle Breathing)
  setPlayerTalkingAnimation(false);

  const current = gameState.activeDialogueQueue[gameState.dialogueIndex];
  const textElem = document.getElementById('dialogue-text');
  const arrowElem = document.getElementById('dialogue-arrow');

  if (textElem && current) {
    textElem.textContent = current.text;
  }

  if (arrowElem) {
    arrowElem.classList.add('visible');
    const isLastMessage = (gameState.dialogueIndex === gameState.activeDialogueQueue.length - 1);
    const hintElem = arrowElem.querySelector('.arrow-hint');
    if (hintElem) {
      hintElem.textContent = isLastMessage ? 'คลิกเพื่อเริ่มสำรวจห้อง ➔' : 'Space / Click';
    }

    // ถ้าเป็นประโยคสุดท้ายของคิว ให้ตั้งเวลาปิดกล่องบทสนทนาอัตโนมัติ 4 วินาที เพื่อให้เห็นห้องเต็มตา
    if (isLastMessage) {
      if (dialogueAutoCloseTimer) clearTimeout(dialogueAutoCloseTimer);
      dialogueAutoCloseTimer = setTimeout(() => {
        const dBox = document.getElementById('dialogue-box');
        if (dBox && !dBox.classList.contains('hidden')) {
          closeDialogueBox();
        }
      }, 4000);
    }
  }
}

/**
 * ควบคุมแอนิเมชันของตัวละครหลัก (Bounce เมื่อพูดคุย / Breathing เมื่ออยู่นิ่ง)
 */
function setPlayerTalkingAnimation(isTalking) {
  const playerSprite = document.getElementById('player-sprite');
  if (!playerSprite) return;
  if (isTalking) {
    playerSprite.classList.add('talking');
  } else {
    playerSprite.classList.remove('talking');
  }
}

/**
 * จัดการเมื่อคลิกหรือกด Spacebar เพื่อข้าม/ไปประโยคถัดไป หรือปิดบทสนทนา
 */
function handleDialogueAdvance() {
  const dialogueBox = document.getElementById('dialogue-box');
  if (dialogueBox && dialogueBox.classList.contains('hidden')) {
    return;
  }

  if (gameState.isTyping) {
    completeTyping();
    return;
  }

  if (gameState.dialogueIndex + 1 < gameState.activeDialogueQueue.length) {
    gameState.dialogueIndex++;
    showCurrentDialogue();
  } else {
    // ปิดกล่องบทสนทนาเมื่อข้อความพูดจบ เพื่อให้เห็นห้องแบบเต็มตาและเข้าสู่โหมดเดินสำรวจ
    closeDialogueBox();
  }
}

/**
 * ฟังก์ชัน Escape ป้องกัน XSS
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/**
 * ==========================================================================
 * วาดภาพฉากห้องทำงาน - รองรับภาพ room-bg.png และ Procedural Fallback
 * ==========================================================================
 */
function renderRoomScene(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // ตรวจสอบและโหลดรูปภาพ room-bg.png
  const bgImg = new Image();
  bgImg.src = 'room-bg.png';
  bgImg.onload = () => {
    // เมื่อมีรูป room-bg.png ให้เคลียร์ Canvas ให้โปร่งใส เพื่อให้ background-image: cover บน .game-container แสดงผลได้อย่างคมชัดเต็มพื้นที่
    ctx.clearRect(0, 0, width, height);
    console.log('🖼️ room-bg.png loaded successfully. Displaying via CSS background-image cover.');
  };
  bgImg.onerror = () => {
    // กรณีที่หาไฟล์รูปภาพไม่เจอ ให้วาดฉากสำรองแบบ Procedural Canvas
    drawProceduralRoomFallback(ctx, width, height);
  };
}

/**
 * ฟังก์ชันวาดฉากห้องสำรองด้วย Canvas 2D (กรณีไม่มีไฟล์รูปภาพ)
 */
function drawProceduralRoomFallback(ctx, width, height) {
  // 1. ผนังห้องโทนอุ่น (Cozy Warm Wall)
  const wallGradient = ctx.createLinearGradient(0, 0, 0, height * 0.65);
  wallGradient.addColorStop(0, '#f9f5ed');
  wallGradient.addColorStop(1, '#ede3d1');
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, width, height);

  // บัวฝ้าเพดาน (Crown Moulding)
  ctx.fillStyle = '#e4d8c3';
  ctx.fillRect(0, 0, width, 14);

  // 2. แสงแดดอุ่นๆ จากหน้าต่าง (Sunlight Rays from Window)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 248, 220, 0.35)';
  ctx.beginPath();
  ctx.moveTo(560, 90);
  ctx.lineTo(820, 90);
  ctx.lineTo(1020, 520);
  ctx.lineTo(440, 520);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. หน้าต่างบานสวย (Window on Back Wall)
  ctx.fillStyle = '#dfd3c1';
  ctx.fillRect(580, 80, 220, 200); // ขอบนอกหน้าต่าง
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(588, 88, 204, 184); // ขอบใน

  // บานกระจกสีฟ้าอ่อนสะท้อนท้องฟ้า
  const glassGrad = ctx.createLinearGradient(590, 90, 790, 270);
  glassGrad.addColorStop(0, '#eaf5fc');
  glassGrad.addColorStop(1, '#d8edf8');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(594, 94, 92, 82);
  ctx.fillRect(694, 94, 92, 82);
  ctx.fillRect(594, 184, 92, 82);
  ctx.fillRect(694, 184, 92, 82);

  // ขอบหน้าต่างด้านล่าง
  ctx.fillStyle = '#d0beaa';
  ctx.fillRect(570, 280, 240, 14);

  // 4. พื้นไม้โทนอบอุ่น (Wooden Parquet Floor)
  const floorY = height * 0.65; // ~468px
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
  floorGrad.addColorStop(0, '#dfcfb9');
  floorGrad.addColorStop(1, '#cdbb9f');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, width, height - floorY);

  // บัวเชิงผนัง (Baseboard)
  ctx.fillStyle = '#d5c2ab';
  ctx.fillRect(0, floorY - 16, width, 16);
  ctx.fillStyle = '#c5b098';
  ctx.fillRect(0, floorY - 2, width, 3);

  // เส้นรอยต่อแผ่นไม้บนพื้น
  ctx.strokeStyle = 'rgba(170, 145, 120, 0.25)';
  ctx.lineWidth = 1.5;
  for (let y = floorY + 40; y < height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 5. พรมวงกลมกลางห้อง (Area Rug)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(640, 580, 280, 85, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f4ede1';
  ctx.fill();
  ctx.strokeStyle = '#e0d2bf';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 6. โต๊ะทำงานและหน้าจอคอมพิวเตอร์ (Study Desk & Computer on the Left)
  // พิกัด Hotspot อยู่ที่ ~ top: 55% (396px), left: 35% (448px)
  
  // ขาโต๊ะและตัวโต๊ะทำงาน
  ctx.fillStyle = '#7a6857'; // เงาใต้โต๊ะ
  ctx.fillRect(260, 480, 380, 14);

  // ท็อปโต๊ะไม้
  const deskWood = ctx.createLinearGradient(240, 440, 240, 480);
  deskWood.addColorStop(0, '#c7ab8e');
  deskWood.addColorStop(1, '#b09375');
  ctx.fillStyle = deskWood;
  ctx.beginPath();
  ctx.roundRect(240, 440, 420, 36, 6);
  ctx.fill();

  // ขาโต๊ะซ้าย-ขวา
  ctx.fillStyle = '#5c4b3c';
  ctx.fillRect(270, 476, 18, 180);
  ctx.fillRect(620, 476, 18, 180);

  // ปลั๊กไฟพ่วงใต้โต๊ะ (Power Strip under Desk)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(330, 618, 68, 18, 4);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ไฟสวิตช์สีแดงเรืองแสง (Illuminated Power Switch)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(335, 622, 10, 10);

  // เต้ารับปลั๊กไฟ 3 ช่อง (3 Outlets with ground)
  ctx.fillStyle = '#334155';
  for (let i = 0; i < 3; i++) {
    const ox = 354 + i * 14;
    ctx.fillRect(ox, 622, 2, 5);
    ctx.fillRect(ox + 5, 622, 2, 5);
    ctx.beginPath();
    ctx.arc(ox + 3.5, 630, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // สายไฟสีเทาเข้มต่อลงพื้น (Power Cable)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 627);
  ctx.bezierCurveTo(310, 632, 295, 646, 280, 654);
  ctx.stroke();

  // แผ่นรองเมาส์ / Deskpad
  ctx.fillStyle = '#556371';
  ctx.beginPath();
  ctx.roundRect(330, 436, 235, 14, 3);
  ctx.fill();

  // คีย์บอร์ดและเมาส์
  ctx.fillStyle = '#ece4d8';
  ctx.fillRect(360, 434, 110, 8);
  ctx.fillStyle = '#d5cbbf';
  ctx.beginPath();
  ctx.arc(500, 438, 5, 0, Math.PI * 2);
  ctx.fill();

  // ฐานและขาตั้งจอคอมพิวเตอร์
  ctx.fillStyle = '#838e99';
  ctx.fillRect(435, 415, 26, 26);
  ctx.beginPath();
  ctx.roundRect(415, 438, 66, 6, 2);
  ctx.fill();

  // หน้าจอคอมพิวเตอร์ (Monitor Display)
  ctx.fillStyle = '#2b303a';
  ctx.beginPath();
  ctx.roundRect(340, 270, 216, 148, 8); // จอคอมพิวเตอร์
  ctx.fill();

  // กระจกจอและภาพหน้าจอเรืองแสง
  const screenGrad = ctx.createLinearGradient(348, 278, 548, 410);
  screenGrad.addColorStop(0, '#1c2836');
  screenGrad.addColorStop(1, '#131e2b');
  ctx.fillStyle = screenGrad;
  ctx.beginPath();
  ctx.roundRect(348, 278, 200, 132, 4);
  ctx.fill();

  // สัญลักษณ์ระบบและหน้าต่างบนจอคอม
  ctx.fillStyle = '#4fa3e3';
  ctx.fillRect(364, 296, 60, 8);
  ctx.fillStyle = '#61c98e';
  ctx.fillRect(364, 312, 110, 5);
  ctx.fillStyle = '#e8a855';
  ctx.fillRect(364, 323, 85, 5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(364, 338, 168, 52);

  // กระดาษโน้ตสีเหลืองแปะข้างแก้วกาแฟ (Post-it Password Warning Note)
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.roundRect(518, 423, 20, 22, 2);
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1;
  ctx.stroke();
  // ข้อความจำลองบนโน้ต
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(522, 427, 12, 2);
  ctx.fillRect(522, 432, 10, 2);
  ctx.fillRect(522, 437, 8, 2);

  // แก้วกาแฟบนโต๊ะ (Coffee Mug)
  ctx.fillStyle = '#d97d54';
  ctx.beginPath();
  ctx.roundRect(545, 420, 22, 26, 4);
  ctx.fill();

  // สมาร์ตโฟนบนโต๊ะทำงาน (Smartphone on Desk) - สอดคล้องกับ Hotspot Day 2 (top: 59%, left: 47%)
  ctx.save();
  ctx.fillStyle = '#1c1b1f';
  ctx.beginPath();
  ctx.roundRect(588, 424, 42, 24, 4);
  ctx.fill();
  ctx.strokeStyle = '#484440';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (gameState.currentDay >= 2) {
    // หน้าจอเปิดติดมีแสงสว่างแจ้งเตือนข้อความ SMS ใน Day 2
    ctx.fillStyle = '#2d4059';
    ctx.fillRect(591, 427, 36, 18);
    // แถบข้อความ SMS สีขาว
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(594, 431, 20, 3.5);
    ctx.fillStyle = '#8ecae6';
    ctx.fillRect(594, 436, 28, 3.5);
    // จุดแจ้งเตือนสีแดง
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(623, 431, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // ใน Day 1 หน้าจอดับมืด
    ctx.fillStyle = '#141416';
    ctx.fillRect(591, 427, 36, 18);
  }
  ctx.restore();

  // 7. ชั้นวางของและเราเตอร์ Wi-Fi (Shelf & Router on the Right)
  // พิกัด Hotspot อยู่ที่ ~ top: 45% (324px), left: 68% (870px)

  // ชั้นวางของไม้ลอยตัว
  ctx.fillStyle = '#4f4133'; // ฉากยึดผนัง
  ctx.fillRect(770, 340, 10, 26);
  ctx.fillRect(950, 340, 10, 26);

  // ตัวแผ่นชั้นวางไม้
  const shelfWood = ctx.createLinearGradient(740, 320, 740, 342);
  shelfWood.addColorStop(0, '#be9f80');
  shelfWood.addColorStop(1, '#aa8c6e');
  ctx.fillStyle = shelfWood;
  ctx.beginPath();
  ctx.roundRect(740, 320, 250, 20, 4);
  ctx.fill();

  // กล่องเราเตอร์ Wi-Fi (Wi-Fi Router Body)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(830, 294, 80, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#e0d7c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // เสาสัญญาณเราเตอร์ 2 เสา (Dual Antennas)
  ctx.strokeStyle = '#3e3731';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(842, 294);
  ctx.lineTo(828, 240); // เสาซ้ายเอียงออก
  ctx.moveTo(898, 294);
  ctx.lineTo(912, 240); // เสาขวาเอียงออก
  ctx.stroke();

  // ไฟ LED สถานะบนเราเตอร์ (Glowing LEDs)
  ctx.fillStyle = '#27c93f'; // สีเขียวออนไลน์
  ctx.beginPath();
  ctx.arc(848, 307, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(858, 307, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffbd2e'; // สีส้มเตือนความปลอดภัย
  ctx.beginPath();
  ctx.arc(868, 307, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // หนังสือวางบนชั้นด้านข้างเราเตอร์
  ctx.fillStyle = '#6b8cae';
  ctx.fillRect(760, 272, 16, 48);
  ctx.fillStyle = '#c77864';
  ctx.fillRect(778, 264, 18, 56);
  ctx.fillStyle = '#78a887';
  ctx.fillRect(798, 280, 14, 40);

  // กระถางต้นไม้เล็กๆ (Succulent Plant)
  ctx.fillStyle = '#d59b77';
  ctx.beginPath();
  ctx.roundRect(936, 296, 28, 24, 3);
  ctx.fill();
  ctx.fillStyle = '#5c996e';
  ctx.beginPath();
  ctx.arc(950, 286, 12, 0, Math.PI * 2);
  ctx.fill();

  // 8. กรอบรูปติดผนัง (Wall Art Poster)
  ctx.fillStyle = '#5c4e42';
  ctx.fillRect(230, 90, 110, 140);
  ctx.fillStyle = '#fffdfa';
  ctx.fillRect(238, 98, 94, 124);
  // ลวดลายในกรอบรูป
  ctx.fillStyle = '#f0e3ce';
  ctx.fillRect(246, 106, 78, 60);
  ctx.fillStyle = '#c98b58';
  ctx.beginPath();
  ctx.arc(285, 136, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8c7d70';
  ctx.fillRect(252, 182, 66, 6);
  ctx.fillRect(252, 194, 48, 5);

  console.log('🖼️ Cozy 2D Room Scene Rendered Successfully.');
}

