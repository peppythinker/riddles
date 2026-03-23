let puzzles = [];
let current = 0;

async function loadPuzzles() {
  try {
    const res = await fetch("logic-puzzles.json");

    if (!res.ok) {
      throw new Error("Could not load logic-puzzles.json");
    }

    const data = await res.json();

    // Supports either:
    // 1) { category: "logic-puzzles", questions: [...] }
    // 2) [ ... ]
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

    if (questionEl) questionEl.textContent = "Could not load logic puzzles.";
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

  questionEl.textContent = currentPuzzle.question || "No puzzle question found.";
  answerBox.textContent = currentPuzzle.answer || "No answer available.";
  answerBox.style.display = "none";
  answerBtn.textContent = "Show Answer";
  shareStatus.textContent = "";
  label.textContent = `Logic Puzzle #${current + 1}`;

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

  const currentPuzzle = puzzles[current];

  const shareData = {
    title: `Logic Puzzle #${current + 1} | Riddle World`,
    text: currentPuzzle.question,
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
