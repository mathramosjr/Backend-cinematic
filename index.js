const express = require('express')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const port = 3000

const cors = require('cors')
app.use(cors())

app.use(express.json())

// Conexão com SQLite
const db = new sqlite3.Database('./lista.sqlite', (err) => {
  if (err) return console.error('Erro ao conectar ao banco:', err.message)
})

// Criação das tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS filmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      genero TEXT NOT NULL,
      ano INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filmeId INTEGER NOT NULL,
      autor TEXT NOT NULL,
      comentario TEXT NOT NULL,
      nota INTEGER NOT NULL,
      FOREIGN KEY(filmeId) REFERENCES filmes(id)
    )
  `)
})

// Utilitário para tratar erros
const enviarErro = (res, status, mensagem) => res.status(status).json({ erro: mensagem })

// ------- FILMES -------

// Criar filme
app.post('/filmes', (req, res) => {
  const { titulo, genero, ano } = req.body
  if (!titulo || !genero || typeof ano !== 'number') return enviarErro(res, 400, 'Campos inválidos.')

  db.run(
    'INSERT INTO filmes (titulo, genero, ano) VALUES (?, ?, ?)',
    [titulo, genero, ano],
    function (err) {
      if (err) return enviarErro(res, 500, 'Erro ao inserir filme.')
      res.status(201).json({ id: this.lastID, titulo, genero, ano })
    }
  )
})

// Listar todos os filmes
app.get('/filmes', (req, res) => {
  db.all('SELECT * FROM filmes', (err, rows) => {
    if (err) return enviarErro(res, 500, 'Erro ao buscar filmes.')
    res.json(rows)
  })
})

// Editar filme
app.patch('/filmes/:id', (req, res) => {
  const id = req.params.id
  const { titulo, genero, ano } = req.body

  db.get('SELECT * FROM filmes WHERE id = ?', [id], (err, filme) => {
    if (err) return enviarErro(res, 500, 'Erro ao buscar filme.')
    if (!filme) return enviarErro(res, 404, 'Filme não encontrado.')

    db.run(
      'UPDATE filmes SET titulo = ?, genero = ?, ano = ? WHERE id = ?',
      [titulo || filme.titulo, genero || filme.genero, ano || filme.ano, id],
      function (err) {
        if (err) return enviarErro(res, 500, 'Erro ao atualizar filme.')
        res.json({ id, titulo: titulo || filme.titulo, genero: genero || filme.genero, ano: ano || filme.ano })
      }
    )
  })
})

// Deletar filme
app.delete('/filmes/:id', (req, res) => {
  db.run('DELETE FROM filmes WHERE id = ?', [req.params.id], function (err) {
    if (err) return enviarErro(res, 500, 'Erro ao deletar filme.')
    if (this.changes === 0) return enviarErro(res, 404, 'Filme não encontrado.')
    res.json({ mensagem: 'Filme deletado com sucesso.' })
  })
})

// ------- REVIEWS -------

// Criar review
app.post('/filmes/:filmeId/reviews', (req, res) => {
  const filmeId = req.params.filmeId
  const { autor, comentario, nota } = req.body

  if (!autor || !comentario || typeof nota !== 'number') {
    return enviarErro(res, 400, 'Campos obrigatórios: autor, comentario, nota (número).')
  }

  db.get('SELECT * FROM filmes WHERE id = ?', [filmeId], (err, filme) => {
    if (err) return enviarErro(res, 500, 'Erro ao buscar filme.')
    if (!filme) return enviarErro(res, 404, 'Filme não encontrado.')

    db.run(
      'INSERT INTO reviews (filmeId, autor, comentario, nota) VALUES (?, ?, ?, ?)',
      [filmeId, autor, comentario, nota],
      function (err) {
        if (err) return enviarErro(res, 500, 'Erro ao inserir review.')
        res.status(201).json({ id: this.lastID, filmeId, autor, comentario, nota })
      }
    )
  })
})

// Listar reviews de um filme
app.get('/filmes/:filmeId/reviews', (req, res) => {
  db.all('SELECT * FROM reviews WHERE filmeId = ?', [req.params.filmeId], (err, rows) => {
    if (err) return enviarErro(res, 500, 'Erro ao buscar reviews.')
    res.json(rows)
  })
})

// Editar review
app.patch('/reviews/:id', (req, res) => {
  const id = req.params.id
  const { autor, comentario, nota } = req.body

  db.get('SELECT * FROM reviews WHERE id = ?', [id], (err, review) => {
    if (err) return enviarErro(res, 500, 'Erro ao buscar review.')
    if (!review) return enviarErro(res, 404, 'Review não encontrada.')

    db.run(
      'UPDATE reviews SET autor = ?, comentario = ?, nota = ? WHERE id = ?',
      [autor || review.autor, comentario || review.comentario, nota ?? review.nota, id],
      function (err) {
        if (err) return enviarErro(res, 500, 'Erro ao atualizar review.')
        res.json({ id, filmeId: review.filmeId, autor: autor || review.autor, comentario: comentario || review.comentario, nota: nota ?? review.nota })
      }
    )
  })
})

// Deletar review
app.delete('/reviews/:id', (req, res) => {
  db.run('DELETE FROM reviews WHERE id = ?', [req.params.id], function (err) {
    if (err) return enviarErro(res, 500, 'Erro ao deletar review.')
    if (this.changes === 0) return enviarErro(res, 404, 'Review não encontrada.')
    res.json({ mensagem: 'Review deletada com sucesso.' })
  })
})

// Iniciar servidor
app.listen(port, () => console.log(`API rodando na porta ${port}`))
