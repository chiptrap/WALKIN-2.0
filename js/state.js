/**
 * state.js
 * Default data definitions and application state management.
 */

// --- DEFAULT DATA ---

const DEFAULTS = {
    maxInventory: {
        "Limes, 40#": 2, "Lettuce": 9, "Cilantro": 16, "Chicken": 28, "Steak": 9,
        "Adobo Marinade 30 lb": 2, "Queso": 2, "Sofritas": 2, "Lemon/Lime Juice": 3, "Cheese": 6,
        "Corn w/ Poblano Mix": 12, "Bell Peppers": 10, "Tomato": 21, "Avocados": 27,
        "Burrito Size Tortilla 144 ct": 10, "Flour Tortilla": 2, "Taco Size Crispy Corn Tortilla PF, 240 ct": 2,
        "Black beans": 9, "Pinto beans": 9, "Sour Cream": 8, "Red Tomatillo Salsa 40 lb": 4,
        "Green Tomatillo Salsa, Finished, 40lbs": 6, "Clementine Oranges": 2, "Jalapeno Peppers, 10lb": 4
    },

    usageRates: {
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
    },

    consumption: {
        "Limes, 40#": .2, "Lettuce": 2.5, "Cilantro": 4, "Chicken": 6, "Steak": 2.5,
        "Adobo Marinade 30 lb": 0.33, "Queso": 1, "Sofritas": 0.5, "Lemon/Lime Juice": 0.5, "Cheese": 2,
        "Corn w/ Poblano Mix": 3.5, "Bell Peppers": 2.5, "Tomato": 5, "Avocados": 6,
        "Burrito Size Tortilla 144 ct": 2.5, "Flour Tortilla": 0.5, "Taco Size Crispy Corn Tortilla PF, 240 ct": .3,
        "Black beans": 1.5, "Pinto beans": 1, "Sour Cream": 2, "Red Tomatillo Salsa 40 lb": 1.5,
        "Green Tomatillo Salsa, Finished, 40lbs": 2, "Clementine Oranges": 0.3, "Jalapeno Peppers, 10lb": 1
    },

    salesProjections: {
        "Monday": 10000,
        "Tuesday": 10000,
        "Wednesday": 10000,
        "Thursday": 12000,
        "Friday": 14000,
        "Saturday": 13000,
        "Sunday": 11000
    }
};

// --- LIVE STATE ---

const AppState = {
    maxInventory: JSON.parse(localStorage.getItem('maxInventory')) || { ...DEFAULTS.maxInventory },
    consumptionDict: JSON.parse(localStorage.getItem('consumptionDict')) || { ...DEFAULTS.consumption },
    salesProjections: JSON.parse(localStorage.getItem('salesProjections')) || { ...DEFAULTS.salesProjections },
    usagePerThousand: JSON.parse(localStorage.getItem('usagePerThousand')) || { ...DEFAULTS.usageRates },
    globalCurrentDate: new Date()
};

// Ensure usagePerThousand has keys for all items in defaultMaxInventory
Object.keys(DEFAULTS.maxInventory).forEach(key => {
    if (AppState.usagePerThousand[key] === undefined) {
        AppState.usagePerThousand[key] = 0;
    }
});

// --- PERSISTENCE ---

function persistAll() {
    localStorage.setItem('maxInventory', JSON.stringify(AppState.maxInventory));
    localStorage.setItem('consumptionDict', JSON.stringify(AppState.consumptionDict));
    localStorage.setItem('usagePerThousand', JSON.stringify(AppState.usagePerThousand));
    localStorage.setItem('salesProjections', JSON.stringify(AppState.salesProjections));
}
