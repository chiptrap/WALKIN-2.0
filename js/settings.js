/**
 * settings.js
 * Item Limits rendering, saving, and reset-to-defaults logic.
 */

function renderSettings() {
    const container = document.getElementById('settingsList');
    container.innerHTML = '';

    const allKeys = new Set([
        ...Object.keys(AppState.maxInventory),
        ...Object.keys(AppState.consumptionDict)
    ]);
    const sortedKeys = Array.from(allKeys).sort();

    sortedKeys.forEach(key => {
        const div = document.createElement('div');
        div.className = 'setting-item';
        div.style.padding = '12px 15px';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';

        div.innerHTML = `
            <div style="font-weight: 800; color: var(--chili-dark); font-size: 0.85rem; line-height:1.2; padding-right:10px;">${key}</div>
            <div style="display: flex; align-items: center; gap: 15px; flex-shrink: 0;">
                <div style="text-align: right;">
                    <div style="font-size: 0.65rem; font-weight: 700; color: #888; text-transform: uppercase;">Usage</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: #333;">${(AppState.consumptionDict[key] || 0).toFixed(2)}</div>
                </div>
                <div class="input-wrapper" style="width: 70px;">
                    <label>Max</label>
                    <input type="number" step="0.1" id="max_${key}" value="${AppState.maxInventory[key] || 0}">
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function saveSettings() {
    const allKeys = new Set([
        ...Object.keys(AppState.maxInventory),
        ...Object.keys(AppState.consumptionDict)
    ]);

    allKeys.forEach(key => {
        const maxEl = document.getElementById(`max_${key}`);
        if (maxEl) AppState.maxInventory[key] = parseFloat(maxEl.value);
    });

    persistAll();
    showToast('Configuration saved successfully!');
}

function resetDefaults() {
    if (!confirm("Reset all settings to defaults?")) return;

    AppState.maxInventory = { ...DEFAULTS.maxInventory };
    AppState.consumptionDict = { ...DEFAULTS.consumption };
    AppState.usagePerThousand = { ...DEFAULTS.usageRates };
    AppState.salesProjections = { ...DEFAULTS.salesProjections };

    Object.keys(DEFAULTS.maxInventory).forEach(key => {
        if (AppState.usagePerThousand[key] === undefined) {
            AppState.usagePerThousand[key] = 0;
        }
    });

    persistAll();
    renderSettings();
    renderUsageSettings();
    renderProjections();
}
