const FORMCARRY_ENDPOINT = 'https://formcarry.com/s/b0mU8hjHBf4';
const STORAGE_KEY = 'feedbackFormData';
const modal = document.getElementById('modal');
const openBtn = document.getElementById('openFormBtn');
const closeBtn = document.getElementById('closeFormBtn');
const form = document.getElementById('feedbackForm');
const statusEl = document.getElementById('formStatus');
const fioInput = document.getElementById('fio');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const agreeBox = document.getElementById('agree');
const FIELDS = ['fio', 'email', 'phone', 'org', 'message'];
function openModal() {
    modal.classList.remove('hidden');
    history.pushState({ form: true }, '', '#feedback');
}
function closeModal() {
    modal.classList.add('hidden');
}
openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', () => history.back());
popstate
window.addEventListener('popstate', closeModal);
fioInput.addEventListener('input', () => {
    fioInput.value = fioInput.value.replace(/[^А-ЯЁа-яёA-Za-z\s-]/g, '');
});
phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
});
function validate() {
    const errors = [];
    if (!fioInput.value.trim()) {
        errors.push('Заполните ФИО');
    } else if (fioInput.value.trim().split(/\s+/).length < 2) {
        errors.push('В ФИО нужно минимум два слова');
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailInput.value.trim()) {
        errors.push('Заполните Email');
    } else if (!emailRe.test(emailInput.value.trim())) {
        errors.push('Некорректный Email');
    }
    if (!phoneInput.value.trim()) {
        errors.push('Заполните телефон');
    } else if (phoneInput.value.length < 10) {
        errors.push('В телефоне должно быть минимум 10 цифр');
    }
    if (!document.getElementById('org').value.trim()) errors.push('Заполните организацию');
    if (!document.getElementById('message').value.trim()) errors.push('Заполните сообщение');
    if (!agreeBox.checked) errors.push('Нужно согласие на обработку данных');
    return errors;
}
function saveToStorage() {
    const data = {};
    FIELDS.forEach(id => data[id] = document.getElementById(id).value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function restoreFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        FIELDS.forEach(id => {
            if (data[id] !== undefined) document.getElementById(id).value = data[id];
        });
        agreeBox.checked = data.agree === true;
    } catch (e) { /* повреждённые данные игнорируем */ }
}
function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
}
form.addEventListener('input', saveToStorage);
agreeBox.addEventListener('change', saveToStorage);
restoreFromStorage();
function showStatus(text, ok) {
    statusEl.textContent = text;
    statusEl.className = 'form-status ' + (ok ? 'ok' : 'err');
}
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
        showStatus(errors[0], false);
        return;
    }
    showStatus('Отправка...', true);
    const data = {
        fio: fioInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value,
        org: document.getElementById('org').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    try {
        const response = await fetch(FORMCARRY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.code === 200) {
            clearStorage(); 
            form.reset();
            showStatus('Сообщение отправлено!', true);
            setTimeout(() => { history.back(); }, 1500);
        } else {
            showStatus('Ошибка сервера: ' + (result.message || 'попробуйте позже'), false);
        }
    } catch (err) {
        showStatus('Ошибка сети. Проверьте интернет и попробуйте снова.', false);
    }
});
