function switchSection(sectionId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SETTINGS SUB-TAB LOGIC ---
function switchSettingsTab(tabId) {
    // Remove active class from all content
    document.querySelectorAll('.settings-subcontent').forEach(el => el.classList.remove('active'));
    // Add active class to selected content
    document.getElementById(tabId).classList.add('active');
    
    // Update Buttons
    document.querySelectorAll('.subnav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-' + tabId).classList.add('active');
}

// --- DEFAULT DATA ---
const defaultMaxInventory = {
    "Limes, 40#": 2, "Lettuce": 9, "Cilantro": 16, "Chicken": 28, "Steak": 9,
    "Adobo Marinade 30 lb": 2, "Queso": 2, "Sofritas": 2, "Lemon/Lime Juice": 3, "Cheese": 6,
    "Corn w/ Poblano Mix": 12, "Bell Peppers": 10, "Tomato": 21, "Avocados": 27,
    "Burrito Size Tortilla 144 ct": 10, "Flour Tortilla": 2, "Taco Size Crispy Corn Tortilla PF, 240 ct": 2,
    "Black beans": 9, "Pinto beans": 9, "Sour Cream": 8, "Red Tomatillo Salsa 40 lb": 4,
    "Green Tomatillo Salsa, Finished, 40lbs": 6, "Clementine Oranges": 2, "Jalapeno Peppers, 10lb": 4
};

// Default Usage Rates (Per $1000 Sales)
const defaultUsageRates = {
    "Adobo Marinade 30 lb": 0.0100,
    "Avocados": 0.5200,
    "Bell Peppers": 0.1824,
    "Black beans": 0.1765,
    "Burrito Size Tortilla 144 ct": 0.1765,
    "Cheese": 0.1294,
    "Chicken": 0.4441,
    "Cilantro": 0.3235,
    "Clementine Oranges": 0.0147,
    "Corn w/ Poblano Mix": 0.2600,
    "Flour Tortilla": 0.0300,
    "Green Tomatillo Salsa, Finished, 40lbs": 0.0882,
    "Jalapeno Peppers, 10lb": 0.1029,
    "Lemon/Lime Juice": 0.0735,
    "Lettuce": 0.2059,
    "Limes, 40#": 0.0250,
    "Pinto beans": 0.1500,
    "Queso": 0.0800,
    "Red Tomatillo Salsa 40 lb": 0.0941,
    "Sofritas": 0.0353,
    "Sour Cream": 0.1588,
    "Steak": 0.1471,
    "Taco Size Crispy Corn Tortilla PF, 240 ct": 0.0235,
    "Tomato": 0.3824
};

const defaultConsumption = {
    "Limes, 40#": .2, "Lettuce": 2.5, "Cilantro": 4, "Chicken": 6, "Steak": 2.5,
    "Adobo Marinade 30 lb": 0.33, "Queso": 1, "Sofritas": 0.5, "Lemon/Lime Juice": 0.5, "Cheese": 2,
    "Corn w/ Poblano Mix": 3.5, "Bell Peppers": 2.5, "Tomato": 5, "Avocados": 6,
    "Burrito Size Tortilla 144 ct": 2.5, "Flour Tortilla": 0.5, "Taco Size Crispy Corn Tortilla PF, 240 ct": .3,
    "Black beans": 1.5, "Pinto beans": 1, "Sour Cream": 2, "Red Tomatillo Salsa 40 lb": 1.5,
    "Green Tomatillo Salsa, Finished, 40lbs": 2, "Clementine Oranges": 0.3, "Jalapeno Peppers, 10lb": 1
};

// --- STATE MANAGEMENT ---
let maxInventory = JSON.parse(localStorage.getItem('maxInventory')) || {...defaultMaxInventory};
let consumptionDict = JSON.parse(localStorage.getItem('consumptionDict')) || {...defaultConsumption};

// Initialize with specific defaults if not present
let usagePerThousand = JSON.parse(localStorage.getItem('usagePerThousand')) || {...defaultUsageRates};

let globalCurrentDate = new Date();

// Ensure usagePerThousand has keys for all items in defaultMaxInventory
Object.keys(defaultMaxInventory).forEach(key => {
    if (usagePerThousand[key] === undefined) usagePerThousand[key] = 0;
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initDates();
    renderSettings();
    renderUsageSettings();
});

// --- DATE LOGIC ---
function initDates(startDate = null) {
    // If a start date is provided, use it; otherwise use now
    const today = startDate ? new Date(startDate) : new Date();
    globalCurrentDate = today;
    
    const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('currentDateDisplay').innerText = today.toLocaleDateString('en-US', dateOptions);

    const allowedDays = [1, 3, 5, 6]; // Mon, Wed, Fri, Sat
    const nextDates = [];
    let checkDate = new Date(today);
    
    // Find next 4 valid shipment dates
    for(let i = 0; i < 14; i++) {
        checkDate.setDate(checkDate.getDate() + 1);
        if (allowedDays.includes(checkDate.getDay())) {
            nextDates.push(new Date(checkDate));
        }
        if (nextDates.length >= 4) break; 
    }

    const container = document.getElementById('shipmentContainer');
    container.innerHTML = '';
    
    nextDates.forEach((date, index) => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); 
        const dateStr = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const fullValue = date.toISOString();

        const chip = document.createElement('div');
        chip.className = `shipment-chip ${index === 0 ? 'active' : ''}`;
        chip.onclick = () => selectShipmentDate(chip, fullValue);
        chip.innerHTML = `
            <span class="day-name">${dayName}</span>
            <span class="date-val">${dateStr}</span>
        `;
        container.appendChild(chip);

        if (index === 0) {
            document.getElementById('selectedShipmentDateValue').value = fullValue;
        }
    });
}

