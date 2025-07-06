import { fetchCardDetails } from "/src/js/modal.js";

const heroTitle = document.querySelector(".hero-title");

const url = window.location.href;
const params = new URL(url).searchParams;
let raw = params.get("author");

const authors = raw ? JSON.parse(decodeURIComponent(raw)) : [];
console.log(authors);

heroTitle.textContent = authors.join("; ");

let events;

let eventsPerPage;
if (window.screen.width >= 786 && window.screen.width < 1280) {
	eventsPerPage = 21;
} else {
	eventsPerPage = 20;
}

let currentPage = 1;

const eventList = document.querySelector(".event-list");
const pagination = document.querySelector(".pagination");
const galleryContainer = document.querySelector(".gallery-container");

const API_KEY = "P6IfSc5uHWe7okn8G7GGiEWObc48r3yE";

// Рендер карток подій

function renderEvents(page) {
	const start = (page - 1) * eventsPerPage;
	const end = start + eventsPerPage;
	const pageEvents = events.slice(start, end);

	eventList.innerHTML = pageEvents
		.map(
			(event) => `
			<li class="event-list-item" data-id="${event.id}">
				<div class="event-list-img" style="background-image: url(${event.images[0].url});"></div>
				<h2 class="event-list-title">${event.name}</h2>
				<p class="event-list-date">${event.dates.start.localDate || ""}</p>
				<p class="event-list-location">
					<svg class="event-list-location-icon" width="7px" height="10px"><use href="src/symbol-defs.svg#icon-place"></use></svg>
					${(() => {
						try {
							return event._embedded.venues[0].name;
						} catch (err) {
							return "<i>no info available</i>";
						}
					})()}
				</p >
			</li >
			`
		)
		.join("");

	galleryContainer.style.height = document.querySelector(".event-list").offsetHeight + "px";
	setTimeout(() => {
		galleryContainer.style.height = document.querySelector(".event-list").offsetHeight + "px";
	}, 1000);
}

function renderPagination() {
	const totalPages = Math.ceil(events.length / eventsPerPage);
	let buttons = [];
	let pages = [];

	if (totalPages <= 7) {
		pages = [...Array(totalPages + 1).keys()].slice(1);
	} else if (currentPage <= 4) {
		pages = [1, 2, 3, 4, 5, "...", totalPages];
	} else if (currentPage >= totalPages - 3) {
		pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
	} else {
		pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
	}

	for (let p of pages) {
		if (p === "...") {
			buttons.push(`<button class="page-btn-dots">...</button>`);
		} else {
			buttons.push(`
					<button class="page-btn${p === currentPage ? " active" : ""}" data-page="${p}">
						${p}
					</button>
			`);
		}
	}

	pagination.innerHTML = buttons.join("");
}

async function getEvents() {
	const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=200&apikey=${API_KEY}&keyword=${authors.join("%20")}`;

	let res = await fetch(apiUrl);

	res = await res.json();

	events = await res._embedded.events;

	renderEvents(currentPage);
	renderPagination();
}

// Обробка кліків списку сторінок
pagination.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON") return;

	currentPage = Number(e.target.dataset.page);

	renderEvents(currentPage);
	renderPagination();

	window.scrollTo(0, 0);
});

window.addEventListener("resize", () => {
	if (eventsPerPage === (window.screen.width >= 786 && window.screen.width < 1280 ? 21 : 20)) return;

	eventsPerPage = window.screen.width >= 786 && window.screen.width < 1280 ? 21 : 20;
	renderEvents(currentPage);
});

eventList.addEventListener("click", async (e) => {
	if (e.target.parentElement.className !== "event-list-item") return;

	await fetchCardDetails(e.target.parentElement.dataset.id);
	document.querySelector(".overlay").classList.remove("hidden");
});

// Initialize the application on window load
window.onload = function () {
	getEvents();
};
