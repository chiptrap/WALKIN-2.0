/**
 * usage.js
 * Usage Rates table rendering, CSV import for rates, and apply-to-settings logic.
 */

// --- RENDER USAGE TABLE ---

function renderUsageSettings() {
    const tbody = document.getElementById('ratesTableBody');
    tbody.innerHTML = '';

    const allKeys = Object.keys(AppState.usagePerThousand).sort();

    allKeys.forEach(key => {
        const upt = AppState.usagePerThousand[key] || 0;
        const minUsage = (upt * 10).toFixed(2);
        const maxUsage = (upt * 17).toFixed(2);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${key}</td>
            <td style="font-weight:bold; color:#666;" id="rate_${key}">${upt.toFixed(4)}</td>
            <td>
                <input type="number" step="0.1" class="tbl-input" value="${minUsage}"
                    onchange="updateFromMin('${key}', this.value)">
            </td>
            <td>
                <input type="number" step="0.1" class="tbl-input" value="${maxUsage}"
                    onchange="updateFromMax('${key}', this.value)">
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- REVERSE-CALCULATE RATE FROM MIN / MAX ---

function updateFromMin(key, value) {
    const val = parseFloat(value) || 0;
    AppState.usagePerThousand[key] = val / 10;
    renderUsageSettings();
}

function updateFromMax(key, value) {
    const val = parseFloat(value) || 0;
    AppState.usagePerThousand[key] = val / 17;
    renderUsageSettings();
}

// --- APPLY 15K USAGE TO ITEM LIMITS ---

function applyUsageToSettings() {
    openApply15kModal();
}

function confirmApply15k() {
    closeApply15kModal();
    proceedWithApplyUsage();
}

function proceedWithApplyUsage() {
    const allKeys = Object.keys(AppState.usagePerThousand);
    let count = 0;

    allKeys.forEach(key => {
        const upt = AppState.usagePerThousand[key] || 0;
        AppState.consumptionDict[key] = parseFloat((upt * 15).toFixed(2));
        count++;
    });

    saveSettings();
    renderSettings();
    switchSection('settings');
    switchSettingsTab('set-limits');
    showToast(`Updated and saved Daily Usage for ${count} items based on 15k sales.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- RATES CSV IMPORT ---

function processRatesCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const display = document.getElementById('ratesFileName');
    display.innerText = file.name;
    display.style.color = 'var(--chili-dark)';
    display.style.fontWeight = '700';

    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split(/\r\n|\n/);
        let updatedCount = 0;

        lines.forEach(line => {
            if (!line.trim()) return;

            const cols = parseCSVLine(line);
            if (cols.length < 6) return;

            const name = cols[2];
            if (name.includes("Corn w/ Poblano Mix, 20lb")) return;
            if (name.includes("Ing. Desc.")) return;

            let valStr = cols[5];
            if (valStr.includes('(')) {
                valStr = '-' + valStr.replace(/[()]/g, '');
            }
            let val = parseFloat(valStr);

            val = convertUnits(name, val);

            const matchedKey = matchRateKey(name);
            if (matchedKey && !isNaN(val)) {
                AppState.usagePerThousand[matchedKey] = val;
                updatedCount++;
            }
        });

        renderUsageSettings();
        showToast(`Updated ${updatedCount} usage rates from CSV.`);
    };
    reader.readAsText(file);
}

/**
 * Convert pound-based usage values to case-based for specific items.
 */
function convertUnits(name, val) {
    const lower = name.toLowerCase();
    if (lower.includes("cheese"))  return parseFloat((val / 42).toFixed(4));
    if (lower.includes("chicken")) return parseFloat((val / 44).toFixed(4));
    if (lower.includes("limes"))   return parseFloat((val / 40).toFixed(4));
    if (lower.includes("steak"))   return parseFloat((val / 40).toFixed(4));
    return val;
}

/**
 * Normalize a CSV item name to our internal key.
 */
function matchRateKey(name) {
    const lower = name.toLowerCase();
    let searchName = name;

    // Beans
    if (lower.includes("beans") && lower.includes("black")) searchName = "Black beans";
    if (lower.includes("beans") && lower.includes("pinto")) searchName = "Pinto beans";

    // Produce & Salsas
    if (lower.includes("jalapeno"))                                         searchName = "Jalapeno Peppers, 10lb";
    if (lower.includes("corn") && lower.includes("poblano"))                searchName = "Corn w/ Poblano Mix";
    if (lower.includes("green") && lower.includes("tomatillo"))             searchName = "Green Tomatillo Salsa, Finished, 40lbs";
    if (lower.includes("red") && lower.includes("tomatillo"))               searchName = "Red Tomatillo Salsa 40 lb";

    // Tortillas
    if (lower.includes("taco") && lower.includes("corn"))                   searchName = "Taco Size Crispy Corn Tortilla PF, 240 ct";
    if (lower.includes("burrito") && lower.includes("tortilla"))            searchName = "Burrito Size Tortilla 144 ct";

    return Object.keys(AppState.usagePerThousand).find(k =>
        searchName.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(searchName.toLowerCase())
    );
}
