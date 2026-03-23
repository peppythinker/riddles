let puzzles = [];
let current = 0;

async function loadPuzzles() {
  try {
    const res = await fetch("logic.json");

    if (!res.ok) {
      throw new Error("Could not load logic.json");
    }

    const data = await res.json();

    // Supports:
    // 1) [ ... ]
    // 2) { questions: [ ... ] }
    puzzles = Array.isArray(data) ? data : data.questions;

    if (!Array.isArray(puzzles) || puzzles.length === 0) {
      throw new Error("No logic puzzles found.");
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

    if (questionEl) {
      questionEl.textContent = "Could not load logic puzzles.";
    }

    if (label) {
      label.textContent = "Error";
    }

    if (answerBox) {
      answerBox.style.display = "none";
      answerBox.textContent = "";
    }

    if (shareStatus) {
      shareStatus.textContent = "";
    }
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

function formatPuzzleHtml(puzzle) {
  // Best case: structured UI object
  if (puzzle.ui && (puzzle.ui.setup || puzzle.ui.clues || puzzle.ui.prompt)) {
    let html = `<div class="logic-puzzle-ui">`;

    if (puzzle.ui.setup) {
      html += `
        <div class="logic-section logic-setup">
          <div class="logic-heading">Setup</div>
          <div class="logic-text">${escapeHtml(puzzle.ui.setup)}</div>
        </div>
      `;
    }

    if (Array.isArray(puzzle.ui.clues) && puzzle.ui.clues.length > 0) {
      html += `
        <div class="logic-section logic-clues">
          <div class="logic-heading">Clues</div>
          <ol class="logic-clue-list">
            ${puzzle.ui.clues.map(clue => `<li>${escapeHtml(clue)}</li>`).join("")}
          </ol>
        </div>
      `;
    }

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

  // Second best: preformatted ui_text
  if (puzzle.ui_text) {
    return `
      <div class="logic-puzzle-ui logic-preformatted">
        ${escapeHtml(puzzle.ui_text).replace(/\n/g, "<br>")}
      </div>
    `;
  }

  // Fallback: old format
  return `
    <div class="logic-puzzle-ui logic-preformatted">
      ${escapeHtml(puzzle.question || "No puzzle question found.").replace(/\n/g, "<br>")}
    </div>
  `;
}

function getAnswerText(puzzle) {
  if (!puzzle) return "No answer available.";

  if (typeof puzzle.answer === "string" && puzzle.answer.trim()) {
    return puzzle.answer.trim();
  }

  return "No answer available.";
}

function getDifficultyText(puzzle) {
  if (!puzzle || !puzzle.difficulty) return "";
  const value = String(puzzle.difficulty).trim();
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
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

  const currentPuzzle = puzzles[current];

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
    const difficulty = getDifficultyText(currentPuzzle);
    label.textContent = difficulty
      ? `Logic Puzzle #${current + 1} • ${difficulty}`
      : `Logic Puzzle #${current + 1}`;
  }

  if (prevBtn) {
    prevBtn.disabled = current === 0;
  }

  if (nextBtn) {
    nextBtn.disabled = current === puzzles.length - 1;
  }

  updateUrl();
}

function nextRiddle() {
  if (current < puzzles.length - 1) {
    current++;
    showPuzzle();
  }
}

function prevRiddle() {
  if (current > 0) {
    current--;
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

  const currentPuzzle = puzzles[current];
  const shareText =
    currentPuzzle.ui_text ||
    currentPuzzle.question ||
    currentPuzzle.ui?.prompt ||
    `Logic Puzzle #${current + 1}`;

  const shareData = {
    title: `Logic Puzzle #${current + 1} | Riddle World`,
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
