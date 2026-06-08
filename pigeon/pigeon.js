const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';

const form = document.getElementById('pigeonForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('pigeonName').value.trim();
    const contact = document.getElementById('pigeonContact').value.trim();
    const business = document.getElementById('pigeonBusiness').value.trim();
    const message = document.getElementById('pigeonMessage').value.trim();

    if (!name) { document.getElementById('pigeonName').focus(); return; }
    if (!contact) { document.getElementById('pigeonContact').focus(); return; }

    const button = form.querySelector('button');
    button.disabled = true;
    status.textContent = 'Sending…';

    try {
        const res = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: 'pigeon',
                name,
                contact,
                business,
                message,
            }),
        });
        if (!res.ok) throw new Error('submit failed');
        form.innerHTML = `<p class="thanks">Got it. We'll get back to you within a day.</p>`;
    } catch (err) {
        status.textContent = 'Something went wrong. Try again?';
        button.disabled = false;
    }
});
