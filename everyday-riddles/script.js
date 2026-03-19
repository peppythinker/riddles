let riddles = [];
let current = 0;

async function loadRiddles() {
  try {
    const res = await fetch('riddles.json');

    if (!res.ok) {
      throw new Error('Could not load riddles.json');
    }

    riddles = await res.json();

    if (!Array.isArray(riddles) || riddles.length === 0) {
      throw new Error('No riddles found.');
    }

    const params = new URLSearchParams(window.location.search);
    const rParam = parseInt(params.get('r'), 10);

    if (!isNaN(rParam) && rParam >= 1 && rParam <= riddles.length) {
      current = rParam - 1;
    }

    showRiddle();
  } catch (error) {
    console.error(error);
    document.querySelector('.riddle-question').textContent = 'Could not load riddles.';
    const label = document.getElementById('riddleLabel');
    const answerBox = document.getElementById('answerBox');
    const shareStatus = document.getElementById('shareStatus');

    if (label) label.textContent = 'Error';
    if (answerBox) answerBox.style.display = 'none';
    if (shareStatus) shareStatus.textContent = '';
  }
}

function updateUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('r', current + 1);
  window.history.replaceState({}, '', url);
}

function showRiddle() {
  if (!riddles.length) return;

  const questionEl = document.querySelector('.riddle-question');
  const answerBox = document.getElementById('answerBox');
  const answerBtn = document.querySelector('.answer-btn');
  const shareStatus = document.getElementById('shareStatus');
  const label = document.getElementById('riddleLabel');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');

  questionEl.textContent = riddles[current].question;
  answerBox.textContent = riddles[current].answer;
  answerBox.style.display = 'none';
  answerBtn.textContent = 'Show Answer';
  shareStatus.textContent = '';
  label.textContent = `Everyday Riddle #${current + 1}`;

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === riddles.length - 1;

  updateUrl();
}

function nextRiddle() {
  if (current < riddles.length - 1) {
    current++;
    showRiddle();
  }
}

function prevRiddle() {
  if (current > 0) {
    current--;
    showRiddle();
  }
}

function shuffleRiddle() {
  if (riddles.length < 2) return;

  let randomIndex = current;

  while (randomIndex === current) {
    randomIndex = Math.floor(Math.random() * riddles.length);
  }

  current = randomIndex;
  showRiddle();
}

function toggleAnswer() {
  const answerBox = document.getElementById('answerBox');
  const button = document.querySelector('.answer-btn');

  if (answerBox.style.display === 'block') {
    answerBox.style.display = 'none';
    button.textContent = 'Show Answer';
  } else {
    answerBox.style.display = 'block';
    button.textContent = 'Hide Answer';
  }
}

async function shareRiddle() {
  if (!riddles.length) return;

  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set('r', current + 1);

  const shareData = {
    title: `Everyday Riddle #${current + 1} | Riddle World`,
    text: riddles[current].question,
    url: shareUrl.toString()
  };

  const status = document.getElementById('shareStatus');

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      status.textContent = 'Riddle shared.';
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl.toString());
      status.textContent = 'Link copied to clipboard.';
      return;
    }

    window.prompt('Copy this riddle link:', shareUrl.toString());
    status.textContent = 'Copy the link above.';
  } catch (error) {
    window.prompt('Copy this riddle link:', shareUrl.toString());
    status.textContent = 'Copy the link above.';
  }
}

loadRiddles();
