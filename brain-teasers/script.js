let riddles = [];
let current = 0;

async function loadRiddles() {
  const res = await fetch('riddles.json');
  riddles = await res.json();
  showRiddle();
}

function showRiddle() {
  document.querySelector('.riddle-question').textContent = riddles[current].question;
  document.getElementById('answerBox').textContent = riddles[current].answer;

  document.getElementById('answerBox').style.display = 'none';
  document.querySelector('.answer-btn').textContent = 'Show Answer';

  document.querySelector('.prev').disabled = current === 0;
  document.querySelector('.next').disabled = current === riddles.length - 1;

  // ✅ Progress text
  document.getElementById('progressText').textContent =
    `Riddle ${current + 1} of ${riddles.length}`;

  // ✅ Progress bar
  const percent = ((current + 1) / riddles.length) * 100;
  document.getElementById('progressFill').style.width = percent + '%';
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

function toggleAnswer() {
  const box = document.getElementById('answerBox');
  const btn = document.querySelector('.answer-btn');

  if (box.style.display === 'block') {
    box.style.display = 'none';
    btn.textContent = 'Show Answer';
  } else {
    box.style.display = 'block';
    btn.textContent = 'Hide Answer';
  }
}

loadRiddles();
