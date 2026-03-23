let puzzles = [];
let current = 0;
let revealedClueCount = 0;
let cluesExpanded = false;

async function loadPuzzles() {
  try {
    const res = await fetch("whoami.json");

    if (!res.ok) {
      throw new Error("Could not load whoami.json");
    }

    const data = await res.json();
    puzzles = Array.isArray(data) ? data : data.questions;

    if (!Array.isArray(puzzles) || puzzles.length === 0) {
      throw new Error("No Who Am I puzzles found.");
    }

    const params = new URLSearchParams(window.location.search);
    const rParam = parseInt(params.get("r"), 10);

    if (!isNaN(rParam) && rParam >= 1 && rParam <= puzzles.length) {
      current = rParam - 1;
    }

    showPuzzle();
  } catch (error) {
    console.error(error);

    const questionEl = document.querySelector(".riddle-question");
    const label = document.getElementById("riddleLabel");
    const answerBox = document.getElementById("answerBox");
    const shareStatus = document.getElementById("shareStatus");

    if (questionEl) questionEl.textContent = "Could not load Who Am I puzzles.";
    if (label) label.textContent = "Error";
    if (answerBox) {
      answerBox.style.display = "none";
      answerBox.textContent = "";
    }
    if (shareStatus) shareStatus.textContent = "";
  }
}

function updateUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("r", current + 1);
  window.history.replaceState({}, "", url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCurrentPuzzle() {
  return puzzles[current];
}

function getPuzzleClues(puzzle) {
  if (puzzle?.ui && Array.isArray(puzzle.ui.clues)) {
    return puzzle.ui.clues;
  }
  return [];
}

function getVisibleClues(puzzle) {
  const clues = getPuzzleClues(puzzle);
  return clues.slice(0, revealedClueCount);
}

function formatPuzzleHtml(puzzle) {
  if (puzzle.ui && (puzzle.ui.setup || puzzle.ui.clues || puzzle.ui.prompt)) {
    const allClues = getPuzzleClues(puzzle);
    const visibleClues = getVisibleClues(puzzle);
    const hasMoreClues = revealedClueCount < allClues.length;

    let html = `<div class="logic-puzzle-ui">`;

    if (puzzle.ui.setup) {
      html += `
        <div class="logic-section logic-setup">
          <div class="logic-heading">Setup</div>
          <div class="logic-text">${escapeHtml(puzzle.ui.setup)}</div>
        </div>
      `;
    }

    html += `
      <div class="logic-section logic-clues">
        <button class="clue-toggle-btn" onclick="toggleClues()" type="button">
          ${cluesExpanded ? "Hide Clues" : "Show Clues"}
        </button>
    `;

    if (cluesExpanded) {
      html += `<div class="clues-panel">`;

      if (visibleClues.length > 0) {
        html += `
          <ol class="logic-clue-list">
            ${visibleClues.map(clue => `<li>${escapeHtml(clue)}</li>`).join("")}
          </ol>
        `;
      }

      if (hasMoreClues) {
        html += `
          <button class="reveal-clue-btn" onclick="revealNextClue()" type="button">
            Reveal Next Clue
          </button>
        `;
      } else if (allClues.length > 0) {
        html += `<div class="all-clues-shown">All clues revealed</div>`;
      }

      html += `</div>`;
    }

    html += `</div>`;

    if (puzzle.ui.prompt) {
      html += `
        <div class="logic-section logic-question">
          <div class="logic-heading">Question</div>
          <div class="logic-text">${escapeHtml(puzzle.ui.prompt)}</div>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }

  if (puzzle.question) {
    return `
      <div class="logic-puzzle-ui logic-preformatted">
        ${escapeHtml(puzzle.question).replace(/\n/g, "<br>")}
      </div>
    `;
  }

  return `<div class="logic-puzzle-ui">No puzzle found.</div>`;
}

function getAnswerText(puzzle) {
  if (!puzzle) return "No answer available.";
  if (typeof puzzle.answer === "string" && puzzle.answer.trim()) {
    return puzzle.answer.trim();
  }
  return "No answer available.";
}

function resetPuzzleViewState() {
  cluesExpanded = false;
  revealedClueCount = 0;
}

function showPuzzle() {
  if (!puzzles.length) return;

  const questionEl = document.querySelector(".riddle-question");
  const answerBox = document.getElementById("answerBox");
  const answerBtn = document.querySelector(".answer-btn");
  const shareStatus = document.getElementById("shareStatus");
  const label = document.getElementById("riddleLabel");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  const currentPuzzle = getCurrentPuzzle();

  if (questionEl) {
    questionEl.innerHTML = formatPuzzleHtml(currentPuzzle);
  }

  if (answerBox) {
    answerBox.textContent = getAnswerText(currentPuzzle);
    answerBox.style.display = "none";
  }

  if (answerBtn) {
    answerBtn.textContent = "Show Answer";
  }

  if (shareStatus) {
    shareStatus.textContent = "";
  }

  if (label) {
    label.textContent = `Who Am I? #${current + 1}`;
  }

  if (prevBtn) prevBtn.disabled = current === 0;
  if (nextBtn) nextBtn.disabled = current === puzzles.length - 1;

  updateUrl();
}

function rerenderPuzzleOnly() {
  const questionEl = document.querySelector(".riddle-question");
  if (!questionEl || !puzzles.length) return;
  questionEl.innerHTML = formatPuzzleHtml(getCurrentPuzzle());
}

function toggleClues() {
  const puzzle = getCurrentPuzzle();
  const clues = getPuzzleClues(puzzle);

  cluesExpanded = !cluesExpanded;

  if (cluesExpanded && revealedClueCount === 0 && clues.length > 0) {
    revealedClueCount = 1;
  }

  rerenderPuzzleOnly();
}

function revealNextClue() {
  const puzzle = getCurrentPuzzle();
  const clues = getPuzzleClues(puzzle);

  if (revealedClueCount < clues.length) {
    revealedClueCount += 1;
    rerenderPuzzleOnly();
  }
}

function nextRiddle() {
  if (current < puzzles.length - 1) {
    current++;
    resetPuzzleViewState();
    showPuzzle();
  }
}

function prevRiddle() {
  if (current > 0) {
    current--;
    resetPuzzleViewState();
    showPuzzle();
  }
}

function shuffleRiddle() {
  if (puzzles.length < 2) return;

  let randomIndex = current;
  while (randomIndex === current) {
    randomIndex = Math.floor(Math.random() * puzzles.length);
  }

  current = randomIndex;
  resetPuzzleViewState();
  showPuzzle();
}

function toggleAnswer() {
  const answerBox = document.getElementById("answerBox");
  const button = document.querySelector(".answer-btn");

  if (!answerBox || !button) return;

  if (answerBox.style.display === "block") {
    answerBox.style.display = "none";
    button.textContent = "Show Answer";
  } else {
    answerBox.style.display = "block";
    button.textContent = "Hide Answer";
  }
}

async function shareRiddle() {
  if (!puzzles.length) return;

  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set("r", current + 1);

  const currentPuzzle = getCurrentPuzzle();
  const shareText =
    currentPuzzle.ui?.prompt ||
    currentPuzzle.question ||
    `Who Am I? #${current + 1}`;

  const shareData = {
    title: `Who Am I? #${current + 1} | Riddle World`,
    text: shareText,
    url: shareUrl.toString()
  };

  const status = document.getElementById("shareStatus");

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      if (status) status.textContent = "Puzzle shared.";
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl.toString());
      if (status) status.textContent = "Link copied to clipboard.";
      return;
    }

    window.prompt("Copy this puzzle link:", shareUrl.toString());
    if (status) status.textContent = "Copy the link above.";
  } catch (error) {
    window.prompt("Copy this puzzle link:", shareUrl.toString());
    if (status) status.textContent = "Copy the link above.";
  }
}

loadPuzzles();
