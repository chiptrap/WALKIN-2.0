/**
 * dates.js
 * Date picker, shipment chip generation, and date selection logic.
 */

function initDates(startDate = null) {
    const today = startDate ? new Date(startDate) : new Date();
    AppState.globalCurrentDate = today;

    const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('currentDateDisplay').innerText =
        today.toLocaleDateString('en-US', dateOptions);

    const allowedDays = [1, 3, 5, 6]; // Mon, Wed, Fri, Sat
    const nextDates = [];
    const checkDate = new Date(today);

    for (let i = 0; i < 14; i++) {
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

function openDatePicker(e) {
    e.preventDefault();
    const picker = document.getElementById('currentDatePicker');
    if (picker.showPicker) {
        picker.showPicker();
    } else {
        picker.click();
    }
}

function handleDateChange(input) {
    const parts = input.value.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        initDates(new Date(year, month, day));
    }
}

function selectShipmentDate(element, value) {
    document.querySelectorAll('.shipment-chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('selectedShipmentDateValue').value = value;
}
