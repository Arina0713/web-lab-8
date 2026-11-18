const openBtn = document.getElementById('openFormBtn');
const closeBtn = document.getElementById('closeFormBtn');
const overlay = document.getElementById('popupOverlay');
const form = document.getElementById('feedbackForm');
const statusMsg = document.getElementById('statusMessage');
function openPopup() {
    overlay.style.display = 'flex';
    window.history.pushState({ popup: 'open' }, '');
}
function closePopup() {
    overlay.style.display = 'none';
    отправке,
    statusMsg.textContent = '';
}
openBtn.addEventListener('click', openPopup);
closeBtn.addEventListener('click', closePopup);
window.addEventListener('popstate', (event) => {
    closePopup();
});
const formFields = ['name', 'email', 'phone', 'organization', 'message'];
window.addEventListener('DOMContentLoaded', () => {
    formFields.forEach(field => {
        const savedValue = localStorage.getItem(`form_${field}`);
        if (savedValue) {
            const input = form.elements[field];
            if (input.type === 'checkbox') {
                input.checked = savedValue === 'true';
            } else {
                input.value = savedValue;
            }
        }
    });
});
form.addEventListener('input', () => {
    formFields.forEach(field => {
        const input = form.elements[field];
        if (input.type === 'checkbox') {
            localStorage.setItem(`form_${field}`, input.checked);
        } else {
            localStorage.setItem(`form_${field}`, input.value);
        }
    });
});
form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    statusMsg.textContent = 'Отправка...';
    statusMsg.style.color = 'black';
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.consent = formData.get('consent') === 'on';
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json; charset UTF-8',
            },
        });
        if (response.ok) {
            statusMsg.textContent = 'Успешно отправлено!';
            statusMsg.style.color = 'green';
            form.reset();
            formFields.forEach(field => localStorage.removeItem(`form_${field}`));
        } else {
            throw new Error();
        }
    } catch (error) {
        statusMsg.textContent = 'Ошибка при отправке. Попробуйте позже.';
        statusMsg.style.color = 'red';
    }
});