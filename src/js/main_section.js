let events;

const render = function (data) {
	data.forEach((el) => {
		let newCard = document.createElement("li");
		newCard.innerHTML = `
			<div class="event-list-leaf"></div>
			<img class="event-list-img" src="${el.images[0].url}" alt="">
			<h2 class="event-list-title">${el.name}</h2>
			<p class="event-list-date">${el.dates.start.localDate}</p>
			<p class="event-list-location"><svg class="event-list-location-icon"></svg>${el._embedded.venues[0].name}</p>
		`;
		newCard.className = "event-list-item";
		document.querySelector(".event-list").appendChild(newCard);
	});
};

async function getEvents() {
	let res = await fetch("https://app.ticketmaster.com/discovery/v2/events.json?size=20&apikey=sES9o0k41AqBPlOAoQQCG4iYys2FN6TL");
	res = await res.json();
	events = res._embedded.events;
	render(events);
}

getEvents();
