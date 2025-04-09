// ✅ JavaScript: 완전한 콰르토 게임 구현 (말 이미지, 턴, 승리, 로그, 되감기 포함)

const allPieces = [];
let idCounter = 0;

const ATTRS = {
  height: ['tall', 'short'],
  color: ['dark', 'light'],
  shape: ['round', 'square'],
  hole: [true, false],
};

for (let h of ATTRS.height) {
  for (let c of ATTRS.color) {
    for (let s of ATTRS.shape) {
      for (let ho of ATTRS.hole) {
        allPieces.push({
          id: idCounter++, height: h, color: c, shape: s, hole: ho, used: false
        });
      }
    }
  }
}

const board = Array.from({ length: 4 }, () => Array(4).fill(null));
let selectedPiece = null;
let currentPlayer = 0;
let lastPlaced = null;
let isGameOver = false;
let winningCells = [];
let gameLog = [];
let turnCount = 1;
let historyStack = [];

function formatPiece(p) {
  const name = p.height[0] + p.color[0] + p.shape[0] + (p.hole ? 'o' : 'x');
  const img = document.createElement('img');
  img.src = `./pieces/${name}.png`;
  img.alt = name;
  img.title = `${p.height}, ${p.color}, ${p.shape}, ${p.hole ? 'hole' : 'solid'}`;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  return img;
}

function renderBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (winningCells.some(([wr, wc]) => wr === r && wc === c)) {
        cell.classList.add("win");
      } else if (!board[r][c]) {
        cell.classList.add("empty");
        const plus = document.createElement("div");
        plus.innerText = "+";
        plus.style.fontSize = "24px";
        plus.style.color = "#ccc";
        cell.appendChild(plus);
      }

      if (board[r][c]) {
        const img = formatPiece(board[r][c]);
        cell.appendChild(img);
      }

      if (lastPlaced && lastPlaced.row === r && lastPlaced.col === c) {
        cell.classList.add("selected-cell");
      }

      cell.onclick = () => placePiece(r, c);
      boardDiv.appendChild(cell);
    }
  }
}

function renderPieceSelector() {
  const selector = document.getElementById("piece-selector");
  selector.innerHTML = "";

  allPieces.forEach(p => {
    if (p.used) return;
    const btn = document.createElement("div");
    btn.className = "piece";
    if (selectedPiece && selectedPiece.id === p.id) {
      btn.classList.add("selected");
    }
    const img = formatPiece(p);
    btn.appendChild(img);
    btn.onclick = () => selectPiece(p.id);
    selector.appendChild(btn);
  });
}

function selectPiece(pieceId) {
  if (isGameOver || selectedPiece) return;
  const piece = allPieces.find(p => p.id === pieceId && !p.used);
  if (!piece) return;
  selectedPiece = piece;
  log(`${turnCount}턴 - Player ${1 - currentPlayer + 1}: 말 ${getPieceCode(piece)} 선택`);
  renderPieceSelector();
  updateTurnInfo();
}

function placePiece(row, col) {
  if (isGameOver || !selectedPiece || board[row][col]) return;

  historyStack.push({
    board: JSON.parse(JSON.stringify(board)),
    usedPieces: allPieces.map(p => p.used),
    selectedPieceId: selectedPiece.id,
    currentPlayer,
    turnCount,
    lastPlaced: lastPlaced ? { ...lastPlaced } : null,
    gameLog: [...gameLog],
  });

  board[row][col] = selectedPiece;
  selectedPiece.used = true;
  lastPlaced = { row, col };

  log(`${turnCount}턴 - Player ${currentPlayer + 1}: ${getPieceCode(selectedPiece)} → (${row}, ${col})`);

  if (checkWin(row, col)) {
    log(`🎉 Player ${currentPlayer + 1} 승리!`);
    alert(`🎉 플레이어 ${currentPlayer + 1} 승리!`);
    isGameOver = true;
    renderBoard();
    showRestartButton();
    return;
  }

  selectedPiece = null;
  currentPlayer = 1 - currentPlayer;
  turnCount++;
  renderBoard();
  renderPieceSelector();
  updateTurnInfo();
}

function updateTurnInfo() {
  const info = document.getElementById("turn-info");
  info.innerText = !selectedPiece ?
    `플레이어 ${(1 - currentPlayer) + 1}: 말 선택` :
    `플레이어 ${currentPlayer + 1}: 말을 보드에 놓으세요`;
}

