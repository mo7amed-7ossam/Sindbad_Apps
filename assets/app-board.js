(() => {
    const panel = document.querySelector('.float-board');
    const frame = panel.querySelector('iframe');
    const loading = panel.querySelector('.board-loading');
    const missing = panel.querySelector('.board-missing');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const dock = panel.querySelector('.app-dock');
    const dockToggle = panel.querySelector('.dock-toggle');
    const dockButtons = new Map();
    const workspace = panel.querySelector('.board-workspace');
    const loadingIcon = document.createElement('img');
    loadingIcon.className = 'board-loading-icon';
    loadingIcon.alt = '';
    loading.prepend(loadingIcon);
    let resizeMotion, switchMotion;
    let origin, motion, closing = false, generation = 0;

    function iconClip() {
        const icon = origin.querySelector('.icon').getBoundingClientRect();
        const box = panel.getBoundingClientRect();
        return `inset(${Math.max(0, icon.top - box.top)}px ${Math.max(0, box.right - icon.right)}px ${Math.max(0, box.bottom - icon.bottom)}px ${Math.max(0, icon.left - box.left)}px round 21px)`;
    }

    async function morph(opening) {
        const interruptedClip = motion?.playState === 'running' ? getComputedStyle(panel).clipPath : null;
        motion?.cancel();
        if (reducedMotion.matches) return;
        const full = 'inset(0px 0px 0px 0px round 0px)';
        const small = iconClip();
        motion = panel.animate(
            [{ clipPath: interruptedClip || (opening ? small : full) }, { clipPath: opening ? full : small }],
            { duration: opening ? 640 : 460, easing: opening ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,.2,1)', fill: 'both' }
        );
        try { await motion.finished; } catch { /* A close or resize interrupted the motion. */ }
    }

    async function openApp(button) {
        if (closing || (panel.open && origin === button)) return;
        const switching = panel.open;
        origin = button;
        closing = false;
        const current = ++generation;
        // Fade the previous app before navigating; rapid switches continue from the current opacity.
        const opacity = getComputedStyle(frame).opacity;
        switchMotion?.cancel();
        if (switching && !reducedMotion.matches) {
            switchMotion = frame.animate([{ opacity }, { opacity: 0 }], { duration: 150, easing: 'ease-out', fill: 'both' });
            try { await switchMotion.finished; } catch {}
            if (current !== generation || closing) return;
        }
        dockButtons.forEach((item, source) => item.setAttribute('aria-pressed', String(source === button)));
        const name = button.querySelector('.app-name').textContent.trim();
        const target = button.getAttribute('target_link') || '';
        let url;
        if (target && target !== '#') {
            try { const parsed = new URL(target, location.href); if (['http:', 'https:'].includes(parsed.protocol)) url = parsed.href; } catch {}
        }
        panel.querySelector('#board-title').textContent = name;
        loadingIcon.src = button.querySelector('.icon img').src;
        frame.title = `${name} application`;
        loading.hidden = !url;
        missing.hidden = !!url;
        frame.hidden = !url;
        panel.classList.remove('is-loaded');
        switchMotion?.cancel();
        frame.onload = null;
        frame.removeAttribute('src');
        // Navigation overlaps the expansion instead of adding a delay after it.
        if (url) {
            frame.onload = () => { if (generation === current && !closing) panel.classList.add('is-loaded'); };
            frame.src = url;
        }
        if (!switching) {
            panel.classList.add('is-morphing');
            panel.showModal();
            document.body.classList.add('app-is-open');
            await morph(true);
        }
        if (generation !== current || closing) return;
        motion?.cancel();
        panel.classList.remove('is-morphing');
    }

    async function closeApp() {
        if (!panel.open || closing) return;
        closing = true;
        ++generation;
        switchMotion?.cancel();
        resizeMotion?.cancel();
        panel.classList.add('is-morphing');
        await morph(false);
        panel.close();
        motion?.cancel();
        frame.onload = null;
        frame.removeAttribute('src');
        panel.classList.remove('is-loaded', 'is-morphing');
        document.body.classList.remove('app-is-open');
        origin?.focus({ preventScroll: true });
        closing = false;
    }

    document.querySelectorAll('#apps button[target_link]').forEach(button => {
        const name = button.querySelector('.app-name').textContent.trim();
        button.setAttribute('aria-label', `Open ${name}`);
        button.addEventListener('click', () => openApp(button));
        const shortcut = document.createElement('button');
        shortcut.type = 'button';
        shortcut.className = 'dock-app';
        shortcut.setAttribute('aria-label', `Switch to ${name}`);
        shortcut.setAttribute('aria-pressed', 'false');
        shortcut.title = name;
        const img = button.querySelector('.icon img').cloneNode();
        img.alt = '';
        const label = document.createElement('span');
        label.textContent = name;
        shortcut.append(img, label);
        shortcut.addEventListener('click', () => openApp(button));
        panel.querySelector('.dock-items').append(shortcut);
        dockButtons.set(button, shortcut);
    });
    function setDock(expanded) {
        if (closing || panel.classList.contains('is-morphing')) return;
        if (!expanded && dock.contains(document.activeElement)) dockToggle.focus({ preventScroll: true });
        // FLIP: resize the iframe once, then animate the compositor transform.
        // Sample before cancelling so a quick reversal starts exactly where it is now.
        const before = workspace.getBoundingClientRect();
        resizeMotion?.cancel();
        panel.classList.toggle('dock-open', expanded);
        const after = workspace.getBoundingClientRect();
        if (!reducedMotion.matches && after.width && after.height) {
            workspace.style.willChange = 'transform';
            const animation = workspace.animate([
                { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})` },
                { transform: 'translate(0px, 0px) scale(1, 1)' }
            ], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
            resizeMotion = animation;
            animation.finished.catch(() => {}).finally(() => {
                if (resizeMotion === animation) workspace.style.willChange = '';
            });
        }
        dockToggle.setAttribute('aria-expanded', String(expanded));
        const label = `${expanded ? 'Hide' : 'Show'} applications sidebar`;
        dockToggle.setAttribute('aria-label', label);
        dockToggle.title = label;
        dock.inert = !expanded;
    }
    dockToggle.addEventListener('click', () => setDock(!panel.classList.contains('dock-open')));
    panel.querySelector('.board-fullscreen').addEventListener('click', () => setDock(false));
    panel.querySelector('.board-close').addEventListener('click', closeApp);
    window.addEventListener('resize', () => { resizeMotion?.cancel(); workspace.style.willChange = ''; });
    reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { resizeMotion?.cancel(); switchMotion?.cancel(); motion?.cancel(); } });
    panel.addEventListener('cancel', event => { event.preventDefault(); closeApp(); });
    panel.addEventListener('click', event => { if (event.target === panel) closeApp(); });
})();
