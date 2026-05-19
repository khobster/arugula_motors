const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';
const TRAV2TAY_URL = 'https://khobster.github.io/trav2tay/';

const QUESTIONS = [
    "What's eating your time and money?",
    "What's the thing you wish ran itself?",
    "What part of your business drives you up a wall?",
];

const stepEl = document.getElementById('step');
const questionEl = document.getElementById('messQuestion');

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let qIdx = 0;
let qTimer = null;

function showQuestion(text) {
    questionEl.style.opacity = '0';
    setTimeout(() => {
        questionEl.textContent = text;
        questionEl.style.opacity = '1';
    }, 350);
}

function startQuestionRotation() {
    if (qTimer || REDUCED_MOTION) return;
    qTimer = setInterval(() => {
        qIdx = (qIdx + 1) % QUESTIONS.length;
        showQuestion(QUESTIONS[qIdx]);
    }, 7000);
}

function stopQuestionRotation() {
    if (!qTimer) return;
    clearInterval(qTimer);
    qTimer = null;
}

startQuestionRotation();

// --- Three-stage flow ---
// Stage 1: capture the vent (don't send yet)
// Stage 2: ask for email or cell so we can reply
// Stage 3: handoff message + trav2tay easter egg

let stage = 1;
let pendingVent = null;

bindStageOne();

function bindStageOne() {
    const form = document.getElementById('messForm');
    const field = document.getElementById('messField');

    // Pause rotation while the visitor is engaging with the field —
    // don't pull the question out from under them mid-thought.
    field.addEventListener('focus', stopQuestionRotation);
    field.addEventListener('blur', () => {
        if (!field.value.trim()) startQuestionRotation();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = field.value.trim();
        if (!message) { field.focus(); return; }
        stopQuestionRotation();
        pendingVent = { mess: message, prompt: questionEl.textContent };
        showContactStage();
    });
}

function showContactStage() {
    stage = 2;
    stepEl.innerHTML = `
        <h1 class="question">Got it. I'm going to look into this. Where should I send my thoughts?</h1>
        <form id="contactForm" class="form" novalidate>
            <input
                id="contactField"
                name="contact"
                type="text"
                autocomplete="email"
                placeholder="Email or cell number"
                required
                aria-label="Email or cell number"
            >
            <button type="submit">Send</button>
            <p class="status" id="status" role="status" aria-live="polite"></p>
        </form>
    `;
    const contactForm = document.getElementById('contactForm');
    const contactField = document.getElementById('contactField');
    setTimeout(() => contactField.focus(), 50);

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const contact = contactField.value.trim();
        if (!contact) { contactField.focus(); return; }
        await sendFinal(contact);
    });
}

async function sendFinal(contact) {
    const status = document.getElementById('status');
    const button = stepEl.querySelector('button');
    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending…';

    const payload = { ...pendingVent, contact };

    try {
        const res = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('submit failed');
        showHandoff();
    } catch (err) {
        if (status) status.textContent = 'Something went wrong. Try again?';
        if (button) button.disabled = false;
    }
}

function showHandoff() {
    stage = 3;
    stepEl.innerHTML = `
        <p class="thanks">Loud and clear. I'm probably out walking around Charleston talking to local shops right now, but I'll look at this tonight and reach out.</p>
        <p class="easter-egg">P.S. If you need to kill a few minutes today, I built a little game called trav2tay. Try to get old big boy Travis to his boo&mdash;it's tougher than it seems.</p>
        <a class="play-link" href="${TRAV2TAY_URL}" target="_blank" rel="noopener">Play trav2tay</a>
    `;
}
