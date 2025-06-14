const authors = JSON.parse(new URL(window.location.href).searchParams.get("author"));
console.log(authors);
