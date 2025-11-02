// Zakładki
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('show');
  });
});

// Kalkulator (prosty, ale bezpieczny eval)
const display = document.getElementById('display');
document.querySelector('.keys').addEventListener('click', e=>{
  const b = e.target.closest('button'); if(!b) return;
  const v = b.dataset.value, a = b.dataset.action;
  if(v){
    const parts = display.value.split(/([+\-*/])/);
    const last = parts[parts.length-1];
    if(v==='.' && last.includes('.')) return;
    display.value += v;
  } else if(a==='clear'){ display.value='';
  } else if(a==='back'){ display.value = display.value.slice(0,-1);
  } else if(a==='percent'){
    const parts = display.value.split(/([+\-*/])/);
    const last = parts.pop()||'0';
    display.value = parts.join('') + (Number(last)/100);
  } else if(a==='neg'){
    const parts = display.value.split(/([+\-*/])/);
    const last = parts.pop()||'0';
    display.value = parts.join('') + (-Number(last));
  } else if(a==='equals'){
    if(!/^[0-9.+\-*/()\s]+$/.test(display.value)) { display.value='Error'; return; }
    try{
      const out = Function('return (' + display.value + ')')();
      display.value = isFinite(out) ? String(out) : 'Error';
    }catch(_){ display.value='Error'; }
  }
});

// Quiz (ładuje quiz.json)
const quizBody = document.getElementById('quiz-body');
const startBtn = document.getElementById('start');
const nextBtn = document.getElementById('next');

let QUESTIONS = [];
let i = 0, score = 0, locked = false;

async function loadQuestions(){
  const res = await fetch('quiz.json');
  if(!res.ok) throw new Error('Nie mogę wczytać quiz.json');
  QUESTIONS = await res.json();
}

function renderQuestion(){
  locked = false;
  const it = QUESTIONS[i];
  quizBody.innerHTML = '<div style="opacity:.8;font-size:14px">Pytanie ' + (i+1) + ' z ' + QUESTIONS.length + '</div>' +
                       '<h2 style="margin:6px 0 8px;font-size:20px">' + it.question + '</h2>' +
                       '<div class="answers"></div>';
  const box = quizBody.querySelector('.answers');
  it.answers.forEach((t, idx)=>{
    const b = document.createElement('button');
    b.className = 'answer';
    b.textContent = t;
    b.addEventListener('click', ()=>pick(idx));
    box.appendChild(b);
  });
  nextBtn.disabled = true;
}

function pick(choice){
  if(locked) return;
  locked = true;
  const it = QUESTIONS[i];
  const btns = Array.from(document.querySelectorAll('.answer'));
  btns.forEach((b, idx)=>{
    b.disabled = true;
    if(idx===it.correctIndex) b.classList.add('correct');
    if(idx!==it.correctIndex && idx===choice) b.classList.add('wrong');
  });
  if(choice===it.correctIndex) score++;
  nextBtn.disabled = false;
}

function showSummary(){
  quizBody.innerHTML = '<h2>Wynik: ' + score + ' / ' + QUESTIONS.length + '</h2>';
  nextBtn.disabled = true;
  startBtn.textContent = 'Jeszcze raz';
  startBtn.disabled = false;
}

startBtn.addEventListener('click', async ()=>{
  startBtn.disabled = true; nextBtn.disabled = true;
  i=0; score=0;
  try{
    await loadQuestions();
    renderQuestion();
  }catch(e){
    quizBody.innerHTML = '<p style="color:#ff6b6b">Błąd wczytywania quiz.json. Uruchom przez lokalny serwer.</p>';
    startBtn.disabled = false;
  }
});

nextBtn.addEventListener('click', ()=>{
  if(i < QUESTIONS.length-1){ i++; renderQuestion(); }
  else { showSummary(); }
});
