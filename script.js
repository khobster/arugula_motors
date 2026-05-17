const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';

const form = document.getElementById('messForm');
const field = document.getElementById('messField');
const status = document.getElementById('status');
const button = form.querySelector('button');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = field.value.trim();
    if (!message) {
        field.focus();
        return;
    }

    status.textContent = 'Sending…';
    button.disabled = true;

    try {
        const res = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mess: message }),
        });
        if (!res.ok) throw new Error('submit failed');
        form.innerHTML = '<p class="thanks">Thanks — we\'ll be in touch.</p>';
    } catch (err) {
        status.textContent = 'Something went wrong. Try again?';
        button.disabled = false;
    }
});
