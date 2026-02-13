/**
 * projections.js
 * Weekly sales projections grid rendering and persistence.
 */

function renderProjections() {
    const container = document.getElementById('projectionsGrid');
    container.innerHTML = '';

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
        const dateObj = new Date(sunday);
        dateObj.setDate(sunday.getDate() + i);

        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const rawVal = AppState.salesProjections[dayName] || 0;
        const formattedVal = rawVal.toLocaleString('en-US');

        const div = document.createElement('div');
        div.className = 'projection-item';
        div.innerHTML = `
            <span class="projection-label">
                ${dayName}
                <div style="font-weight:400; color:#666; font-size:0.8em; margin-top:2px;">${dateStr}</div>
            </span>
            <input type="text"
                   id="proj_${dayName}"
                   class="projection-input"
                   value="${formattedVal}"
                   placeholder="0"
                   onkeyup="formatCurrency(this)"
                   onblur="formatCurrency(this)">
        `;
        container.appendChild(div);
    }
}

function formatCurrency(input) {
    let val = input.value.replace(/[^0-9]/g, '');
    if (!val) {
        input.value = '';
        return;
    }
    input.value = parseInt(val).toLocaleString('en-US');
}

function saveProjections() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    days.forEach(day => {
        const input = document.getElementById(`proj_${day}`);
        if (input) {
            const rawVal = input.value.replace(/,/g, '');
            AppState.salesProjections[day] = parseFloat(rawVal) || 0;
        }
    });

    localStorage.setItem('salesProjections', JSON.stringify(AppState.salesProjections));
    showToast('Sales projections saved successfully!');
}
