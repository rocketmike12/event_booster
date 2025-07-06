import { fetchCardDetails } from "/src/js/modal.js";

// Global variables for events, pagination, and DOM elements
let events = [];

let eventsPerPage = window.screen.width >= 768 && window.screen.width < 1280 ? 21 : 20;

let currentPage = 1;
let countryCode = "";
let searchQuery = "";

const eventList = document.querySelector(".event-list");
const pagination = document.querySelector(".pagination");
const galleryContainer = document.querySelector(".gallery-container");
const countrySelect = document.getElementById("country");

const nameInput = document.getElementById("search-by-name-input");

// API Key for Ticketmaster Discovery API
const API_KEY = "P6IfSc5uHWe7okn8G7GGiEWObc48r3yE";

const countries = [
	{ name: "United States", code: "US" },
	{ name: "Canada", code: "CA" },
	{ name: "United Kingdom", code: "GB" },
	{ name: "Australia", code: "AU" },
	{ name: "Germany", code: "DE" },
	{ name: "France", code: "FR" },
	{ name: "Spain", code: "ES" },
	{ name: "Mexico", code: "MX" },
	{ name: "Ireland", code: "IE" },
	{ name: "New Zealand", code: "NZ" },
	{ name: "Netherlands", code: "NL" },
	{ name: "Belgium", code: "BE" },
	{ name: "Sweden", code: "SE" },
	{ name: "Norway", code: "NO" },
	{ name: "Denmark", code: "DK" },
	{ name: "Finland", code: "FI" },
	{ name: "Austria", code: "AT" },
	{ name: "Switzerland", code: "CH" },
	{ name: "Italy", code: "IT" },
	{ name: "Brazil", code: "BR" },
	{ name: "South Africa", code: "ZA" },
	{ name: "United Arab Emirates", code: "AE" },
	{ name: "Ukraine", code: "UA" },
];

// Populates the country dropdown with options from the 'countries' array.
function populateCountries() {
	// Create a default "Select a country" option
	const defaultOption = document.createElement("option");
	defaultOption.value = "";
	defaultOption.textContent = "Choose country";
	countrySelect.appendChild(defaultOption);

	// Add each country from the array as an option
	countries.forEach((country) => {
		const option = document.createElement("option");
		option.value = country.code; // Set the country code as the option's value
		option.textContent = country.name; // Set the country name as the visible text
		countrySelect.appendChild(option);
	});
}

// Renders the event cards for the current page.
// @param {number} page - The current page number to render.

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

// Renders the pagination buttons based on the total number of pages.

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

pagination.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON") return;

	currentPage = Number(e.target.dataset.page);

	renderEvents(currentPage);
	renderPagination();

	window.scrollTo(0, 0);
});

async function getEvents() {
	try {
		const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=200&apikey=${API_KEY}&keyword=${searchQuery}` + (countryCode ? `&countryCode=${countryCode}` : "");

		let res = await fetch(apiUrl);

		// Check if the response is successful
		if (!res.ok) {
			console.error(`HTTP error! status: ${res.status}`);
			eventList.innerHTML = `<p class="error">Failed to load events. Please try again later.</p>`;
			pagination.innerHTML = "";
			events = [];
			return;
		}

		res = await res.json();

		// Check if _embedded.events exists in the response
		if (res._embedded && res._embedded.events) {
			events = res._embedded.events;
			currentPage = 1;
			renderEvents(currentPage);
			renderPagination();
		} else {
			// No events found for the selected country or query
			eventList.innerHTML = `<p class="error">No events found matching your search.</p>`;
			pagination.innerHTML = "";
			events = [];
		}
	} catch (error) {
		console.error("Error fetching events:", error);
		eventList.innerHTML = `<p class="error">An error occurred while fetching events. Please check your internet connection.</p>`;
		pagination.innerHTML = "";
		events = [];
	}
}

// Event listener for country dropdown change
countrySelect.addEventListener("change", _.debounce((e) => {
		countryCode = e.target.value;
		getEvents();
}, 300));

nameInput.addEventListener("input", _.debounce((e) => {
		searchQuery = e.target.value;
		getEvents();
}, 300));

window.addEventListener("resize", () => {
	if (eventsPerPage === (window.screen.width >= 768 && window.screen.width < 1280 ? 21 : 20)) return;

	eventsPerPage = window.screen.width >= 768 && window.screen.width < 1280 ? 21 : 20;
	renderEvents(currentPage);
});

eventList.addEventListener("click", async (e) => {
	if (e.target.parentElement.className !== "event-list-item") return;

	await fetchCardDetails(e.target.parentElement.dataset.id);
	document.querySelector(".overlay").classList.remove("hidden");
});

// Initialize the application on window load
window.onload = function () {
	populateCountries();
	getEvents();
};
