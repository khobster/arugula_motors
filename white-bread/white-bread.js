const FORMSPREE_URL = 'https://formspree.io/f/mvzyogdl';

const form = document.getElementById('whiteBreadForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('wbName').value.trim();
    const contact = document.getElementById('wbContact').value.trim();
    const shop = document.getElementById('wbShop').value.trim();
    const message = document.getElementById('wbMessage').value.trim();

    if (!name) { document.getElementById('wbName').focus(); return; }
    if (!contact) { document.getElementById('wbContact').focus(); return; }

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
                product: 'white-bread',
                name,
                contact,
                shop,
                message,
            }),
        });
        if (!res.ok) throw new Error('submit failed');
        form.innerHTML = `<p class="thanks">Got it. I'll get back to you within a day. — Kevin</p>`;
    } catch (err) {
        status.textContent = 'Something went wrong. Try again?';
        button.disabled = false;
    }
});
