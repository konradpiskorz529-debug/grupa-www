const API = 'http://localhost:3000/api';
const bookList = document.getElementById('bookList');
const searchInput = document.getElementById('searchBook');


async function loadBooks() {
    const query = searchInput.value;
    const res = await fetch(`${API}/books?search=${query}`);
    const books = await res.json();
  
    bookList.innerHTML = '';
  
    books.forEach(book => {
      const li = document.createElement('li');
  
      li.innerHTML = `
        ${book.title} – ${book.author}
        <button ${!book.available ? 'disabled' : ''}>
          ${book.available ? 'Wypożycz' : 'Niedostępna'}
        </button>
      `;
  
      const btn = li.querySelector('button');
      if (book.available) {
        btn.onclick = () => rentBook(book.id);
      }
  
      bookList.appendChild(li);
    });
  }

async function rentBook(id) {
  await fetch(`${API}/rentals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'book', itemId: id })
  });

  loadBooks();
}
searchInput.addEventListener('input', loadBooks);
loadBooks();
