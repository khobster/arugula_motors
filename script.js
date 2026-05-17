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
const button = form.querySelector('button');
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

const questionRotator = makeRotator(questionEl, QUESTIONS, 5000);
const credRotator = makeRotator(credEl, CREDIBILITY, 7000);

// Pause headline rotation while the visitor is engaging with the field —
// don't pull the question out from under them mid-thought. The credibility
// line keeps rotating since it's peripheral.
field.addEventListener('focus', questionRotator.stop);
field.addEventListener('blur', () => {
    if (!field.value.trim()) questionRotator.start();
});

questionRotator.start();
credRotator.start();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = field.value.trim();
    if (!message) {
        field.focus();
        return;
    }

    status.textContent = 'Sending…';
    button.disabled = true;
    questionRotator.stop();
    credRotator.stop();

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
