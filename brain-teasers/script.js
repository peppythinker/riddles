let riddles = [];
let current = 0;

async function loadRiddles() {
  try {
    const res = await fetch('riddles.json');
    riddles = await res.json();

    const params = new URLSearchParams(window.location.search);
    const rParam = parseInt(params.get('r'), 10);

    if (!isNaN(rParam) && rParam >= 1 && rParam <= riddles.length) {
      current = rParam - 1;
    }

    showRiddle();
  } catch (error) {
    document.querySelector('.riddle-question').textContent = 'Could not load riddles.';
  }
}

function updateUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('r', current + 1);
  window.history.replaceState({}, '', url);
}

function showRiddle() {
  if (!riddles.length) return;

  document.querySelector('.riddle-question').textContent = riddles[current].question;
  document.getElementById('answerBox').textContent = riddles[current].answer;
  document.getElementById('answerBox').style.display = 'none';
  document.querySelector('.answer-btn').textContent = 'Show Answer';
  document.getElementById('shareStatus').textContent = '';

  document.querySelector('.prev').disabled = current === 0;
  document.querySelector('.next').disabled = current === riddles.length - 1;

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

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * riddles.length);
  } while (randomIndex === current);

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
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set('r', current + 1);

  const shareData = {
    title: 'Brain Teaser | Riddle World',
    text: riddles[current].question,
    url: shareUrl.toString()
  };

  const status = document.getElementById('shareStatus');

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      status.textContent = 'Riddle shared.';
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl.toString());
      status.textContent = 'Link copied to clipboard.';
    } else {
      status.textContent = shareUrl.toString();
    }
  } catch (error) {
    status.textContent = 'Share canceled.';
  }
}

loadRiddles();
