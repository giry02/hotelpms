(function() {
    const STORAGE_KEY = 'pms_vip_criteria';
    const TIER_ORDER = { standard: 0, gold: 1, platinum: 2, diamond: 3 };
    const TIER_LABELS = { standard: 'Standard', gold: 'Gold', platinum: 'Platinum', diamond: 'Diamond' };
    const TIER_LABELS_KO = { standard: '일반', gold: '골드', platinum: '플래티넘', diamond: '다이아몬드' };
    const DEFAULT_CONFIG = {
        vipMinimumTier: 'platinum',
        thresholds: {
            gold: { stays: 5, spend: 2000 },
            platinum: { stays: 10, spend: 5000 },
            diamond: { stays: 20, spend: 10000 }
        }
    };

    function normalizeTier(tier) {
        const value = String(tier || 'standard').toLowerCase();
        if (value.includes('diamond')) return 'diamond';
        if (value.includes('platinum')) return 'platinum';
        if (value.includes('gold') || value === 'vip') return 'gold';
        return 'standard';
    }

    function cloneConfig(config) {
        return JSON.parse(JSON.stringify(config));
    }

    function normalizeConfig(config) {
        const merged = cloneConfig(DEFAULT_CONFIG);
        if (config && typeof config === 'object') {
            if (TIER_ORDER[config.vipMinimumTier] !== undefined) {
                merged.vipMinimumTier = config.vipMinimumTier;
            }
            Object.keys(merged.thresholds).forEach(tier => {
                const source = config.thresholds?.[tier] || {};
                merged.thresholds[tier].stays = Number(source.stays ?? merged.thresholds[tier].stays);
                merged.thresholds[tier].spend = Number(source.spend ?? merged.thresholds[tier].spend);
            });
        }
        return merged;
    }

    function getConfig() {
        try {
            return normalizeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
        } catch(e) {
            return cloneConfig(DEFAULT_CONFIG);
        }
    }

    function saveConfig(config) {
        const normalized = normalizeConfig(config);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    function isVipTier(tier, config = getConfig()) {
        const normalizedTier = normalizeTier(tier);
        const minTier = normalizeTier(config.vipMinimumTier);
        return TIER_ORDER[normalizedTier] >= TIER_ORDER[minTier];
    }

    function countVip(guests, config = getConfig()) {
        return (guests || []).filter(guest => isVipTier(guest.tier, config)).length;
    }

    function vipSubtitle(config = getConfig(), lang = localStorage.getItem('pms_lang') || 'ko') {
        const tier = normalizeTier(config.vipMinimumTier);
        const isEn = lang === 'en';
        const label = tierLabel(tier, lang);
        if (tier === 'diamond') return isEn ? 'Diamond only' : `${label}만`;
        return isEn ? `${label}+ tiers` : `${label} 이상 등급`;
    }

    function tierLabel(tier, lang = localStorage.getItem('pms_lang') || 'ko') {
        const normalized = normalizeTier(tier);
        const labels = lang === 'en' ? TIER_LABELS : TIER_LABELS_KO;
        return labels[normalized] || (lang === 'en' ? 'Platinum' : '플래티넘');
    }

    window.PMS_VIP_CRITERIA = {
        STORAGE_KEY,
        TIER_ORDER,
        TIER_LABELS,
        TIER_LABELS_KO,
        DEFAULT_CONFIG: cloneConfig(DEFAULT_CONFIG),
        normalizeTier,
        tierLabel,
        getConfig,
        saveConfig,
        isVipTier,
        countVip,
        vipSubtitle
    };
})();
