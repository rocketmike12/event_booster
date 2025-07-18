const closeBtn = document.querySelector(".close-btn");
const modalOverlay = document.querySelector(".overlay");

function getPrice() {
	let min = Math.floor(Math.random() * 501) + 500;
	let max = min + Math.floor(Math.random() * 351) + 100;

	const round = (value) => {
		const step = value <= 1000 ? 10 : 100;
		const remainder = value % step;
		return remainder < step / 2 ? value - remainder : value + (step - remainder);
	};

	return {
		standart: {
			min: round(min),
			max: round(max),
		},
		vip: {
			min: round(min) + 600,
			max: round(max) + 600,
		},
	};
}

async function fetchCardDetails(id) {
	const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=SAt7OPy9VAeBIPoGa4BTmowGDYLqqKwO`);
	const data = await res.json();

	const who = data._embedded.attractions.map((attraction) => attraction.name);

	const card = {
		image: data.images[0],
		info: data.info,
		dates: {
			localDate: data.dates.start.localDate,
			localTime: data.dates.start.localTime.slice(0, 5),
		},
		timezone: (data.dates.timezone || "World").replace(/_/g, " "),
		venue: data._embedded.venues[0].city,
		who: who,
		price: getPrice(),
	};

	renderCard(card);
}

function renderCard(card) {
	const modal = document.querySelector("[data-modal]");
	const imgs = modal.querySelectorAll("[data-modal-img]");
	const fields = modal.querySelectorAll("[data-modal-info]");

	imgs.forEach((img) => {
		img.style.backgroundImage = `url("${card.image.url}")`;
	});

	fields.forEach((field) => {
		switch (field.dataset.modalInfo) {
			case "when":
				field.innerHTML = `${card.dates.localDate} <br/> ${card.dates.localTime} (${card.timezone})`;
				break;
			case "where":
				field.innerHTML = `${card.timezone.replace("/", ", ")} <br/> ${card.venue.name}`;
				break;
			case "who":
				field.textContent = card.who.join(", ");
				break;
			case "price-standart":
				field.innerHTML = `
                <svg class="svg" width="29" height="20">
					<use href="/src/symbol-defs.svg#icon-barcode"></use>
				</svg>
                Standart ${card.price.standart.min}-${card.price.standart.max} UAH`;
				break;
			case "price-vip":
				field.innerHTML = `
                <svg class="svg" width="29" height="20">
					<use href="/src/symbol-defs.svg#icon-barcode"></use>
				</svg>
                VIP ${card.price.vip.min}-${card.price.vip.max} UAH`;
				break;
			case "author":
				field.href = `author/?author=${JSON.stringify(card.who)}`;
		}
	});
}

const closeModal = function () {
	modalOverlay.classList.add("hidden");
};

closeBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (event) => {
	if (event.target !== event.currentTarget) return;

	closeModal();
});

window.addEventListener("keydown", (event) => {
	if (event.key !== "Escape") return;

	closeModal();
});

export { fetchCardDetails };
