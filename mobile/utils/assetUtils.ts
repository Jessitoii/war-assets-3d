import { Asset, AssetSpecs } from '../store/slices/assetSlice';

/**
 * Infers military metrics (0-100) based on technical specifications.
 * @param specs The short_specs object of an asset.
 * @returns An AssetMetrics object.
 */
export const inferMetrics = (specs: AssetSpecs) => {
    // Mobility calculation
    let mobility = 50;
    const speedStr = specs.speed || specs.max_speed || '';
    const speedMatch = speedStr.match(/(\d+)/);
    if (speedMatch) {
        const speed = parseInt(speedMatch[1]);
        if (speed > 800) mobility = 95; // Jets
        else if (speed > 400) mobility = 85; // Helicopters/Fast Drones
        else if (speed > 100) mobility = 75; // Fast vehicles
        else if (speed > 60) mobility = 65; // Average tank speed
        else if (speed > 40) mobility = 55;
    }

    // Firepower calculation
    let firepower = 50;
    const primaryArmament = (specs.primary_armament || specs.armament || '').toLowerCase();
    if (primaryArmament.includes('120 mm') || primaryArmament.includes('125 mm')) firepower = 90;
    else if (primaryArmament.includes('105 mm')) firepower = 80;
    else if (primaryArmament.includes('30 mm') || primaryArmament.includes('20 mm')) firepower = 60;
    else if (primaryArmament.includes('missile') || primaryArmament.includes('rocket')) firepower = 85;

    // Durability calculation
    let durability = 50;
    const armour = (specs.armour || '').toLowerCase();
    const weightStr = specs.weight || '';
    const weightMatch = weightStr.match(/(\d+)/);

    if (armour.includes('composite') || armour.includes('reactive') || armour.includes('chobham')) durability = 95;
    else if (armour.includes('mm')) {
        const mmMatch = armour.match(/(\d+)/);
        if (mmMatch && parseInt(mmMatch[1]) > 500) durability = 90;
        else if (mmMatch && parseInt(mmMatch[1]) > 200) durability = 75;
    } else if (weightMatch) {
        const weight = parseInt(weightMatch[1]);
        if (weight > 50) durability = 85; // Heavy tanks
        else if (weight > 30) durability = 70;
    }

    // Stealth calculation
    let stealth = 40;
    if (specs.type?.toLowerCase().includes('stealth')) stealth = 95;
    else if (specs.type?.toLowerCase().includes('drone')) stealth = 80;
    else if (weightMatch && parseInt(weightMatch[1]) < 1) stealth = 85;

    return {
        mobility: Math.min(100, mobility),
        firepower: Math.min(100, firepower),
        durability: Math.min(100, durability),
        stealth: Math.min(100, stealth),
    };
};

/**
 * Translation helper for asset specifications.
 * Fetches the correct translation from asset.translations[lang][category][key]
 * with a fallback to the English root (short_specs/full_dossier).
 */
export const t_spec = (asset: Asset, category: 'short_specs' | 'full_dossier', key: string, lang: string = 'en') => {
    if (lang !== 'en' && asset.translations && asset.translations[lang]) {
        const translation = asset.translations[lang];
        if (translation && translation[category] && translation[category][key]) {
            return translation[category][key];
        }
    }

    // Fallback to root (English)
    const root = asset[category];
    if (root && root[key]) {
        return root[key];
    }

    return 'N/A';
};