function checkWin(row, col) {
  const lines = [
    { cells: board[row].map((_, c) => [row, c]) },
    { cells: board.map((_, r) => [r, col]) },
  ];
  if (row === col) lines.push({ cells: [0,1,2,3].map(i => [i, i]) });
  if (row + col === 3) lines.push({ cells: [0,1,2,3].map(i => [i, 3 - i]) });

  for (let line of lines) {
    const pieces = line.cells.map(([r, c]) => board[r][c]);
    if (isWinningLine(pieces)) {
      winningCells = line.cells;
      return true;
    }
  }
  return false;
}

function isWinningLine(line) {
  if (line.some(p => !p)) return false;
  return ['height', 'color', 'shape', 'hole'].some(attr =>
    line.every(p => p[attr] === line[0][attr])
  );
}

function getPieceCode(p) {
  return p.height[0] + p.color[0] + p.shape[0] + (p.hole ? 'o' : 'x');
}

function log(message) {
  gameLog.push(message);
  const logBox = document.getElementById("log-box");
  logBox.innerHTML = gameLog.map((msg) => `<div>${msg}</div>`).join('');
  logBox.scrollTop = logBox.scrollHeight;
}

function showRestartButton() {
  const ctrl = document.getElementById("controls");
  ctrl.innerHTML = "";
  const btn = document.createElement("button");
  btn.innerText = "🔄 다시 시작";
  btn.onclick = resetGame;
  btn.style.padding = "10px 20px";
  btn.style.fontSize = "16px";
  btn.style.marginTop = "20px";
  ctrl.appendChild(btn);
}

function showUndoButton() {
  const ctrl = document.getElementById("controls");
  const undoBtn = document.createElement("button");
  undoBtn.innerText = "↩ 되감기";
  undoBtn.onclick = undoMove;
  undoBtn.style.marginRight = "10px";
  ctrl.appendChild(undoBtn);
}

function undoMove() {
  if (historyStack.length === 0 || isGameOver) {
    alert("되돌릴 수 있는 턴이 없습니다.");
    return;
  }

  const prev = historyStack[historyStack.length - 1];
  if (prev.lastPlaced) {
    const { row, col } = prev.lastPlaced;
    const boardDiv = document.getElementById("board");
    const index = row * 4 + col;
    const cell = boardDiv.children[index];
    if (cell) {
      cell.classList.add("undoing");
      cell.addEventListener("animationend", () => {
        actuallyUndoMove();
      }, { once: true });
      return;
    }
  }
  actuallyUndoMove();
}

function actuallyUndoMove() {
  const prev = historyStack.pop();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      board[r][c] = prev.board[r][c];
    }
  }
  allPieces.forEach((p, i) => p.used = prev.usedPieces[i]);
  selectedPiece = allPieces.find(p => p.id === prev.selectedPieceId);
  currentPlayer = prev.currentPlayer;
  turnCount = prev.turnCount;
  lastPlaced = prev.lastPlaced;
  gameLog = [...prev.gameLog];
  document.getElementById("log-box").innerHTML = gameLog.map((msg) => `<div>${msg}</div>`).join('');
  renderBoard();
  renderPieceSelector();
  updateTurnInfo();
}

function resetGame() {
  for (let p of allPieces) p.used = false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      board[r][c] = null;
    }
  }
  selectedPiece = null;
  currentPlayer = 0;
  lastPlaced = null;
  isGameOver = false;
  winningCells = [];
  gameLog = [];
  turnCount = 1;
  historyStack = [];
  document.getElementById("log-box").innerHTML = "";
  document.getElementById("controls").innerHTML = "";
  showUndoButton();    // ✅ 되감기 버튼
  showRestartButton(); // ✅ 다시 시작 버튼 (있다면)
  renderBoard();
  renderPieceSelector();
  updateTurnInfo();
 }

// 초기 실행
renderBoard();
renderPieceSelector();
updateTurnInfo();
showUndoButton();

const CACHE_NAME = "quarto-v1";

const OFFLINE_FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/game.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/pieces/tdro.png",
  "/pieces/tdrx.png",
  "/pieces/tdso.png",
  "/pieces/tdsx.png",
  "/pieces/tlro.png",
  "/pieces/tlrx.png",
  "/pieces/tlso.png",
  "/pieces/tlsx.png",
  "/pieces/sdro.png",
  "/pieces/sdrx.png",
  "/pieces/sdso.png",
  "/pieces/sdsx.png",
  "/pieces/slro.png",
  "/pieces/slrx.png",
  "/pieces/slso.png",
  "/pieces/slsx.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_FILES))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

