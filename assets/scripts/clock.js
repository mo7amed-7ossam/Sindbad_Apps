function updateClock() {
    document.querySelector('#clock').textContent = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date());
}

updateClock();
setInterval(updateClock, 30000);
