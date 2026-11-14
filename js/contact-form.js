(() => {
    const customSelect = document.querySelector('[data-custom-select]');
    if (customSelect) {
        const trigger = customSelect.querySelector('.contact-select-trigger');
        const menu = customSelect.querySelector('[role="listbox"]');
        const valueField = customSelect.querySelector('input[name="topic"]');
        const selectedLabel = customSelect.querySelector('[data-selected-label]');
        const options = [...customSelect.querySelectorAll('[role="option"]')];

        const closeMenu = (restoreFocus = false) => {
            menu.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
            if (restoreFocus) trigger.focus();
        };
        const openMenu = (focusSelected = false) => {
            menu.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
            if (focusSelected) options.find((option) => option.getAttribute('aria-selected') === 'true')?.focus();
        };

        trigger.addEventListener('click', () => {
            if (menu.hidden) openMenu();
            else closeMenu();
        });
        trigger.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                openMenu(true);
            }
        });
        options.forEach((option) => option.addEventListener('click', () => {
            valueField.value = option.dataset.value;
            selectedLabel.textContent = option.textContent.trim();
            options.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
            trigger.removeAttribute('aria-invalid');
            const topicError = customSelect.querySelector('#contact-topic-error');
            if (topicError) {
                topicError.textContent = '';
                topicError.hidden = true;
            }
            closeMenu(true);
        }));
        menu.addEventListener('keydown', (event) => {
            const current = options.indexOf(document.activeElement);
            let next = current;
            if (event.key === 'ArrowDown') next = (current + 1) % options.length;
            else if (event.key === 'ArrowUp') next = (current - 1 + options.length) % options.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = options.length - 1;
            else if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
            else return;
            event.preventDefault();
            options[next].focus();
        });
        customSelect.addEventListener('focusout', () => {
            window.setTimeout(() => {
                if (!customSelect.contains(document.activeElement)) closeMenu();
            }, 0);
        });
        document.addEventListener('click', (event) => {
            if (!customSelect.contains(event.target)) closeMenu();
        });
    }

    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitButton = form.querySelector('[type="submit"]');
    const status = form.querySelector('[data-contact-status]');
    let statusState = 'idle';
    const rateLimitKey = 'portfolio-contact-last-success';
    const rateLimitMs = 30_000;
    let cooldownUntil = 0;
    let cooldownTimer;

    try {
        const lastSentAt = Number(localStorage.getItem(rateLimitKey) || 0);
        if (lastSentAt && Date.now() - lastSentAt < rateLimitMs) cooldownUntil = lastSentAt + rateLimitMs;
    } catch { /* Keep form usable if browser storage is unavailable. */ }

    const statusMessages = {
        en: {
            idle: 'Your message will be sent directly to my email.',
            sending: 'Sending your message…',
            success: 'Sent successfully! Thuong will get back to you as soon as possible!',
            error: 'The message could not be sent. Please try again in a moment.',
            cooldown: 'Please wait {seconds} seconds before sending another message.',
        },
        vi: {
            idle: 'Lời nhắn sẽ được gửi trực tiếp đến email của tôi.',
            sending: 'Đang gửi lời nhắn…',
            success: 'Đã gửi thành công! Thuong sẽ liên hệ lại với bạn sớm nhất!',
            error: 'Chưa gửi được lời nhắn. Bạn vui lòng thử lại sau ít phút.',
            cooldown: 'Vui lòng đợi {seconds} giây trước khi gửi lời nhắn tiếp theo.',
        },
    };
    const updateStatus = () => {
        if (!status) return;
        const language = document.documentElement.lang === 'vi' ? 'vi' : 'en';
        const message = statusMessages[language][statusState];
        status.textContent = statusState === 'cooldown'
            ? message.replace('{seconds}', String(Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1000))))
            : message;
        status.classList.toggle('is-success', statusState === 'success');
        status.classList.toggle('is-error', statusState === 'error');
    };
    document.addEventListener('portfolio:languagechange', updateStatus);

    const refreshCooldown = () => {
        const remaining = cooldownUntil - Date.now();
        if (remaining <= 0) {
            clearTimeout(cooldownTimer);
            submitButton.disabled = false;
            if (statusState === 'cooldown') statusState = 'idle';
            updateStatus();
            return;
        }
        submitButton.disabled = true;
        statusState = 'cooldown';
        updateStatus();
        cooldownTimer = window.setTimeout(refreshCooldown, 1000);
    };
    if (cooldownUntil > Date.now()) refreshCooldown();

    const clearFieldError = (field, errorId) => {
        field?.removeAttribute('aria-invalid');
        const error = errorId && form.querySelector(`#${errorId}`);
        if (error) {
            error.textContent = '';
            error.hidden = true;
        }
    };
    const showFieldError = (field, errorId, message) => {
        field?.setAttribute('aria-invalid', 'true');
        const error = form.querySelector(`#${errorId}`);
        if (error) {
            error.textContent = message;
            error.hidden = false;
        }
    };

    const validateForm = () => {
        const nameField = form.elements.namedItem('name');
        const emailField = form.elements.namedItem('email');
        const messageField = form.elements.namedItem('message');
        const topicField = form.elements.namedItem('topic');
        const topicButton = customSelect?.querySelector('.contact-select-trigger');
        const language = document.documentElement.lang === 'vi' ? 'vi' : 'en';
        const errors = language === 'vi'
            ? {
                nameRequired: 'Vui lòng nhập họ tên.',
                nameInvalid: 'Họ tên cần có từ 2 đến 80 ký tự.',
                emailRequired: 'Vui lòng nhập email.',
                emailInvalid: 'Vui lòng nhập địa chỉ email hợp lệ.',
                topic: 'Vui lòng chọn chủ đề bạn muốn trao đổi.',
                messageRequired: 'Vui lòng nhập lời nhắn.',
                messageInvalid: 'Lời nhắn cần có từ 10 đến 2.000 ký tự và tối đa 4 đường dẫn.',
            }
            : {
                nameRequired: 'Please enter your name.',
                nameInvalid: 'Name must be between 2 and 80 characters.',
                emailRequired: 'Please enter your email address.',
                emailInvalid: 'Please enter a valid email address.',
                topic: 'Please choose a topic.',
                messageRequired: 'Please enter a message.',
                messageInvalid: 'Message must be 10–2,000 characters and contain no more than 4 links.',
            };

        nameField.value = nameField.value.replace(/\s+/g, ' ').trim();
        emailField.value = emailField.value.trim();
        messageField.value = messageField.value.trim();
        const invalidFields = [];
        clearFieldError(nameField, 'contact-name-error');
        clearFieldError(emailField, 'contact-email-error');
        clearFieldError(topicButton, 'contact-topic-error');
        clearFieldError(messageField, 'contact-message-error');

        if (!nameField.value) {
            showFieldError(nameField, 'contact-name-error', errors.nameRequired);
            invalidFields.push(nameField);
        } else if (nameField.value.length < 2 || nameField.value.length > 80) {
            showFieldError(nameField, 'contact-name-error', errors.nameInvalid);
            invalidFields.push(nameField);
        }
        if (!emailField.value) {
            showFieldError(emailField, 'contact-email-error', errors.emailRequired);
            invalidFields.push(emailField);
        } else if (emailField.value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(emailField.value)) {
            showFieldError(emailField, 'contact-email-error', errors.emailInvalid);
            invalidFields.push(emailField);
        }

        const allowedTopics = new Set(['SEO project', 'Technical SEO', 'Content and website management', 'Other collaboration']);
        if (!allowedTopics.has(topicField.value)) {
            showFieldError(topicButton, 'contact-topic-error', errors.topic);
            invalidFields.push(topicButton);
        }
        const linkCount = (messageField.value.match(/https?:\/\/|www\./giu) || []).length;
        if (!messageField.value) {
            showFieldError(messageField, 'contact-message-error', errors.messageRequired);
            invalidFields.push(messageField);
        } else if (messageField.value.length < 10 || messageField.value.length > 2000 || linkCount > 4) {
            showFieldError(messageField, 'contact-message-error', errors.messageInvalid);
            invalidFields.push(messageField);
        }

        if (invalidFields.length) {
            statusState = 'idle';
            updateStatus();
            invalidFields[0]?.focus();
            return false;
        }
        return true;
    };

    [form.elements.namedItem('name'), form.elements.namedItem('email'), form.elements.namedItem('message')].forEach((field) => {
        field.addEventListener('input', () => {
            const errorId = { name: 'contact-name-error', email: 'contact-email-error', message: 'contact-message-error' }[field.name];
            clearFieldError(field, errorId);
            if (statusState === 'error' || statusState === 'success') {
                statusState = 'idle';
                updateStatus();
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (submitButton.disabled || form.elements.namedItem('_honey').value) return;
        if (!validateForm()) return;

        const values = new FormData(form);

        const language = document.documentElement.lang === 'vi' ? 'vi' : 'en';
        const topic = values.get('topic');
        const subject = language === 'vi' ? `Liên hệ từ portfolio — ${topic}` : `Portfolio enquiry — ${topic}`;
        const payload = {
            name: values.get('name'),
            email: values.get('email'),
            _replyto: values.get('email'),
            topic,
            message: values.get('message'),
            _subject: subject,
            _template: 'table',
            _honey: '',
        };

        statusState = 'sending';
        updateStatus();
        submitButton.disabled = true;

        try {
            const response = await fetch(form.dataset.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok || result.success === false || result.success === 'false') {
                throw new Error('Form provider rejected the submission');
            }

            form.reset();
            const options = [...form.querySelectorAll('[role="option"]')];
            const defaultOption = options.find((option) => option.dataset.value === 'SEO project');
            options.forEach((option) => option.setAttribute('aria-selected', String(option === defaultOption)));
            const selectedLabel = form.querySelector('[data-selected-label]');
            if (defaultOption && selectedLabel) selectedLabel.textContent = defaultOption.textContent.trim();
            try { localStorage.setItem(rateLimitKey, String(Date.now())); } catch { /* Rate limiting still applies for this page view. */ }
            statusState = 'success';
        } catch (error) {
            statusState = 'error';
        } finally {
            if (statusState === 'success') {
                cooldownUntil = Date.now() + rateLimitMs;
                submitButton.disabled = true;
                updateStatus();
                cooldownTimer = window.setTimeout(() => { submitButton.disabled = false; }, rateLimitMs);
            } else {
                submitButton.disabled = false;
                updateStatus();
            }
        }
    });
})();
