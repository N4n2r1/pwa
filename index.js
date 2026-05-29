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

let deferredPrompt;
const installContainer = document.getElementById('install-container');
const btnInstall = document.getElementById('btn-install');

// 1. Intercepta o evento de instalação do navegador
window.addEventListener('beforeinstallprompt', (e) => {
    // Impede que o Chrome mostre o banner automático dele
    e.preventDefault();
    // Guarda o evento para ser usado quando o usuário clicar no botão
    deferredPrompt = e;
    // Mostra o container com o nosso botão customizado
    installContainer.style.display = 'block';
});

// 2. Lógica do clique no botão
btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
        // Mostra a caixinha nativa de confirmação do Android
        deferredPrompt.prompt();
        // Espera para ver se o usuário aceitou ou recusou
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuário escolheu: ${outcome}`);
        // Limpa o prompt para não ser usado de novo
        deferredPrompt = null;
        // Esconde o botão novamente
        installContainer.style.display = 'none';
    }
});

// 3. Se o app já foi instalado com sucesso, esconde o botão de vez
window.addEventListener('appinstalled', () => {
    console.log('PWA instalado com sucesso!');
    installContainer.style.display = 'none';
});
