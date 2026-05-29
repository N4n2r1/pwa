// Quando rodar local, use http://localhost:3000/api
// Quando publicar no Render, mude para a URL do seu Web Service do Render!
const API_URL = "http://localhost:3000/api"; 

let usuarioLogado = JSON.parse(localStorage.getItem('usuario')) || null;

// Registro do Service Worker do PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
}

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');

function verificarLogin() {
    if (usuarioLogado) {
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        carregarLivros();
    } else {
        authScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }
}

// Evento de Login / Cadastro
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Força o navegador a NÃO recarregar a página
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    console.log("Tentando enviar os dados de login...", { email, senha });

    try {
        const res = await fetch(`${API_URL}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (res.ok) {
            usuarioLogado = await res.json();
            localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
            verificarLogin();
        } else {
            const erroServidor = await res.json();
            alert("Erro na autenticação: " + (erroServidor.error || "Verifique os dados."));
        }
    } catch (err) {
        console.error("Erro detalhado da conexão:", err);
        alert("Erro ao conectar ao servidor backend. Garanta que o terminal do seu backend rodou 'npm start'!");
    }
});

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    usuarioLogado = null;
    verificarLogin();
});

// Enviar livro para o Banco
document.getElementById('book-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const coverFile = document.getElementById('cover').files[0];
    let capa_url = "https://via.placeholder.com/150?text=Sem+Capa";

    if (coverFile) {
        capa_url = await toBase64(coverFile);
    }

    const dadosLivro = {
        usuario_id: usuarioLogado.id,
        titulo: document.getElementById('title').value,
        resumo: document.getElementById('summary').value,
        total_paginas: document.getElementById('total-pages').value,
        paginas_lidas: document.getElementById('read-pages').value,
        status: document.getElementById('status').value,
        capa_url
    };

    const res = await fetch(`${API_URL}/livros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosLivro)
    });

    if (res.ok) {
        this.reset();
        carregarLivros();
    } else {
        alert("Erro ao salvar o livro no banco.");
    }
});

// Carregar livros salvos no Neon
async function carregarLivros() {
    try {
        const res = await fetch(`${API_URL}/livros/${usuarioLogado.id}`);
        const livros = await res.json();
        
        const list = document.getElementById('books-list');
        list.innerHTML = '';
        
        livros.forEach(book => {
            const statusClass = book.status.toLowerCase().replace(' ', '-');
            list.innerHTML += `
                <div class="book-card">
                    <img src="${book.capa_url}" alt="Capa"><br>
                    <h3>${book.titulo}</h3>
                    <p>${book.resumo || 'Sem resumo.'}</p>
                    <p><strong>Páginas:</strong> ${book.paginas_lidas} / ${book.total_paginas}</p>
                    <span class="badge ${statusClass}">${book.status}</span>
                </div>
            `;
        });
    } catch (err) {
        console.log("Erro ao buscar livros do banco.");
    }
}

// Transforma arquivo de imagem em string de texto
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

verificarLogin();