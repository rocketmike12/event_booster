const events = Array.from({ length: 103 }, (_, i) => ({
  id: i + 1,
  title: `Подія ${i + 1}`,
  date: "2025-05-26",
  image: "https://via.placeholder.com/150x100?text=Event",
}));

const eventsPerPage = 21;
let currentPage = 1;

const refs = {
  eventsList: document.querySelector(".js-events"),
  pagination: document.querySelector(".js-pagination"),
};

// Генерація карток подій
function renderEvents(page) {
  const start = (page - 1) * eventsPerPage;
  const end = start + eventsPerPage;
  const pageEvents = events.slice(start, end);

  refs.eventsList.innerHTML = pageEvents
    .map(
      (event) => `
      <li class="event-card">
        <img src="${event.image}" alt="${event.title}" />
        <h3>${event.title}</h3>
        <p>${event.date}</p>
      </li>
    `
    )
    .join("");
}

// Генерація кнопок пагінації
function renderPagination() {
  const totalPages = Math.ceil(events.length / eventsPerPage);
  let buttons = "";

  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page-btn${
      i === currentPage ? " active" : ""
    }" data-page="${i}">${i}</button>`;
  }

  refs.pagination.innerHTML = `
    <button class="prev" ${currentPage === 1 ? "disabled" : ""}>←</button>
    ${buttons}
    <button class="next" ${
      currentPage === totalPages ? "disabled" : ""
    }>→</button>
  `;
}

// Обробка кліків
refs.pagination.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const totalPages = Math.ceil(events.length / eventsPerPage);

  if (e.target.classList.contains("prev")) {
    if (currentPage > 1) currentPage--;
  } else if (e.target.classList.contains("next")) {
    if (currentPage < totalPages) currentPage++;
  } else {
    currentPage = Number(e.target.dataset.page);
  }

  renderEvents(currentPage);
  renderPagination();
});

// Початковий рендер
renderEvents(currentPage);
renderPagination();
