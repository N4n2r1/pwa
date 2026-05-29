// Registrar o Service Worker para o PWA funcionar
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker Registrado com Sucesso!'))
        .catch((err) => console.log('Erro ao registrar Service Worker:', err));
}

// Lógica do App de Livros
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('book-form');
    const bookList = document.getElementById('book-list');

    // Carregar livros salvos
    let books = JSON.parse(localStorage.getItem('books')) || [];

    function displayBooks() {
        bookList.innerHTML = '';
        books.forEach((book, index) => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            let tagClass = book.status === 'Lendo' ? 'lendo' : book.status === 'Lido' ? 'lido' : 'quero';

            card.innerHTML = `
                <h3>${book.title}</h3>
                <p>${book.summary}</p>
                <p><strong>Progresso:</strong> ${book.readPages} / ${book.totalPages} págs</p>
                <span class="tag ${tagClass}">${book.status}</span>
                <button class="delete-btn" onclick="deleteBook(${index})">❌</button>
            `;
            bookList.appendChild(card);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newBook = {
            title: document.getElementById('title').value,
            summary: document.getElementById('summary').value,
            totalPages: document.getElementById('totalPages').value,
            readPages: document.getElementById('readPages').value,
            status: document.getElementById('status').value
        };

        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        displayBooks();
        form.reset();
    });

    // Função global para deletar livro
    window.deleteBook = (index) => {
        books.splice(index, 1);
        localStorage.setItem('books', JSON.stringify(books));
        displayBooks();
    };

    displayBooks();
});