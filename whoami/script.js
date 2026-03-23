let puzzles = [];
let current = 0;

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

function getCurrentPuzzle() {
  return puzzles[current];
}

function buildQuestionText(puzzle) {
  if (!puzzle) return "No puzzle found.";

  if (puzzle.ui) {
    const parts = [];

    if (puzzle.ui.setup) {
      parts.push(puzzle.ui.setup);
    }

    if (Array.isArray(puzzle.ui.clues) && puzzle.ui.clues.length > 0) {
      const clueText = puzzle.ui.clues
        .map((clue, index) => `${index + 1}. ${clue}`)
        .join("\n");
      parts.push(`Clues:\n${clueText}`);
    }

    if (puzzle.ui.prompt) {
      parts.push(puzzle.ui.prompt);
    }

    return parts.join("\n\n");
  }

  return puzzle.question || "No puzzle found.";
}

function getAnswerText(puzzle) {
  if (!puzzle) return "No answer available.";
  if (typeof puzzle.answer === "string" && puzzle.answer.trim()) {
    return puzzle.answer.trim();
  }
  return "No answer available.";
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
    questionEl.textContent = buildQuestionText(currentPuzzle);
    questionEl.style.whiteSpace = "pre-line";
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
    label.textContent = "Who Am I?";
  }

  if (prevBtn) prevBtn.disabled = current === 0;
  if (nextBtn) nextBtn.disabled = current === puzzles.length - 1;

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

  const currentPuzzle = getCurrentPuzzle();
  const shareText = buildQuestionText(currentPuzzle);

  const shareData = {
    title: `Who Am I? | Riddle World`,
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
