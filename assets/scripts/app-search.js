(() => {
    const dialog = document.querySelector('#searchDialog');
    const input = dialog.querySelector('#search');
    const list = dialog.querySelector('#results');
    const form = dialog.querySelector('form');
    const trigger = document.querySelector('#findButton');
    const normalize = value => value.toLowerCase().normalize('NFKC').replace(/[.\-_&]+/g, ' ').replace(/\s+/g, ' ').trim();
    let entries = [];
    let empty;
    function syncViewport() {
        if (!dialog.open) return;
        const viewport = window.visualViewport;
        dialog.style.setProperty('--search-height', `${viewport?.height || window.innerHeight}px`);
        dialog.style.setProperty('--search-top', `${viewport?.offsetTop || 0}px`);
    }
    window.visualViewport?.addEventListener('resize', syncViewport);
    window.visualViewport?.addEventListener('scroll', syncViewport);
    window.addEventListener('resize', syncViewport);

    function choose(source) {
        dialog.close();
        source.click();
    }

    function buildResults() {
        list.replaceChildren();
        entries = [...document.querySelectorAll('#apps button[target_link]')].map(source => {
            const name = source.querySelector('.app-name').textContent.trim();
            const target = source.getAttribute('target_link');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'result';
            button.setAttribute('aria-label', `Open ${name}`);
            const icon = source.querySelector('.icon img').cloneNode();
            icon.alt = '';
            const text = document.createElement('span');
            const title = document.createElement('strong');
            title.textContent = name;
            const description = document.createElement('small');
            description.textContent = target && target !== '#' ? 'Open in your workspace' : 'Link coming soon';
            text.append(title, description);
            const arrow = document.createElement('span');
            arrow.className = 'result-arrow';
            arrow.textContent = '↗';
            arrow.setAttribute('aria-hidden', 'true');
            button.append(icon, text, arrow);
            button.addEventListener('click', () => choose(source));
            list.append(button);
            return { source, button, keywords: normalize(`${name} ${source.closest('.app').dataset.search || ''}`) };
        });
        empty = document.createElement('p');
        empty.className = 'empty';
        empty.setAttribute('role', 'status');
        empty.textContent = 'No apps found. Try another name.';
        empty.hidden = true;
        list.append(empty);
    }

    function filter() {
        const words = normalize(input.value).split(' ').filter(Boolean);
        entries.forEach(entry => { entry.button.hidden = !words.every(word => entry.keywords.includes(word)); });
        empty.hidden = entries.some(entry => !entry.button.hidden);
    }

    function open() {
        if (!dialog.open) {
            buildResults();
            input.value = '';
            filter();
            dialog.showModal();
            syncViewport();
        }
        input.focus();
        input.select();
    }

    trigger.addEventListener('click', open);
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    input.addEventListener('input', filter);
    form.addEventListener('submit', event => {
        event.preventDefault();
        const first = entries.find(entry => !entry.button.hidden);
        if (first) choose(first.source);
    });
    dialog.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            dialog.close();
            return;
        }
        if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
        const visible = entries.filter(entry => !entry.button.hidden);
        if (!visible.length) return;
        event.preventDefault();
        const current = visible.findIndex(entry => entry.button === document.activeElement);
        const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : visible.length - 1)
            : (current + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length;
        visible[next].button.focus();
    });
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            open();
        }
    });
})();
