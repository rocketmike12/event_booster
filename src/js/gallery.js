let events;

const eventsPerPage = 21;
let currentPage = 1;

const eventList = document.querySelector(".event-list");
const pagination = document.querySelector(".pagination");

// Рендер карток подій
function renderEvents(page) {
	const start = (page - 1) * eventsPerPage;
	const end = start + eventsPerPage;
	const pageEvents = events.slice(start, end);

	eventList.innerHTML = pageEvents
		.map(
			(event) => `
			<li class="event-list-item">
				<div class="event-list-leaf"></div>
				<img class="event-list-img" src="${event.images[0].url}" alt="">
				<h2 class="event-list-title">${event.name}</h2>
				<p class="event-list-date">${event.dates.start.localDate}</p>
				<p class="event-list-location">
					<svg class="event-list-location-icon"><use></use></svg>
					${event._embedded.venues[0].name}
				</p>
			</li>
		`
		)
		.join("");
}

// Рендер кнопок пагінації
function renderPagination() {
	const totalPages = Math.ceil(events.length / eventsPerPage);
	let buttons = "";

	for (let i = 1; i <= totalPages; i++) {
		buttons += `<button class="page-btn${i === currentPage ? " active" : ""}" data-page="${i}">${i}</button>`;
	}

	pagination.innerHTML = `
    <button class="prev" ${currentPage === 1 ? "disabled" : ""}>←</button>
    ${buttons}
    <button class="next" ${currentPage === totalPages ? "disabled" : ""}>→</button>
  `;
}

// Обробка кліків списку сторінок
pagination.addEventListener("click", (e) => {
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

async function getEvents() {
	let res = await fetch("https://app.ticketmaster.com/discovery/v2/events.json?size=100&apikey=sES9o0k41AqBPlOAoQQCG4iYys2FN6TL");
	res = await res.json();
	events = res._embedded.events;
	renderEvents(currentPage);
	renderPagination();
}

// Отримати і зарендерити події і сторінки
getEvents();
