(function () {
    const searchInput = document.querySelector('[data-manual-search]');
    const targets = Array.from(document.querySelectorAll('[data-search-target]'));
    const empty = document.querySelector('[data-empty-search]');

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function targetText(target) {
        return normalize(`${target.textContent || ''} ${target.dataset.keywords || ''}`);
    }

    function applySearch() {
        const keyword = normalize(searchInput?.value || '');
        let visibleCount = 0;

        targets.forEach(target => {
            const matched = !keyword || targetText(target).includes(keyword);
            target.classList.toggle('is-hidden', !matched);
            if (matched) visibleCount += 1;
        });

        if (empty) empty.style.display = visibleCount ? 'none' : 'block';
    }

    if (searchInput) {
        searchInput.addEventListener('input', applySearch);
        applySearch();
    }
})();
