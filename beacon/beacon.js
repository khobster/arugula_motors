const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';

const form = document.getElementById('beaconForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('bName').value.trim();
    const contact = document.getElementById('bContact').value.trim();
    const business = document.getElementById('bBusiness').value.trim();
    const message = document.getElementById('bMessage').value.trim();

    if (!name) { document.getElementById('bName').focus(); return; }
    if (!contact) { document.getElementById('bContact').focus(); return; }

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
                product: 'beacon',
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
