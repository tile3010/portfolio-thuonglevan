(() => {
    const dialog = document.getElementById('freelance-case-picker');
    if (!dialog) return;

    let lastTrigger = null;
    document.querySelectorAll('[data-open-case-picker]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            lastTrigger = trigger;
            dialog.showModal();
        });
    });

    dialog.querySelector('[data-close-case-picker]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => lastTrigger?.focus());
})();
