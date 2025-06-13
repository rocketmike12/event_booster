// Global variables for events, pagination, and DOM elements
let events = []; 
const eventsPerPage = 21; 
let currentPage = 1; 
let countryCode = '';
let searchQuery = '';

const eventList = document.querySelector(".event-list"); 
const pagination = document.querySelector(".pagination"); 
const countrySelect = document.getElementById("country"); 

const nameInput = document.getElementById("search-by-name-input");
// const nameButton = document.getElementById("search-by-name-button");

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
    { name: "Ukraine", code: "UA"}
];

/**
 * Populates the country dropdown with options from the 'countries' array.
 */
function populateCountries() {
    // Create a default "Select a country" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose country";
    countrySelect.appendChild(defaultOption);

    // Add each country from the array as an option
    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.code; // Set the country code as the option's value
        option.textContent = country.name; // Set the country name as the visible text
        countrySelect.appendChild(option);
    });
}

/**
 * Renders the event cards for the current page.
 * @param {number} page - The current page number to render.
 */
function renderEvents(page) {
    // Calculate the start and end indices for events on the current page
    const start = (page - 1) * eventsPerPage;
    const end = start + eventsPerPage;
    const pageEvents = events.slice(start, end); // Get events for the current page

    // Generate HTML string for each event card
    eventList.innerHTML = pageEvents
        .map(
            (event) => `
            <li class="event-list-item">
                <div class="event-list-leaf"></div>
                <img class="event-list-img" src="${event.images[0]?.url || 'https://placehold.co/200x200/333333/FFFFFF?text=No+Image'}" alt="${event.name || 'Event image'}">
                <div class="p-4 flex flex-col flex-grow">
                    <h2 class="event-list-title">${event.name || 'Unknown Event'}</h2>
                    <p class="event-list-date">${event.dates?.start?.localDate || 'Date N/A'}</p>
                    <p class="event-list-location">
                        <svg class="event-list-location-icon"><use href="#icon-location"></use></svg>
                        ${event._embedded?.venues?.[0]?.name || 'Location N/A'}
                    </p>
                </div>
            </li>
        `
        )
        .join(""); // Join all card HTML strings
}

/**
 * Renders the pagination buttons based on the total number of pages.
 */
function renderPagination() {
    // Calculate total pages based on the number of events and events per page
    const totalPages = Math.ceil(events.length / eventsPerPage);
    let buttons = ""; // String to build pagination buttons

    // Generate buttons for each page
    for (let i = 1; i <= totalPages; i++) {
        buttons += `<button class="page-btn${i === currentPage ? " active" : ""}" data-page="${i}">${i}</button>`;
    }

    // Update pagination HTML with previous, page buttons, and next buttons
    pagination.innerHTML = `
        <button class="prev px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === 1 ? "disabled" : ""}>&larr; Prev</button>
        ${buttons}
        <button class="next px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === totalPages ? "disabled" : ""}>Next &rarr;</button>
    `;

    // Add click listeners to newly rendered pagination buttons
    attachPaginationListeners();
}

/**
 * Attaches event listeners to pagination buttons.
 * This is called after `renderPagination` to ensure listeners are on the latest buttons.
 */
function attachPaginationListeners() {
    // Remove existing listeners to prevent duplicates
    pagination.removeEventListener("click", handlePaginationClick);
    // Add new listener
    pagination.addEventListener("click", handlePaginationClick);
}

/**
 * Handles click events on pagination buttons.
 * @param {Event} e - The click event object.
 */
function handlePaginationClick(e) {
    if (e.target.tagName !== "BUTTON") return; 

    const totalPages = Math.ceil(events.length / eventsPerPage);

    // Handle 'Previous' button click
    if (e.target.classList.contains("prev")) {
        if (currentPage > 1) {
            currentPage--;
        }
    }
    // Handle 'Next' button click
    else if (e.target.classList.contains("next")) {
        if (currentPage < totalPages) {
            currentPage++;
        }
    }
    // Handle specific page number button click
    else if (e.target.classList.contains("page-btn")) {
        currentPage = Number(e.target.dataset.page);
    }

    // Re-render events and pagination after page change
    renderEvents(currentPage);
    renderPagination();
}


async function getEvents() {
    
    try {
        const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=100&apikey=${API_KEY}&keyword=${searchQuery}` +
                       (countryCode ? `&countryCode=${countryCode}` : '');

        let res = await fetch(apiUrl);

        // Check if the response is successful
        if (!res.ok) {
            console.error(`HTTP error! status: ${res.status}`);
            eventList.innerHTML = `<p class="text-center text-red-400 text-xl w-full">Failed to load events. Please try again later.</p>`;
            pagination.innerHTML = ''; 
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
            eventList.innerHTML = `<p class="text-center text-gray-400 text-xl w-full">No events found for the selected country.</p>`;
            pagination.innerHTML = ''; 
            events = []; 
        }
    } catch (error) {
        console.error("Error fetching events:", error);
        eventList.innerHTML = `<p class="text-center text-red-400 text-xl w-full">An error occurred while fetching events. Please check your internet connection.</p>`;
        pagination.innerHTML = ''; 
        events = []; 
    }
}

// Event listener for country dropdown change
countrySelect.addEventListener("change", (e) => {
    countryCode = e.target.value;
    getEvents(); 
});

// Initialize the application on window load
window.onload = function () {
    populateCountries(); 
    getEvents(); 
};


nameInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    getEvents();
});