// Opens the hidden date picker
function openDatePicker(e) {
    e.preventDefault();
    const picker = document.getElementById('currentDatePicker');
    
    // modern browser support
    if(picker.showPicker) {
        picker.showPicker();
    } else {
        picker.click();
    }
}

// Handles logic when date is changed via picker
function handleDateChange(input) {
    // Create date from value string (YYYY-MM-DD) while avoiding timezone shifts
    const parts = input.value.split('-');
    if(parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JS months are 0-11
        const day = parseInt(parts[2]);
        const newDate = new Date(year, month, day);
        
        initDates(newDate); // Re-init everything with new "today"
    }
}

function selectShipmentDate(element, value) {
    document.querySelectorAll('.shipment-chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('selectedShipmentDateValue').value = value;
}

function updateFileName(input) {
    const display = document.getElementById('fileNameDisplay');
    if (input.files && input.files.length > 0) {
        display.innerText = input.files[0].name;
        display.style.color = 'var(--chili-dark)';
        display.style.fontWeight = '700';
    } else {
        display.innerText = "Select CSV File";
        display.style.color = '#666';
    }
}

// --- MODAL LOGIC ---
function initiateVerification() {
    const suppressed = localStorage.getItem('suppressInventoryWarning');
    if (suppressed === 'true') {
        processFile();
    } else {
        const modal = document.getElementById('warningModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeWarningModal() {
    const modal = document.getElementById('warningModal');
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function closeApply15kModal() {
    const modal = document.getElementById('apply15kModal');
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function openApply15kModal() {
    const modal = document.getElementById('apply15kModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function confirmApply15k() {
    closeApply15kModal();
    proceedWithApplyUsage();
}

function confirmVerification() {
    const checkbox = document.getElementById('dontShowAgain');
    if (checkbox.checked) {
        localStorage.setItem('suppressInventoryWarning', 'true');
    }
    closeWarningModal();
    processFile();
}

// --- PROCESSING LOGIC ---
function processFile() {
    const fileInput = document.getElementById('csvFile');
    const errorMsg = document.getElementById('error-msg');
    
    if (!fileInput.files.length) {
        errorMsg.innerText = "Please upload a CSV file first.";
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.style.display = 'none';
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        try {
            const data = parseCSV(text);
            calculateAndRender(data);
        } catch (err) {
            errorMsg.innerText = "Error processing CSV: " + err.message;
            errorMsg.style.display = 'block';
        }
    };

    reader.readAsText(file);
}

function parseCSV(csvText) {
    const lines = csvText.split(/\r\n|\n/);
    const result = [];
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        const cols = [];
        let inQuote = false;
        let currentToken = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                cols.push(currentToken);
                currentToken = '';
            } else {
                currentToken += char;
            }
        }
        cols.push(currentToken);

        const cleanCols = cols.map(c => c.trim().replace(/^"|"$/g, '').trim());
        
        if (cleanCols.length < 8) return; 
        if (isNaN(parseFloat(cleanCols[3])) && isNaN(parseFloat(cleanCols[7]))) return;

        result.push({
            name: cleanCols[2], 
            onHand: parseFloat(cleanCols[3]) || 0,
            inTransit: parseFloat(cleanCols[4]) || 0,
            amountToOrder: parseFloat(cleanCols[7]) || 0
        });
    });
    return result;
}

function calculateAndRender(data) {
    const current = new Date(globalCurrentDate);
    current.setHours(0,0,0,0);
    
    const shipmentVal = document.getElementById('selectedShipmentDateValue').value;
    const shipment = new Date(shipmentVal);
    shipment.setHours(0,0,0,0);

    const errorMsg = document.getElementById('error-msg');
    
    const diffTime = Math.abs(shipment - current);
    const daysUntilShipment = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = '';
    
    let overOrderCount = 0;

    const processedData = data.map(row => {
        // EXCLUSION: Skip the specific "20lb" double entry as requested
        if (row.name.includes("Corn w/ Poblano Mix, 20lb")) return null;

        const matchedKey = Object.keys(maxInventory).find(k => {
            const lowerKey = k.toLowerCase();
            const lowerName = row.name.toLowerCase();
            
            // Standard match (e.g., "Avocados" matches "Avocados 60ct")
            if (lowerName.includes(lowerKey)) return true;

            // Special handling for Beans labeled as "Beans, Black" or "Beans, Pinto"
            if (lowerKey === 'black beans' && lowerName.includes('black') && lowerName.includes('beans')) return true;
            if (lowerKey === 'pinto beans' && lowerName.includes('pinto') && lowerName.includes('beans')) return true;
            
            return false;
        });

        if (!matchedKey) return null; 

        const maxInv = maxInventory[matchedKey];
        const consumption = consumptionDict[matchedKey] || 1;
        
        // New Logic for Estimated Inventory
        const usageUntilShipment = consumption * daysUntilShipment;
        const totalAfterOrder = row.onHand + row.inTransit + row.amountToOrder;
        const estimatedInventory = totalAfterOrder - usageUntilShipment;
        
        // Variance logic: Target Max (maxInv) - Estimated Inventory
        // If positive, we have room under the cap. If negative, we are over the cap.
        let diff = maxInv - estimatedInventory;

        if (row.amountToOrder === 0 && diff < 0) {
            diff = 0;
        }

        const isOver = diff < 0;
        
        return {
            ...row,
            matchedKey,
            estimatedInventory,
            diff,
            isOver
        };
    }).filter(item => item !== null);

    if (processedData.length === 0) {
        errorMsg.innerText = "No matching items found. Please check item names in Settings.";
        errorMsg.style.display = 'block';
        document.getElementById('resultsCard').style.display = 'none';
        return;
    }

    processedData.sort((a, b) => {
        if (a.isOver === b.isOver) return a.name.localeCompare(b.name);
        return a.isOver ? -1 : 1;
    });

    processedData.forEach(item => {
        const tr = document.createElement('tr');
        if (item.isOver) {
            tr.classList.add('over-order');
            overOrderCount++;
        }

        tr.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td>${item.onHand.toFixed(2)}</td>
            <td>${item.inTransit.toFixed(2)}</td>
            <td>${item.amountToOrder.toFixed(2)}</td>
            <td>${item.estimatedInventory.toFixed(2)}</td>
            <td>${item.diff.toFixed(2)}</td>
            <td><span style="font-weight:800; color:${item.isOver ? '#d32f2f' : '#2e7d32'}">
                ${item.isOver ? 'OVER ORDER' : 'OK'}
            </span></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('resultsCard').style.display = 'block';
    
    const dayName = shipment.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('summaryText').innerText = 
        `${dayName} Shipment • ${overOrderCount} Issues Found`;
    
    document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
}

// --- SETTINGS LOGIC ---
function renderSettings() {
    const container = document.getElementById('settingsList');
    container.innerHTML = '';
    const allKeys = new Set([...Object.keys(maxInventory), ...Object.keys(consumptionDict)]);
    const sortedKeys = Array.from(allKeys).sort();

    sortedKeys.forEach(key => {
        const div = document.createElement('div');
        div.className = 'setting-item';
        // Compact styling inline for simplicity
        div.style.padding = '12px 15px';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        
        div.innerHTML = `
            <div style="font-weight: 800; color: var(--chili-dark); font-size: 0.85rem; line-height:1.2; padding-right:10px;">${key}</div>
            <div style="display: flex; align-items: center; gap: 15px; flex-shrink: 0;">
                <div style="text-align: right;">
                    <div style="font-size: 0.65rem; font-weight: 700; color: #888; text-transform: uppercase;">Usage</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: #333;">${(consumptionDict[key] || 0).toFixed(2)}</div>
                </div>
                <div class="input-wrapper" style="width: 70px;">
                    <label>Max</label>
                    <input type="number" step="0.1" id="max_${key}" value="${maxInventory[key] || 0}">
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- NEW USAGE SETTINGS LOGIC ---
function renderUsageSettings() {
    const tbody = document.getElementById('ratesTableBody');
    tbody.innerHTML = '';
    
    const allKeys = Object.keys(usagePerThousand).sort();

    allKeys.forEach(key => {
        const upt = usagePerThousand[key] || 0;
        const minUsage = (upt * 10).toFixed(2); // 10k Sales
        const maxUsage = (upt * 17).toFixed(2); // 17k Sales

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

// Manual Updates to Min/Max should reverse-calculate the Rate
function updateFromMin(key, value) {
    let val = parseFloat(value) || 0;
    // Min is based on 10k sales. Rate = Min / 10.
    let newRate = val / 10;
    usagePerThousand[key] = newRate;
    renderUsageSettings(); // Re-render to update Rate and Max column
}

function updateFromMax(key, value) {
    let val = parseFloat(value) || 0;
    // Max is based on 17k sales. Rate = Max / 17.
    let newRate = val / 17;
    usagePerThousand[key] = newRate;
    renderUsageSettings(); // Re-render to update Rate and Min column
}

// The user wants to use the adjusted numbers to update the "Item Limit Daily Usage"
function applyUsageToSettings() {
    openApply15kModal();
}

function proceedWithApplyUsage() {
    const allKeys = Object.keys(usagePerThousand);
    let count = 0;
    
    allKeys.forEach(key => {
        const upt = usagePerThousand[key] || 0;
        const avgUsage = parseFloat((upt * 15).toFixed(2)); // Calculate Avg (15k)
        
        // Update the consumption dictionary (which feeds the Daily Usage inputs)
        consumptionDict[key] = avgUsage;
        count++;
    });

    // Trigger full save of all configurations (including usagePerThousand and consumptionDict)
    saveSettings();
    
    // Re-render the top settings list to show new values
    renderSettings();
    
    // SWITCH to Settings section and Item Limits tab to show the user the updates
    switchSection('settings');
    switchSettingsTab('set-limits');
    
    showToast(`Updated and saved Daily Usage for ${count} items based on 15k sales.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function processRatesCSV(input) {
    const file = input.files[0];
    if(!file) return;

    // Visual update
    const display = document.getElementById('ratesFileName');
    display.innerText = file.name;
    display.style.color = 'var(--chili-dark)';
    display.style.fontWeight = '700';

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/);
        let updatedCount = 0;

        // Helper to parse CSV line correctly handling quotes
        const parseLine = (line) => {
            const result = [];
            let start = 0;
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                if (line[i] === '"') {
                    inQuotes = !inQuotes;
                } else if (line[i] === ',' && !inQuotes) {
                    result.push(line.substring(start, i).trim().replace(/^"|"$/g, ''));
                    start = i + 1;
                }
            }
            result.push(line.substring(start).trim().replace(/^"|"$/g, ''));
            return result;
        };

        lines.forEach((line, index) => {
            if(!line.trim()) return;
            
            // Parse the line
            const cols = parseLine(line);

            // Check if we have enough columns (Need index 2 and 5)
            // Item Name is Column 3 (Index 2)
            // Usage Per 1000 is Column 6 (Index 5)
            if(cols.length >= 6) {
                const name = cols[2]; // Column 3
                
                // Explicitly exclude the "20lb" variant
                if (name.includes("Corn w/ Poblano Mix, 20lb")) return;
                
                // Handle accounting format (0.03) -> -0.03 if necessary, though usually positive
                let valStr = cols[5]; // Column 6
                if(valStr.includes('(')) {
                    valStr = '-' + valStr.replace(/[()]/g, '');
                }
                let val = parseFloat(valStr);

                // Skip header row if it contains "Ing. Desc."
                if (name.includes("Ing. Desc.")) return;

                // --- UNIT CONVERSION LOGIC ---
                // Convert Pounds to Cases for specific items as requested and float to 2 decimals
                const lowerName = name.toLowerCase();
                if (lowerName.includes("cheese")) {
                    val = val / 42; // 42 lb cases
                    val = parseFloat(val.toFixed(4)); // Keep precision for rate
                } else if (lowerName.includes("chicken")) {
                    val = val / 44; // 44 lb cases
                    val = parseFloat(val.toFixed(4));
                } else if (lowerName.includes("limes")) {
                    val = val / 40; // 40 lb cases
                    val = parseFloat(val.toFixed(4));
                } else if (lowerName.includes("steak")) {
                    val = val / 40; // 40 lb cases
                    val = parseFloat(val.toFixed(4));
                }

                // Fix for Naming conventions (CSV vs App)
                let searchName = name;
                
                // Beans
                if (lowerName.includes("beans") && lowerName.includes("black")) searchName = "Black beans";
                if (lowerName.includes("beans") && lowerName.includes("pinto")) searchName = "Pinto beans";

                // Produce & Salsas
                if (lowerName.includes("jalapeno")) searchName = "Jalapeno Peppers, 10lb";
                if (lowerName.includes("corn") && lowerName.includes("poblano")) searchName = "Corn w/ Poblano Mix";
                if (lowerName.includes("green") && lowerName.includes("tomatillo")) searchName = "Green Tomatillo Salsa, Finished, 40lbs";
                if (lowerName.includes("red") && lowerName.includes("tomatillo")) searchName = "Red Tomatillo Salsa 40 lb";

                // Tortillas
                if (lowerName.includes("taco") && lowerName.includes("corn")) searchName = "Taco Size Crispy Corn Tortilla PF, 240 ct";
                if (lowerName.includes("burrito") && lowerName.includes("tortilla")) searchName = "Burrito Size Tortilla 144 ct";

                // Try to match existing keys mostly
                const matchedKey = Object.keys(usagePerThousand).find(k => 
                    searchName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(searchName.toLowerCase())
                );

                if(matchedKey && !isNaN(val)) {
                    usagePerThousand[matchedKey] = val;
                    updatedCount++;
                }
            }
        });
        
        renderUsageSettings();
        showToast(`Updated ${updatedCount} usage rates from CSV.`);
    };
    reader.readAsText(file);
}

function saveSettings() {
    const allKeys = new Set([...Object.keys(maxInventory), ...Object.keys(consumptionDict)]);
    
    allKeys.forEach(key => {
        const maxEl = document.getElementById(`max_${key}`);
        // Daily Usage is now managed via CSV, so we don't save from this view anymore
        
        if (maxEl) maxInventory[key] = parseFloat(maxEl.value);
    });

    localStorage.setItem('maxInventory', JSON.stringify(maxInventory));
    localStorage.setItem('consumptionDict', JSON.stringify(consumptionDict));
    localStorage.setItem('usagePerThousand', JSON.stringify(usagePerThousand));
    
    showToast('Configuration saved successfully!');
}

function showToast(message) {
    let toast = document.getElementById('saveToast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('active');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function resetDefaults() {
    if(confirm("Reset all settings to defaults?")) {
        maxInventory = {...defaultMaxInventory};
        consumptionDict = {...defaultConsumption};
        
        // Reset usage to NEW DEFAULT UPT (not 0)
        usagePerThousand = {...defaultUsageRates};
        
        Object.keys(defaultMaxInventory).forEach(key => {
             if (usagePerThousand[key] === undefined) usagePerThousand[key] = 0;
        });

        localStorage.setItem('maxInventory', JSON.stringify(maxInventory));
        localStorage.setItem('consumptionDict', JSON.stringify(consumptionDict));
        localStorage.setItem('usagePerThousand', JSON.stringify(usagePerThousand));
        
        renderSettings();
        renderUsageSettings();
    }
}
