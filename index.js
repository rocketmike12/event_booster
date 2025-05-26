const eventsData = [
  {
    img: "img/eurovision.svg",
    name: "Eurovision 2021 Final",
    place: "Palace of Ukraine",
  },
  {
    img: "img/",
    name: "Black Eyed Peas",
    place: "VDNH",
  },
  {
    img: "img/",
    name: "LP",
    place: "Palace of Ukraine",
  },
  // добавить остальные карточки так же...
];

const main = document.createElement("main");
main.classList.add("event-gallery");

const ul = document.createElement("ul");
ul.classList.add("event-list");

eventsData.forEach((event) => {
  const li = document.createElement("li");
  li.classList.add("event-card");

  li.innerHTML = `
    <img src="${event.img}" alt="${event.name}" />
    <div class="event-info">
      <p class="event-name">${event.name}</p>
      <p class="event-place">${event.place}</p>
    </div>
  `;

  ul.appendChild(li);
});

main.appendChild(ul);
document.body.appendChild(main);
