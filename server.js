import express from 'express';
import pg from 'pg';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentado o limite para suportar o texto da foto da capa

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Rota de Login / Cadastro automático
app.post('/api/auth', async (req, res) => {
    const { email, senha } = req.body;
    try {
        let user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (user.rows.length === 0) {
            const newUser = await pool.query(
                'INSERT INTO usuarios (email, senha) VALUES ($1, $2) RETURNING id, email',
                [email, senha]
            );
            return res.status(201).json(newUser.rows[0]);
        }

        if (user.rows[0].senha === senha) {
            return res.json({ id: user.rows[0].id, email: user.rows[0].email });
        } else {
            return res.status(401).json({ error: 'Senha incorreta' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para salvar livro
app.post('/api/livros', async (req, res) => {
    const { usuario_id, titulo, resumo, total_paginas, paginas_lidas, status, capa_url } = req.body;
    try {
        const novoLivro = await pool.query(
            `INSERT INTO livros (usuario_id, titulo, resumo, total_paginas, paginas_lidas, status, capa_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [usuario_id, titulo, resumo, total_paginas, paginas_lidas, status, capa_url]
        );
        res.status(201).json(novoLivro.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para listar livros do usuário logado
app.get('/api/livros/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const livros = await pool.query('SELECT * FROM livros WHERE usuario_id = $1 ORDER BY criado_em DESC', [usuario_id]);
        res.json(livros.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));