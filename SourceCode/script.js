import { sound } from './audio.js';
import { ConfettiCannon } from './confetti.js';

// Default entries matching Screenshot 1
const DEFAULT_ENTRIES = [
  'Ali',
  'Beatriz',
  'Charles',
  'Diya',
  'Eric',
  'Fatima',
  'Gabriel',
  'Hanna'
];

// Color palette matching Wheel of Names exact official colors
const PALETTE = [
  '#5DADE2', // Blue (Ali, Eric)
  '#82E0AA', // Green (Beatriz, Fatima)
  '#F7DC6F', // Yellow (Charles, Gabriel)
  '#AF7AC5'  // Purple (Diya, Hanna)
];

const BACKUP_COLORS = ['#f87171', '#38bdf8', '#fb923c', '#a78bfa'];

function adjustColorBrightness(hex, percent) {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

class WheelApp {
  constructor() {
    this.entries = [...DEFAULT_ENTRIES];
    this.results = [];
    
    // Scripted / Rigged Sequence (F1 Secret Feature)
    this.secretSubMode = 'group'; // default to group matchup as requested
    this.secretQueue = []; // array of strings (names in order of winning for single mode)
    this.secretModeActive = true;
    this.repeatWhenEmpty = false;

    // 2-Side Versus Matchups (Only even numbers: 2vs2, 4vs4, 6vs6, 8vs8)
    this.matches = [
      {
        id: 'match_1',
        name: 'Trận 1',
        teamSize: 2, // 2 vs 2 (even numbers only!)
        teamLeft: {
          name: 'Đội Trái (Xanh)',
          members: [],
          drawnMembers: []
        },
        teamRight: {
          name: 'Đội Phải (Đỏ)',
          members: [],
          drawnMembers: []
        }
      }
    ];
    this.pendingMatchSpin = null;

    // Wheel animation state
    this.canvas = document.getElementById('wheelCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.rotation = 0; // current angle in radians
    this.isSpinning = false;
    this.currentWinningIndex = 0;
    this.lastTickBoundary = -1;
    this.idleLoopRunning = false;
    this.currentPointerColor = '';

    // Confetti
    this.confetti = new ConfettiCannon(document.getElementById('confettiCanvas'));

    // DOM Elements
    this.entriesTextarea = document.getElementById('entriesTextarea');
    this.entriesCountBadge = document.getElementById('entriesCountBadge');
    this.resultsCountBadge = document.getElementById('resultsCountBadge');
    this.resultsList = document.getElementById('resultsList');
    this.centerPrompt = document.getElementById('centerPrompt');
    this.wheelPointer = document.getElementById('wheelPointer');
    this.pointerBodyStopTop = document.getElementById('pointerBodyStopTop');
    this.pointerBodyStopBottom = document.getElementById('pointerBodyStopBottom');
    this.pointerOuterStop0 = document.getElementById('pointerOuterStop0');
    this.pointerOuterStop49 = document.getElementById('pointerOuterStop49');
    this.pointerOuterStop51 = document.getElementById('pointerOuterStop51');
    this.pointerOuterStop100 = document.getElementById('pointerOuterStop100');
    this.pointerInnerStop0 = document.getElementById('pointerInnerStop0');
    this.pointerInnerStop49 = document.getElementById('pointerInnerStop49');
    this.pointerInnerStop51 = document.getElementById('pointerInnerStop51');
    this.pointerInnerStop100 = document.getElementById('pointerInnerStop100');

    // Winner Modal Elements (Clean & Stealthy: ONLY displays who won!)
    this.winnerModal = document.getElementById('winnerModal');
    this.winnerNameDisplay = document.getElementById('winnerNameDisplay');
    this.removeWinnerBtn = document.getElementById('removeWinnerBtn');
    this.closeWinnerBtn = document.getElementById('closeWinnerBtn');

    // Secret F1 Modal Elements
    this.secretModal = document.getElementById('secretModal');
    this.secretTabSingleBtn = document.getElementById('secretTabSingleBtn');
    this.secretTabGroupBtn = document.getElementById('secretTabGroupBtn');
    this.secretSingleBody = document.getElementById('secretSingleBody');
    this.secretGroupBody = document.getElementById('secretGroupBody');

    this.secretSourceList = document.getElementById('secretSourceList');
    this.secretQueueList = document.getElementById('secretQueueList');
    this.secretSourceCount = document.getElementById('secretSourceCount');
    this.secretQueueCount = document.getElementById('secretQueueCount');
    this.secretModeToggle = document.getElementById('secretModeToggle');
    this.secretModeText = document.getElementById('secretModeText');
    this.secretStatusDot = document.getElementById('secretStatusDot');

    // Group / Matchup mode elements
    this.groupPlayerSourceList = document.getElementById('groupPlayerSourceList');
    this.groupSourceCount = document.getElementById('groupSourceCount');
    this.groupsCardsContainer = document.getElementById('groupsCardsContainer');
    this.groupsSummaryText = document.getElementById('groupsSummaryText');
    this.groupCountPill = document.getElementById('groupCountPill');

    this.init();
  }

  init() {
    this.entriesTextarea.value = this.entries.join('\n');
    this.updateEntriesCount();

    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.drawWheel();
      this.updatePointerColor();
    });

    this.drawWheel();
    this.updatePointerColor();

    this.bindEvents();
    this.bindF1SecretEvents();
    this.bindMatchModeEvents();
    this.updateSecretUI();
    this.renderMatchUI();

    this.startIdleLoop();
  }

  resizeCanvas() {
    const wrapper = document.getElementById('wheelWrapper');
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displaySize = rect.width;
  }

  updateEntriesCount() {
    this.entriesCountBadge.textContent = this.entries.length;
  }

  updateResultsCount() {
    this.resultsCountBadge.textContent = this.results.length;
  }

  getSliceColor(index, total) {
    if (total === 1) return PALETTE[0];
    let color = PALETTE[index % PALETTE.length];
    if (index === total - 1 && color === PALETTE[0]) {
      color = BACKUP_COLORS[index % BACKUP_COLORS.length];
    }
    return color;
  }

  startIdleLoop() {
    if (this.idleLoopRunning) return;
    this.idleLoopRunning = true;

    const idleSpeed = 0.0032; // smooth ambient rotation
    const idleStep = () => {
      if (!this.isSpinning && (!this.winnerModal || !this.winnerModal.classList.contains('open'))) {
        this.rotation = (this.rotation + idleSpeed) % (Math.PI * 2);
        this.drawWheel();
        this.updatePointerColor();
      }
      this.idleAnimId = requestAnimationFrame(idleStep);
    };
    this.idleAnimId = requestAnimationFrame(idleStep);
  }

  getCurrentSliceIndex(rot = this.rotation) {
    const total = this.entries.length;
    if (total === 0) return 0;
    const sliceAngle = (Math.PI * 2) / total;
    const localAngle = (((-rot) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(localAngle / sliceAngle) % total;
  }

  updatePointerColor(rot = this.rotation) {
    if (this.entries.length === 0) return;
    const idx = this.getCurrentSliceIndex(rot);
    const color = this.getSliceColor(idx, this.entries.length);
    if (this.currentPointerColor !== color) {
      this.currentPointerColor = color;
      
      const u = {
        l1: adjustColorBrightness(color, 10),
        l2: adjustColorBrightness(color, 20),
        l3: adjustColorBrightness(color, 30),
        d1: adjustColorBrightness(color, -10),
        d2: adjustColorBrightness(color, -20),
        d3: adjustColorBrightness(color, -30)
      };

      if (this.pointerBodyStopTop && this.pointerBodyStopBottom) {
        this.pointerBodyStopTop.setAttribute('stop-color', u.l2);
        this.pointerBodyStopBottom.setAttribute('stop-color', u.d2);
      }

      if (this.pointerOuterStop0 && this.pointerOuterStop49 && this.pointerOuterStop51 && this.pointerOuterStop100) {
        this.pointerOuterStop0.setAttribute('stop-color', u.l3);
        this.pointerOuterStop49.setAttribute('stop-color', u.l2);
        this.pointerOuterStop51.setAttribute('stop-color', u.d2);
        this.pointerOuterStop100.setAttribute('stop-color', u.d3);
      }

      if (this.pointerInnerStop0 && this.pointerInnerStop49 && this.pointerInnerStop51 && this.pointerInnerStop100) {
        this.pointerInnerStop0.setAttribute('stop-color', u.d2);
        this.pointerInnerStop49.setAttribute('stop-color', u.d1);
        this.pointerInnerStop51.setAttribute('stop-color', u.l1);
        this.pointerInnerStop100.setAttribute('stop-color', u.l2);
      }
    }
  }

  drawWheel() {
    const size = this.displaySize;
    if (!size) return;

    const ctx = this.ctx;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 2;

    ctx.clearRect(0, 0, size, size);

    const total = this.entries.length;
    if (total === 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px "Quicksand", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Thêm tên để bắt đầu', cx, cy);
      ctx.restore();
      return;
    }

    const sliceAngle = (Math.PI * 2) / total;

    // 1. Draw Rotating Slices
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    for (let i = 0; i < total; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = this.getSliceColor(i, total);
      ctx.fill();

      // Subtle sector boundary line matching real Wheel of Names
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.lineWidth = total > 40 ? 1 : 1.4;
      ctx.stroke();

      // Render name text along the slice radius (from hub outward)
      const name = this.entries[i];
      ctx.save();
      const textAngle = startAngle + sliceAngle / 2;
      ctx.rotate(textAngle);

      ctx.fillStyle = '#000000'; // Pure black text like real site
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const maxTextRadius = radius * 0.90;
      const minTextRadius = radius * 0.22;
      const availableWidth = maxTextRadius - minTextRadius;
      
      // Calculate font size in Quicksand font
      let fontSize = Math.min(32, Math.max(14, Math.floor((radius * sliceAngle * 0.52))));
      if (total <= 8) fontSize = Math.min(36, Math.max(20, Math.floor(radius * 0.082)));
      ctx.font = `600 ${fontSize}px "Quicksand", sans-serif`;

      let displayStr = name;
      while (ctx.measureText(displayStr).width > availableWidth && displayStr.length > 3) {
        displayStr = displayStr.slice(0, -2) + '…';
      }

      ctx.fillText(displayStr, radius - 20, 0);
      ctx.restore();
    }
    ctx.restore();

    // 2. Wheel 3D Lighting & Soft Edge ("cảm giác mờ mờ" authentic Wheel of Names passes)
    ctx.save();
    ctx.translate(cx, cy);

    // Bevel outer ring shadow
    const bevel = ctx.createRadialGradient(0, 0, radius * 0.985, 0, 0, radius);
    bevel.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bevel.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
    ctx.fillStyle = bevel;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle face shadow across the lower portion
    const faceShadow = ctx.createRadialGradient(-radius / 2, -radius, radius, -radius / 2, -radius, radius * 2);
    faceShadow.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
    faceShadow.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
    ctx.fillStyle = faceShadow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Light sheen from top left
    const light = ctx.createRadialGradient(-radius / 2, -radius, 0, -radius / 2, -radius, radius);
    light.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    light.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Conic bevel shading around the rim
    try {
      const conic = ctx.createConicGradient(0, 0, 0);
      conic.addColorStop(0.417, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(0.625, 'rgba(255, 255, 255, 0.22)');
      conic.addColorStop(0.833, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(0.917, 'rgba(0, 0, 0, 0)');
      conic.addColorStop(0.125, 'rgba(0, 0, 0, 0.08)');
      conic.addColorStop(0.333, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = conic;
      ctx.stroke();
    } catch (e) {}

    // Outer perimeter edge (subtle dark line, NO white border)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 3. Center Hub - crisp pure white circle (~19% radius)
    const hubRadius = radius * 0.19;
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  checkPointerTick(currentRotation) {
    if (this.entries.length === 0) return;
    const total = this.entries.length;
    const sliceAngle = (Math.PI * 2) / total;

    const localPointerAngle = (((-currentRotation) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const boundaryIndex = Math.floor(localPointerAngle / sliceAngle);

    if (boundaryIndex !== this.lastTickBoundary) {
      this.lastTickBoundary = boundaryIndex;
      sound.playTick();
    }
  }

  getCurrentSliceIndex(currentRotation) {
    if (this.entries.length === 0) return 0;
    const total = this.entries.length;
    const sliceAngle = (Math.PI * 2) / total;
    const localAngle = (((-currentRotation) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let idx = Math.floor(localAngle / sliceAngle);
    if (idx >= total) idx = total - 1;
    return idx;
  }

  spin() {
    if (this.isSpinning || this.entries.length === 0) return;

    sound.init();
    this.isSpinning = true;
    this.centerPrompt.classList.add('hidden');
    this.pendingMatchSpin = null;

    const total = this.entries.length;
    const sliceAngle = (Math.PI * 2) / total;

    let targetIndex = -1;
    let predeterminedWinner = null;

    // CHECK SECRET SCRIPT
    if (this.secretModeActive) {
      if (this.secretSubMode === 'group') {
        // 2-SIDE VERSUS MATCHUP: Quay từ TRÁI qua PHẢI luôn!
        for (const m of this.matches) {
          if (m.teamLeft.members && m.teamLeft.members.length > 0) {
            const candidate = m.teamLeft.members[0];
            const matchIdx = this.entries.findIndex(e => e.trim().toLowerCase() === candidate.trim().toLowerCase());
            if (matchIdx !== -1) {
              targetIndex = matchIdx;
              predeterminedWinner = candidate;
              this.pendingMatchSpin = { match: m, side: 'left', name: candidate };
              break;
            }
          } else if (m.teamRight.members && m.teamRight.members.length > 0) {
            const candidate = m.teamRight.members[0];
            const matchIdx = this.entries.findIndex(e => e.trim().toLowerCase() === candidate.trim().toLowerCase());
            if (matchIdx !== -1) {
              targetIndex = matchIdx;
              predeterminedWinner = candidate;
              this.pendingMatchSpin = { match: m, side: 'right', name: candidate };
              break;
            }
          }
        }
      } else {
        // SINGLE SEQUENTIAL MODE
        if (this.secretQueue.length > 0) {
          let foundQueueIdx = -1;
          for (let i = 0; i < this.secretQueue.length; i++) {
            const candidate = this.secretQueue[i];
            const matchIdx = this.entries.findIndex(e => e.trim().toLowerCase() === candidate.trim().toLowerCase());
            if (matchIdx !== -1) {
              targetIndex = matchIdx;
              predeterminedWinner = candidate;
              foundQueueIdx = i;
              break;
            }
          }

          if (foundQueueIdx !== -1) {
            const [usedWinner] = this.secretQueue.splice(foundQueueIdx, 1);
            if (this.repeatWhenEmpty) {
              this.secretQueue.push(usedWinner);
            }
            this.updateSecretUI();
          }
        }
      }
    }

    if (targetIndex === -1) {
      targetIndex = Math.floor(Math.random() * total);
    }

    const jitter = (Math.random() - 0.5) * 0.55 * sliceAngle;
    const localTargetAngle = (targetIndex + 0.5) * sliceAngle + jitter;

    const targetNorm = (((-localTargetAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const minFullRotations = 6;
    const fullSpins = minFullRotations * Math.PI * 2;

    const currentNorm = ((this.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let diff = targetNorm - currentNorm;
    if (diff < 0) diff += Math.PI * 2;
    if (diff < 0.2) diff += Math.PI * 2;

    const totalRotationDelta = fullSpins + diff;
    const startRotation = this.rotation;
    const endRotation = startRotation + totalRotationDelta;

    const duration = 6500 + Math.random() * 800;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 4.4);

      this.rotation = startRotation + totalRotationDelta * ease;
      this.drawWheel();
      this.updatePointerColor(this.rotation);
      this.checkPointerTick(this.rotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.rotation = endRotation;
        this.drawWheel();
        this.updatePointerColor(this.rotation);
        this.isSpinning = false;
        this.centerPrompt.classList.remove('hidden');

        const winIdx = this.getCurrentSliceIndex(this.rotation);
        const winnerName = this.entries[winIdx] || predeterminedWinner || 'Người chiến thắng';
        this.onWinnerSelected(winnerName, winIdx);
      }
    };

    requestAnimationFrame(animate);
  }

  onWinnerSelected(winnerName, winnerIndex) {
    this.currentWinningIndex = winnerIndex;

    this.confetti.fire(180);
    sound.playFanfare();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Progress match state if in match mode
    if (this.pendingMatchSpin) {
      const { match, side } = this.pendingMatchSpin;
      const team = side === 'left' ? match.teamLeft : match.teamRight;
      const cIdx = team.members.findIndex(m => m.trim().toLowerCase() === winnerName.trim().toLowerCase());
      if (cIdx !== -1) {
        team.members.splice(cIdx, 1);
      } else {
        team.members.shift();
      }
      team.drawnMembers.push(winnerName);
      this.renderMatchUI();
    }

    // Public Results history: ONLY clean person name, completely stealthy!
    const resultItem = {
      name: winnerName,
      time: timeStr,
      order: this.results.length + 1
    };
    this.results.unshift(resultItem);
    this.updateResultsCount();
    this.renderResults();

    // STEALTHY WINNER POPUP: ONLY announces who won!
    // Set header color to match the winning slice (like Wheel of Names!)
    const winColor = this.getSliceColor(winnerIndex, this.entries.length);
    const winHeader = document.getElementById('winnerCardHeader');
    if (winHeader) {
      winHeader.style.backgroundColor = winColor;
    }

    this.winnerNameDisplay.textContent = winnerName;
    this.winnerModal.classList.add('open');
  }

  renderResults() {
    if (this.results.length === 0) {
      this.resultsList.innerHTML = '<div class="results-empty">No results yet. Click the wheel to spin!</div>';
      return;
    }

    this.resultsList.innerHTML = this.results.map((r, i) => `
      <div class="result-card">
        <div class="result-left">
          <span class="result-order">#${this.results.length - i}</span>
          <span class="result-name">${escapeHtml(r.name)}</span>
        </div>
        <span class="result-time">${r.time}</span>
      </div>
    `).join('');
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    this.canvas.addEventListener('click', () => this.spin());
    this.centerPrompt.addEventListener('click', () => this.spin());

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.spin();
      }
    });

    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Customize dialog toggle
    const customizeBtn = document.getElementById('customizeBtn');
    const customizeModal = document.getElementById('customizeModal');
    const closeCustomizeBtn = document.getElementById('closeCustomizeBtn');
    const saveCustomizeBtn = document.getElementById('saveCustomizeBtn');

    if (customizeBtn && customizeModal) {
      customizeBtn.addEventListener('click', () => customizeModal.classList.add('open'));
      closeCustomizeBtn.addEventListener('click', () => customizeModal.classList.remove('open'));
      saveCustomizeBtn.addEventListener('click', () => customizeModal.classList.remove('open'));
      customizeModal.addEventListener('click', (e) => {
        if (e.target === customizeModal) customizeModal.classList.remove('open');
      });
    }

    // New Wheel button
    const newWheelBtn = document.getElementById('newWheelBtn');
    if (newWheelBtn) {
      newWheelBtn.addEventListener('click', () => {
        if (confirm('Create a new wheel?')) {
          this.entries = [...DEFAULT_ENTRIES];
          this.entriesTextarea.value = this.entries.join('\n');
          this.results = [];
          this.updateEntriesCount();
          this.updateResultsCount();
          this.drawWheel();
          this.updateSecretUI();
          this.renderMatchUI();
        }
      });
    }

    this.entriesTextarea.addEventListener('input', () => {
      this.syncEntriesFromTextarea();
    });

    document.getElementById('shuffleBtn').addEventListener('click', () => {
      for (let i = this.entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.entries[i], this.entries[j]] = [this.entries[j], this.entries[i]];
      }
      this.entriesTextarea.value = this.entries.join('\n');
      this.drawWheel();
      this.updateSecretUI();
      this.renderMatchUI();
    });

    document.getElementById('sortBtn').addEventListener('click', () => {
      this.entries.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
      this.entriesTextarea.value = this.entries.join('\n');
      this.drawWheel();
      this.updateSecretUI();
      this.renderMatchUI();
    });

    // Add image / Preset samples dropdown
    const addImageBtn = document.getElementById('addImageBtn');
    const presetMenu = document.getElementById('presetMenu');
    if (addImageBtn && presetMenu) {
      addImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addImageBtn.parentElement.classList.toggle('open');
      });

      document.addEventListener('click', () => {
        addImageBtn.parentElement.classList.remove('open');
      });

      presetMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const type = e.target.getAttribute('data-preset');
          let newEntries = [];
          if (type === 'english') {
            newEntries = [...DEFAULT_ENTRIES];
          } else if (type === 'vietnamese') {
            newEntries = ['Phúc', 'Nam', 'Linh', 'Tuấn', 'Trang', 'Dũng', 'My', 'Hoàng'];
          } else if (type === 'numbers') {
            newEntries = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
          } else if (type === 'prizes') {
            newEntries = ['Jackpot', '1st Prize', '2nd Prize', '3rd Prize', 'Consolation', 'Try Again'];
          }
          this.entries = newEntries;
          this.entriesTextarea.value = this.entries.join('\n');
          this.updateEntriesCount();
          this.drawWheel();
          this.updateSecretUI();
          this.renderMatchUI();
        });
      });
    }

    // Tabs toggle
    const tabEntriesBtn = document.getElementById('tabEntriesBtn');
    const tabResultsBtn = document.getElementById('tabResultsBtn');
    const entriesContent = document.getElementById('entriesContent');
    const resultsContent = document.getElementById('resultsContent');

    tabEntriesBtn.addEventListener('click', () => {
      tabEntriesBtn.classList.add('active');
      tabResultsBtn.classList.remove('active');
      entriesContent.classList.add('active');
      resultsContent.classList.remove('active');
    });

    tabResultsBtn.addEventListener('click', () => {
      tabResultsBtn.classList.add('active');
      tabEntriesBtn.classList.remove('active');
      resultsContent.classList.add('active');
      entriesContent.classList.remove('active');
    });

    document.getElementById('copyResultsBtn').addEventListener('click', () => {
      if (this.results.length === 0) return;
      const text = this.results.map((r, i) => `#${this.results.length - i}. ${r.name} (${r.time})`).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
      });
    });

    document.getElementById('clearResultsBtn').addEventListener('click', () => {
      if (confirm('Clear all results?')) {
        this.results = [];
        this.updateResultsCount();
        this.renderResults();
      }
    });

    this.closeWinnerBtn.addEventListener('click', () => {
      this.winnerModal.classList.remove('open');
    });

    this.removeWinnerBtn.addEventListener('click', () => {
      const winnerName = this.winnerNameDisplay.textContent;
      const lineIdx = this.entries.findIndex(n => n.trim().toLowerCase() === winnerName.trim().toLowerCase());
      if (lineIdx !== -1) {
        this.entries.splice(lineIdx, 1);
        this.entriesTextarea.value = this.entries.join('\n');
        this.updateEntriesCount();
        this.drawWheel();
        this.updateSecretUI();
        this.renderMatchUI();
      }
      this.winnerModal.classList.remove('open');
    });

    this.winnerModal.addEventListener('click', (e) => {
      if (e.target === this.winnerModal) {
        this.winnerModal.classList.remove('open');
      }
    });
  }

  syncEntriesFromTextarea() {
    const raw = this.entriesTextarea.value;
    this.entries = raw
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    this.updateEntriesCount();
    this.drawWheel();
    this.updateSecretUI();
    this.renderMatchUI();
  }

  // ==========================================
  // SECRET F1 RIGGED SEQUENCE CONTROLS
  // ==========================================
  bindF1SecretEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.toggleSecretModal();
      }
      if (e.key === 'Escape' && this.secretModal && this.secretModal.classList.contains('open')) {
        this.secretModal.classList.remove('open');
      }
    });

    const secretHelpBtn = document.getElementById('secretHelpBtn');
    if (secretHelpBtn) secretHelpBtn.addEventListener('click', () => this.toggleSecretModal());

    const versionSecretTrigger = document.getElementById('versionSecretTrigger');
    if (versionSecretTrigger) versionSecretTrigger.addEventListener('click', () => this.toggleSecretModal());

    const closeSecretBtn = document.getElementById('closeSecretBtn');
    if (closeSecretBtn) closeSecretBtn.addEventListener('click', () => this.toggleSecretModal());

    const cancelSecretBtn = document.getElementById('cancelSecretBtn');
    if (cancelSecretBtn) cancelSecretBtn.addEventListener('click', () => this.toggleSecretModal());

    const applySecretBtn = document.getElementById('applySecretBtn');
    if (applySecretBtn) applySecretBtn.addEventListener('click', () => this.toggleSecretModal());

    if (this.secretModeToggle) {
      this.secretModeToggle.addEventListener('change', (e) => {
        this.secretModeActive = e.target.checked;
        if (this.secretModeText) {
          this.secretModeText.textContent = this.secretModeActive ? 'Đang BẬT' : 'Đang TẮT';
          this.secretModeText.style.color = this.secretModeActive ? '#10b981' : '#94a3b8';
        }
        this.updateStatusDot();
      });
    }

    if (this.secretTabSingleBtn) {
      this.secretTabSingleBtn.addEventListener('click', () => {
        this.secretSubMode = 'single';
        this.secretTabSingleBtn.classList.add('active');
        if (this.secretTabGroupBtn) this.secretTabGroupBtn.classList.remove('active');
        if (this.secretSingleBody) this.secretSingleBody.style.display = 'flex';
        if (this.secretGroupBody) this.secretGroupBody.style.display = 'none';
        this.updateSecretUI();
        this.updateStatusDot();
      });
    }

    if (this.secretTabGroupBtn) {
      this.secretTabGroupBtn.addEventListener('click', () => {
        this.secretSubMode = 'group';
        this.secretTabGroupBtn.classList.add('active');
        if (this.secretTabSingleBtn) this.secretTabSingleBtn.classList.remove('active');
        if (this.secretSingleBody) this.secretSingleBody.style.display = 'none';
        if (this.secretGroupBody) this.secretGroupBody.style.display = 'flex';
        this.renderMatchUI();
        this.updateStatusDot();
      });
    }

    const repeatToggle = document.getElementById('repeatScriptToggle');
    if (repeatToggle) {
      repeatToggle.addEventListener('change', (e) => {
        this.repeatWhenEmpty = !e.target.checked;
      });
    }

    const addAllToScriptBtn = document.getElementById('addAllToScriptBtn');
    if (addAllToScriptBtn) {
      addAllToScriptBtn.addEventListener('click', () => {
        this.entries.forEach(name => {
          this.secretQueue.push(name);
        });
        this.updateSecretUI();
      });
    }

    const clearScriptBtn = document.getElementById('clearScriptBtn');
    if (clearScriptBtn) {
      clearScriptBtn.addEventListener('click', () => {
        this.secretQueue = [];
        this.updateSecretUI();
      });
    }

    this.setupSecretDragAndDrop();
  }

  toggleSecretModal() {
    if (!this.secretModal) return;
    const isOpen = this.secretModal.classList.toggle('open');
    if (isOpen) {
      this.updateSecretUI();
      this.renderMatchUI();
    }
  }

  updateStatusDot() {
    if (!this.secretStatusDot) return;
    let hasItems = false;
    if (this.secretSubMode === 'single') {
      hasItems = this.secretQueue.length > 0;
    } else {
      hasItems = this.matches.some(m => (m.teamLeft.members.length > 0 || m.teamRight.members.length > 0));
    }

    if (this.secretModeActive && hasItems) {
      this.secretStatusDot.classList.add('active');
    } else {
      this.secretStatusDot.classList.remove('active');
    }
  }

  updateSecretUI() {
    this.updateStatusDot();
    this.secretSourceCount.textContent = `${this.entries.length} người`;
    this.secretQueueCount.textContent = `${this.secretQueue.length} lượt`;

    if (this.entries.length === 0) {
      this.secretSourceList.innerHTML = '<div class="queue-empty-state">Danh sách trống. Nhập tên vào ô Entries!</div>';
    } else {
      this.secretSourceList.innerHTML = this.entries.map((name, idx) => `
        <div class="source-item" draggable="true" data-name="${escapeHtml(name)}" data-index="${idx}">
          <span>${escapeHtml(name)}</span>
          <button class="btn-add-item" title="Thêm vào thứ tự trúng">+</button>
        </div>
      `).join('');

      this.secretSourceList.querySelectorAll('.source-item').forEach(el => {
        const name = el.getAttribute('data-name');
        el.querySelector('.btn-add-item').addEventListener('click', (e) => {
          e.stopPropagation();
          this.secretQueue.push(name);
          this.updateSecretUI();
        });

        el.addEventListener('dblclick', () => {
          this.secretQueue.push(name);
          this.updateSecretUI();
        });
      });
    }

    if (this.secretQueue.length === 0) {
      this.secretQueueList.innerHTML = `
        <div class="queue-empty-state">
          Chưa có thứ tự nào được chọn.<br>
          Kéo thả hoặc nhấn <b>+</b> từ danh sách bên trái để tạo kịch bản!
        </div>
      `;
    } else {
      this.secretQueueList.innerHTML = this.secretQueue.map((name, idx) => `
        <div class="queue-item" draggable="true" data-index="${idx}">
          <span class="queue-slot-badge">Lượt ${idx + 1}</span>
          <span class="queue-name">${escapeHtml(name)}</span>
          <div class="queue-item-actions">
            ${idx > 0 ? `<button class="btn-queue-order" data-dir="up" data-index="${idx}" title="Đẩy lên trước">▲</button>` : ''}
            ${idx < this.secretQueue.length - 1 ? `<button class="btn-queue-order" data-dir="down" data-index="${idx}" title="Đẩy xuống sau">▼</button>` : ''}
            <button class="btn-queue-del" data-index="${idx}" title="Bỏ khỏi kịch bản">✕</button>
          </div>
        </div>
      `).join('');

      this.secretQueueList.querySelectorAll('.btn-queue-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          const dir = btn.getAttribute('data-dir');
          if (dir === 'up' && idx > 0) {
            [this.secretQueue[idx - 1], this.secretQueue[idx]] = [this.secretQueue[idx], this.secretQueue[idx - 1]];
          } else if (dir === 'down' && idx < this.secretQueue.length - 1) {
            [this.secretQueue[idx + 1], this.secretQueue[idx]] = [this.secretQueue[idx], this.secretQueue[idx + 1]];
          }
          this.updateSecretUI();
        });
      });

      this.secretQueueList.querySelectorAll('.btn-queue-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          this.secretQueue.splice(idx, 1);
          this.updateSecretUI();
        });
      });
    }

    this.setupSecretDragAndDrop();
  }

  setupSecretDragAndDrop() {
    this.secretSourceList.querySelectorAll('.source-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: 'source',
          name: item.getAttribute('data-name')
        }));
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    this.secretQueueList.querySelectorAll('.queue-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: 'queue',
          index: parseInt(item.getAttribute('data-index'), 10)
        }));
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    const queueList = this.secretQueueList;
    queueList.addEventListener('dragover', (e) => {
      e.preventDefault();
      queueList.classList.add('drag-over');
    });

    queueList.addEventListener('dragleave', () => {
      queueList.classList.remove('drag-over');
    });

    queueList.addEventListener('drop', (e) => {
      e.preventDefault();
      queueList.classList.remove('drag-over');
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type === 'source') {
          this.secretQueue.push(data.name);
          this.updateSecretUI();
        } else if (data.type === 'queue') {
          const dropTargetItem = e.target.closest('.queue-item');
          if (dropTargetItem) {
            const targetIndex = parseInt(dropTargetItem.getAttribute('data-index'), 10);
            const sourceIndex = data.index;
            if (sourceIndex !== targetIndex) {
              const [moved] = this.secretQueue.splice(sourceIndex, 1);
              this.secretQueue.splice(targetIndex, 0, moved);
              this.updateSecretUI();
            }
          }
        }
      } catch (err) {
        console.error('Drop error:', err);
      }
    });
  }

  // ==========================================
  // 2-SIDE VERSUS MATCHUPS (2vs2, 4vs4... Even numbers only)
  // ==========================================
  bindMatchModeEvents() {
    // Presets for even matchups
    document.querySelectorAll('.btn-preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-preset-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.getAttribute('data-preset');
        let size = 2;
        if (preset === '2v2') size = 2;
        else if (preset === '4v4') size = 4;
        else if (preset === '6v6') size = 6;
        else if (preset === '8v8') size = 8;
        this.applyMatchPreset(size);
      });
    });

    // Add new match
    document.getElementById('addNewGroupBtn').addEventListener('click', () => {
      const newNum = this.matches.length + 1;
      this.matches.push({
        id: 'match_' + Date.now(),
        name: `Trận ${newNum}`,
        teamSize: 2, // only even number default
        teamLeft: { name: 'Đội Trái (Xanh)', members: [], drawnMembers: [] },
        teamRight: { name: 'Đội Phải (Đỏ)', members: [], drawnMembers: [] }
      });
      this.renderMatchUI();
    });

    // Clear all matches
    document.getElementById('clearAllGroupsBtn').addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa tất cả cặp đấu?')) {
        this.matches = [];
        this.renderMatchUI();
      }
    });

    // Auto distribute players: LEFT first (đủ teamSize) -> then RIGHT (đủ teamSize)!
    document.getElementById('autoDistributeGroupsBtn').addEventListener('click', () => {
      if (this.matches.length === 0) {
        this.applyMatchPreset(2);
      }

      const assigned = new Set();
      this.matches.forEach(m => {
        m.teamLeft.members.forEach(p => assigned.add(p.trim().toLowerCase()));
        m.teamLeft.drawnMembers.forEach(p => assigned.add(p.trim().toLowerCase()));
        m.teamRight.members.forEach(p => assigned.add(p.trim().toLowerCase()));
        m.teamRight.drawnMembers.forEach(p => assigned.add(p.trim().toLowerCase()));
      });

      const unassigned = this.entries.filter(e => !assigned.has(e.trim().toLowerCase()));
      let pIdx = 0;

      for (const m of this.matches) {
        // Fill Left Team first (up to teamSize)
        while (m.teamLeft.members.length + m.teamLeft.drawnMembers.length < m.teamSize && pIdx < unassigned.length) {
          m.teamLeft.members.push(unassigned[pIdx]);
          pIdx++;
        }
        // Then fill Right Team (up to teamSize)
        while (m.teamRight.members.length + m.teamRight.drawnMembers.length < m.teamSize && pIdx < unassigned.length) {
          m.teamRight.members.push(unassigned[pIdx]);
          pIdx++;
        }
      }

      this.renderMatchUI();
    });
  }

  applyMatchPreset(teamSize) {
    this.matches = [
      {
        id: 'match_1',
        name: 'Trận 1',
        teamSize: teamSize,
        teamLeft: { name: 'Đội Trái (Xanh)', members: [], drawnMembers: [] },
        teamRight: { name: 'Đội Phải (Đỏ)', members: [], drawnMembers: [] }
      }
    ];
    this.renderMatchUI();
  }

  renderMatchUI() {
    this.updateStatusDot();
    this.groupSourceCount.textContent = `${this.entries.length} người`;
    this.groupCountPill.textContent = `${this.matches.length} trận`;
    this.groupsSummaryText.textContent = `${this.matches.length} trận đấu đã tạo`;

    // Map which team each player belongs to
    const playerAssignmentMap = new Map();
    this.matches.forEach(m => {
      m.teamLeft.members.forEach(p => playerAssignmentMap.set(p.trim().toLowerCase(), { team: `${m.name} - Trái`, status: 'waiting' }));
      m.teamLeft.drawnMembers.forEach(p => playerAssignmentMap.set(p.trim().toLowerCase(), { team: `${m.name} - Trái`, status: 'drawn' }));
      m.teamRight.members.forEach(p => playerAssignmentMap.set(p.trim().toLowerCase(), { team: `${m.name} - Phải`, status: 'waiting' }));
      m.teamRight.drawnMembers.forEach(p => playerAssignmentMap.set(p.trim().toLowerCase(), { team: `${m.name} - Phải`, status: 'drawn' }));
    });

    // Render Left Player Source List
    if (this.entries.length === 0) {
      this.groupPlayerSourceList.innerHTML = '<div class="queue-empty-state">Danh sách trống. Nhập tên vào ô Entries!</div>';
    } else {
      this.groupPlayerSourceList.innerHTML = this.entries.map((name, idx) => {
        const assignment = playerAssignmentMap.get(name.trim().toLowerCase());
        return `
          <div class="source-item" draggable="true" data-name="${escapeHtml(name)}" data-index="${idx}">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${escapeHtml(name)}</span>
              ${assignment ? `
                <span class="player-status-badge assigned" title="${assignment.team}">
                  ${assignment.status === 'drawn' ? '✓ Đã quay' : assignment.team}
                </span>
              ` : `
                <span class="player-status-badge">Chưa gán</span>
              `}
            </div>
            <button class="btn-add-item" title="Thêm vào vị trí kế tiếp">+</button>
          </div>
        `;
      }).join('');

      this.groupPlayerSourceList.querySelectorAll('.source-item').forEach(el => {
        const name = el.getAttribute('data-name');
        el.querySelector('.btn-add-item').addEventListener('click', (e) => {
          e.stopPropagation();
          this.addPlayerToNextMatchSlot(name);
        });

        el.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'player',
            name: name
          }));
          el.classList.add('dragging');
        });

        el.addEventListener('dragend', () => {
          el.classList.remove('dragging');
        });
      });
    }

    // Render 2-Sided Match Cards
    if (this.matches.length === 0) {
      this.groupsCardsContainer.innerHTML = `
        <div class="queue-empty-state">
          Chưa có trận đấu nào. Bấm vào các mẫu số chẵn trên (2 vs 2, 4 vs 4...) hoặc <b>+ Thêm Cặp Đấu</b>!
        </div>
      `;
      return;
    }

    // Find active match & side currently rolling
    let currentDrawing = null;
    for (const m of this.matches) {
      if (m.teamLeft.members.length > 0) {
        currentDrawing = { matchId: m.id, side: 'left' };
        break;
      } else if (m.teamRight.members.length > 0) {
        currentDrawing = { matchId: m.id, side: 'right' };
        break;
      }
    }

    // ONLY EVEN NUMBERS FOR SIZES: 2, 4, 6, 8, 10
    const evenSizes = [2, 4, 6, 8, 10];

    this.groupsCardsContainer.innerHTML = this.matches.map((m) => {
      // Clean up any excess or duplicates in memory
      const cleanTeam = (team) => {
        const seen = new Set();
        const validMembers = [];
        team.drawnMembers.forEach(p => seen.add(p.trim().toLowerCase()));
        team.members.forEach(p => {
          const key = p.trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            validMembers.push(p);
          }
        });
        const maxAllowed = Math.max(0, m.teamSize - team.drawnMembers.length);
        team.members = validMembers.slice(0, maxAllowed);
      };
      cleanTeam(m.teamLeft);
      cleanTeam(m.teamRight);

      const leftTotal = m.teamLeft.members.length + m.teamLeft.drawnMembers.length;
      const rightTotal = m.teamRight.members.length + m.teamRight.drawnMembers.length;

      const isLeftCompleted = m.teamLeft.drawnMembers.length >= m.teamSize;
      const isRightCompleted = m.teamRight.drawnMembers.length >= m.teamSize;
      const isLeftReady = leftTotal >= m.teamSize;
      const isRightReady = rightTotal >= m.teamSize;

      const isLeftActive = currentDrawing && currentDrawing.matchId === m.id && currentDrawing.side === 'left';
      const isRightActive = currentDrawing && currentDrawing.matchId === m.id && currentDrawing.side === 'right';

      let leftBadgeText = '';
      let leftBadgeClass = '';
      if (isLeftCompleted) {
        leftBadgeText = `✓ Hoàn thành (${m.teamSize}/${m.teamSize})`;
        leftBadgeClass = 'done';
      } else if (isLeftActive) {
        leftBadgeText = `⚡ Đang quay (Lượt ${m.teamLeft.drawnMembers.length + 1}/${m.teamSize})`;
        leftBadgeClass = 'active';
      } else if (isLeftReady) {
        leftBadgeText = `Đã đủ (${m.teamSize}/${m.teamSize})`;
        leftBadgeClass = 'ready';
      } else {
        leftBadgeText = `${leftTotal}/${m.teamSize} người (Lượt 1 ➔ ${m.teamSize})`;
        leftBadgeClass = '';
      }

      let rightBadgeText = '';
      let rightBadgeClass = '';
      if (isRightCompleted) {
        rightBadgeText = `✓ Hoàn thành (${m.teamSize}/${m.teamSize})`;
        rightBadgeClass = 'done';
      } else if (isRightActive) {
        rightBadgeText = `⚡ Đang quay (Lượt ${m.teamRight.drawnMembers.length + 1}/${m.teamSize})`;
        rightBadgeClass = 'active';
      } else if (isRightReady) {
        rightBadgeText = `Đã đủ (${m.teamSize}/${m.teamSize})`;
        rightBadgeClass = 'ready';
      } else {
        rightBadgeText = `${rightTotal}/${m.teamSize} người (Lượt ${m.teamSize + 1} ➔ ${m.teamSize * 2})`;
        rightBadgeClass = '';
      }

      const renderTeamSlots = (team, side) => {
        const slotsHtml = [];
        for (let s = 0; s < m.teamSize; s++) {
          if (s < team.drawnMembers.length) {
            const p = team.drawnMembers[s];
            slotsHtml.push(`
              <div class="group-slot-item completed" title="Đã quay trúng">
                <span>✓ ${s + 1}. ${escapeHtml(p)}</span>
              </div>
            `);
          } else if (s < team.drawnMembers.length + team.members.length) {
            const mIdx = s - team.drawnMembers.length;
            const p = team.members[mIdx];
            slotsHtml.push(`
              <div class="group-slot-item" draggable="true" data-match-id="${m.id}" data-side="${side}" data-player-idx="${mIdx}">
                <span>${s + 1}. ${escapeHtml(p)}</span>
                <button class="btn-slot-remove" data-match-id="${m.id}" data-side="${side}" data-player-idx="${mIdx}" title="Bỏ">✕</button>
              </div>
            `);
          } else {
            slotsHtml.push(`
              <div class="group-slot-item empty-slot" data-match-id="${m.id}" data-side="${side}" data-slot-idx="${s}" title="Kéo thả người vào vị trí này">
                <span class="group-empty-slot-msg">+ Vị trí ${s + 1} (Trống)</span>
              </div>
            `);
          }
        }
        return slotsHtml.join('');
      };

      return `
        <div class="match-card" data-match-id="${m.id}">
          <div class="match-card-header">
            <div class="match-title-box">
              <input type="text" class="match-name-input" value="${escapeHtml(m.name)}" data-match-id="${m.id}" placeholder="Tên trận">
              <select class="match-size-select" data-match-id="${m.id}">
                ${evenSizes.map(s => `
                  <option value="${s}" ${s === m.teamSize ? 'selected' : ''}>Mỗi bên ${s} người (${s} vs ${s})</option>
                `).join('')}
              </select>
            </div>
            <button class="btn-del-group" data-match-id="${m.id}" title="Xóa trận này">🗑️</button>
          </div>

          <!-- 2-Side Versus Grid (Left vs Right) -->
          <div class="match-versus-grid">
            <!-- Left Side Box -->
            <div class="match-side-box left-side ${isLeftActive ? 'active-drawing' : ''} ${isLeftCompleted ? 'completed' : ''}" data-match-id="${m.id}" data-side="left">
              <div class="match-side-header">
                <span class="side-team-name">⬅️ ĐỘI TRÁI</span>
                <span class="side-order-badge ${leftBadgeClass}">
                  ${leftBadgeText}
                </span>
              </div>
              <div class="match-slots-list" data-match-id="${m.id}" data-side="left">
                ${renderTeamSlots(m.teamLeft, 'left')}
              </div>
            </div>

            <!-- VS Center Divider -->
            <div class="vs-divider">
              <span>VS</span>
            </div>

            <!-- Right Side Box -->
            <div class="match-side-box right-side ${isRightActive ? 'active-drawing' : ''} ${isRightCompleted ? 'completed' : ''}" data-match-id="${m.id}" data-side="right">
              <div class="match-side-header">
                <span class="side-team-name">➡️ ĐỘI PHẢI</span>
                <span class="side-order-badge ${rightBadgeClass}">
                  ${rightBadgeText}
                </span>
              </div>
              <div class="match-slots-list" data-match-id="${m.id}" data-side="right">
                ${renderTeamSlots(m.teamRight, 'right')}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind match inputs
    this.groupsCardsContainer.querySelectorAll('.match-name-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const mid = e.target.getAttribute('data-match-id');
        const m = this.matches.find(item => item.id === mid);
        if (m) m.name = e.target.value.trim() || 'Trận đấu';
      });
    });

    this.groupsCardsContainer.querySelectorAll('.match-size-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const mid = e.target.getAttribute('data-match-id');
        const m = this.matches.find(item => item.id === mid);
        if (m) {
          m.teamSize = parseInt(e.target.value, 10);
          const maxLeft = Math.max(0, m.teamSize - m.teamLeft.drawnMembers.length);
          if (m.teamLeft.members.length > maxLeft) {
            m.teamLeft.members = m.teamLeft.members.slice(0, maxLeft);
          }
          const maxRight = Math.max(0, m.teamSize - m.teamRight.drawnMembers.length);
          if (m.teamRight.members.length > maxRight) {
            m.teamRight.members = m.teamRight.members.slice(0, maxRight);
          }
          this.renderMatchUI();
        }
      });
    });

    this.groupsCardsContainer.querySelectorAll('.btn-del-group').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mid = btn.getAttribute('data-match-id');
        this.matches = this.matches.filter(item => item.id !== mid);
        this.renderMatchUI();
      });
    });

    this.groupsCardsContainer.querySelectorAll('.btn-slot-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mid = btn.getAttribute('data-match-id');
        const side = btn.getAttribute('data-side');
        const pIdx = parseInt(btn.getAttribute('data-player-idx'), 10);
        const m = this.matches.find(item => item.id === mid);
        if (m) {
          const team = side === 'left' ? m.teamLeft : m.teamRight;
          team.members.splice(pIdx, 1);
          this.renderMatchUI();
        }
      });
    });

    // Drag and Drop into Left or Right Box
    this.groupsCardsContainer.querySelectorAll('.match-side-box').forEach(box => {
      const mid = box.getAttribute('data-match-id');
      const side = box.getAttribute('data-side');

      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('drag-over');
      });

      box.addEventListener('dragleave', () => {
        box.classList.remove('drag-over');
      });

      box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('drag-over');
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.type === 'player') {
            this.addPlayerToMatch(mid, side, data.name);
          }
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  addPlayerToMatch(matchId, side, playerName) {
    const m = this.matches.find(item => item.id === matchId);
    if (!m) return false;

    const clean = playerName.trim().toLowerCase();

    // 1. Prevent duplicate in this match
    const alreadyInMatch =
      m.teamLeft.members.some(p => p.trim().toLowerCase() === clean) ||
      m.teamLeft.drawnMembers.some(p => p.trim().toLowerCase() === clean) ||
      m.teamRight.members.some(p => p.trim().toLowerCase() === clean) ||
      m.teamRight.drawnMembers.some(p => p.trim().toLowerCase() === clean);

    if (alreadyInMatch) {
      alert(`"${playerName}" đã có trong ${m.name}! Không thể thêm trùng lặp.`);
      return false;
    }

    const team = side === 'left' ? m.teamLeft : m.teamRight;
    const currentCount = team.members.length + team.drawnMembers.length;

    // 2. Prevent exceeding teamSize
    if (currentCount >= m.teamSize) {
      alert(`${side === 'left' ? 'Đội Trái' : 'Đội Phải'} của ${m.name} đã đủ ${m.teamSize} người!`);
      return false;
    }

    team.members.push(playerName);
    this.renderMatchUI();
    return true;
  }

  addPlayerToNextMatchSlot(playerName) {
    const clean = playerName.trim().toLowerCase();
    for (const m of this.matches) {
      const alreadyInMatch =
        m.teamLeft.members.some(p => p.trim().toLowerCase() === clean) ||
        m.teamLeft.drawnMembers.some(p => p.trim().toLowerCase() === clean) ||
        m.teamRight.members.some(p => p.trim().toLowerCase() === clean) ||
        m.teamRight.drawnMembers.some(p => p.trim().toLowerCase() === clean);

      if (alreadyInMatch) continue;

      if (m.teamLeft.members.length + m.teamLeft.drawnMembers.length < m.teamSize) {
        m.teamLeft.members.push(playerName);
        this.renderMatchUI();
        return;
      }
      if (m.teamRight.members.length + m.teamRight.drawnMembers.length < m.teamSize) {
        m.teamRight.members.push(playerName);
        this.renderMatchUI();
        return;
      }
    }
    alert(`Không thể thêm: "${playerName}" đã có trong trận hoặc tất cả các vị trí đã đủ người!`);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

window.addEventListener('DOMContentLoaded', () => {
  new WheelApp();
});
