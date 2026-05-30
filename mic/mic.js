const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';

const form = document.getElementById('micForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('micName').value.trim();
    const contact = document.getElementById('micContact').value.trim();
    const business = document.getElementById('micBusiness').value.trim();
    const message = document.getElementById('micMessage').value.trim();

    if (!name) { document.getElementById('micName').focus(); return; }
    if (!contact) { document.getElementById('micContact').focus(); return; }

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
                product: 'mic',
                name,
                contact,
                business,
                message,
            }),
        });
        if (!res.ok) throw new Error('submit failed');
        form.innerHTML = `<p class="thanks">Got it. I'll get back to you within a day.<br>Kevin</p>`;
    } catch (err) {
        status.textContent = 'Something went wrong. Try again?';
        button.disabled = false;
    }
});
