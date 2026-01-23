const API = 'http://localhost:3000/api';
const movieList = document.getElementById('movieList');
const searchInput = document.getElementById('searchMovie');


async function loadMovies() {
  const query = searchInput.value;
  const res = await fetch(`${API}/movies?search=${query}`);
  const movies = await res.json();

  movieList.innerHTML = '';

  movies.forEach(movie => {
    const li = document.createElement('li');

    li.innerHTML = `
      ${movie.title} (${movie.year || '-'})
      <button ${!movie.available ? 'disabled' : ''}>
        ${movie.available ? 'Wypożycz' : 'Niedostępny'}
      </button>
    `;

    const btn = li.querySelector('button');
    if (movie.available) {
      btn.onclick = () => rentMovie(movie.id);
    }

    movieList.appendChild(li);
  });
}


async function rentMovie(id) {
  await fetch(`${API}/rentals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'movie', itemId: id })
  });

  loadMovies();
}



searchInput.addEventListener('input', loadMovies);
loadMovies();