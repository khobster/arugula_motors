const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';

const QUESTIONS = [
    "What software are you tired of paying for?",
    "What would you fix about your website if it didn't cost $20k?",
    "Tired of DoorDash eating 30% of every order?",
    "What do you wish you had instead of Toast?",
    "Want your own delivery system without paying Uber Eats fees?",
];

const form = document.getElementById('messForm');
const field = document.getElementById('messField');
const status = document.getElementById('status');
const button = form.querySelector('button');
const questionEl = document.getElementById('messQuestion');

// Rotate the headline through different pain-point framings so visitors
// can recognize their own pain in at least one of them.
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let qIdx = 0;
let rotating = !REDUCED_MOTION;
let rotateTimer = null;

function showQuestion(text) {
    questionEl.style.opacity = '0';
    setTimeout(() => {
        questionEl.textContent = text;
        questionEl.style.opacity = '1';
    }, 350);
}

function startRotation() {
    if (rotateTimer || !rotating) return;
    rotateTimer = setInterval(() => {
        qIdx = (qIdx + 1) % QUESTIONS.length;
        showQuestion(QUESTIONS[qIdx]);
    }, 5000);
}

function stopRotation() {
    if (!rotateTimer) return;
    clearInterval(rotateTimer);
    rotateTimer = null;
}

// Pause rotation while the visitor is engaging with the field — don't pull
// the headline out from under them mid-thought.
field.addEventListener('focus', stopRotation);
field.addEventListener('blur', () => {
    if (!field.value.trim() && rotating) startRotation();
});

startRotation();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = field.value.trim();
    if (!message) {
        field.focus();
        return;
    }

    status.textContent = 'Sending…';
    button.disabled = true;
    stopRotation();

    try {
        const res = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mess: message, prompt: questionEl.textContent }),
        });
        if (!res.ok) throw new Error('submit failed');
        form.innerHTML = '<p class="thanks">Thanks — we\'ll be in touch.</p>';
    } catch (err) {
        status.textContent = 'Something went wrong. Try again?';
        button.disabled = false;
    }
});
