const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';

const QUESTIONS = [
    "What software are you tired of paying for?",
    "Sick of your site looking like every other Squarespace?",
    "What would you fix about your website if it didn't cost $20k?",
    "Tired of DoorDash eating 30% of every order?",
    "What do you wish you had instead of Toast?",
    "Want your own delivery system without paying Uber Eats fees?",
];

const CREDIBILITY = [
    "we built our own POS to replace Toast. yours can be cooler.",
    "we built a small biz a one-of-a-kind site for less than a year of Squarespace.",
    "we built a Chinese restaurant their own delivery app — their drivers, their prices.",
    "we built a contractor his own quote-and-invoice tool. monthly bill gone.",
    "we built a barbershop their own booking + text reminders. one-time cost.",
    "we built a small fleet their own routing + dispatch. no more per-seat fees.",
];

const form = document.getElementById('messForm');
const field = document.getElementById('messField');
const status = document.getElementById('status');
const questionEl = document.getElementById('messQuestion');
const credEl = document.getElementById('credibility');

// Rotate the headline question + the credibility line through several
// framings so visitors recognize their own pain in at least one and
// see multiple concrete examples of work.
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rotating = !REDUCED_MOTION;

function makeRotator(el, items, intervalMs) {
    let idx = 0;
    let timer = null;
    function show(text) {
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = text;
            el.style.opacity = '1';
        }, 350);
    }
    function start() {
        if (timer || !rotating) return;
        timer = setInterval(() => {
            idx = (idx + 1) % items.length;
            show(items[idx]);
        }, intervalMs);
    }
    function stop() {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
    }
    return { start, stop };
}

const questionRotator = makeRotator(questionEl, QUESTIONS, 7000);
const credRotator = makeRotator(credEl, CREDIBILITY, 9000);

// Pause headline rotation while the visitor is engaging with the field —
// don't pull the question out from under them mid-thought. The credibility
// line keeps rotating since it's peripheral.
field.addEventListener('focus', questionRotator.stop);
field.addEventListener('blur', () => {
    if (!field.value.trim()) questionRotator.start();
});

questionRotator.start();
credRotator.start();

// --- Two-stage submission flow ---
// Stage 1: capture the vent (don't send yet)
// Stage 2: gently ask for email so we can reply (skippable)
// Final:   send vent + (optional) email to Formspree, show thanks

let stage = 1;
let pendingVent = null;

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (stage === 1) {
        const message = field.value.trim();
        if (!message) { field.focus(); return; }
        pendingVent = { mess: message, prompt: questionEl.textContent };
        showEmailStage();
    } else {
        const email = (document.getElementById('emailField').value || '').trim();
        if (!email) { document.getElementById('emailField').focus(); return; }
        await sendFinal(email);
    }
});

function showEmailStage() {
    stage = 2;
    form.innerHTML = `
        <p class="stage-prompt">Got it. Want to hear back?</p>
        <input
            id="emailField"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="your@email.com"
            required
            aria-label="Your email"
        >
        <button type="submit">Send</button>
        <button type="button" id="skipBtn" class="skip-link">no thanks, I just needed to vent</button>
        <p class="status" id="status" role="status" aria-live="polite"></p>
    `;
    setTimeout(() => document.getElementById('emailField').focus(), 50);
    document.getElementById('skipBtn').addEventListener('click', () => sendFinal(null));
}

async function sendFinal(email) {
    const status = document.getElementById('status');
    const buttons = form.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    if (status) status.textContent = 'Sending…';
    questionRotator.stop();
    credRotator.stop();

    const payload = { ...pendingVent };
    if (email) payload.email = email;

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
        const msg = email
            ? "All set. We'll be in touch soon."
            : "Got it. Thanks for venting.";
        form.innerHTML = `<p class="thanks">${msg}</p>`;
    } catch (err) {
        if (status) status.textContent = 'Something went wrong. Try again?';
        buttons.forEach(b => b.disabled = false);
    }
}
