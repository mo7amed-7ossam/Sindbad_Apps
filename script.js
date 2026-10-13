// const dialog = document.querySelector('#searchDialog');
// const findButton = document.querySelector('#findButton');
// const input = document.querySelector('#search');
// const results = [...document.querySelectorAll('#results .result')];// const emptyState = document.querySelector('#results .empty');

// function filterResults() {
//   const query = input.value.trim().toLowerCase();
//   let visible = 0;

//   results.forEach((result) => {
//     const matches = !query || result.dataset.search.includes(query);
//     result.hidden = !matches;
//     if (matches) visible += 1;
//   });

//   emptyState.hidden = visible !== 0;
// }

// findButton.addEventListener('click', () => {
//   input.value = '';
//   filterResults();
//   dialog.showModal();
//   input.focus();
// });

// input.addEventListener('input', filterResults);

// document.addEventListener('click', (event) => {
//   const inactiveLink = event.target.closest('a.inactive');
//   if (inactiveLink) event.preventDefault();
// });

// document.addEventListener('keydown', (event) => {
//   if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
//     event.preventDefault();
//     findButton.click();
//   }
// });

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
