const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

// Armazenamento em memória
const filmes = []
const reviews = []

let proximoIdFilme = 1
let proximoIdReview = 1

// -------- FILMES --------

// Criar filme
app.post('/filmes', (req, res) => {
  const { titulo, genero, ano } = req.body

  if (!titulo || !genero || !ano) {
    return res.status(400).send({ erro: 'Preencha todos os campos: titulo, genero, ano' })
  }

  const novoFilme = {
    id: proximoIdFilme++,
    titulo,
    genero,
    ano
  }

  filmes.push(novoFilme)
  res.status(201).send(novoFilme)
})

// Listar filmes
app.get('/filmes', (req, res) => {
  res.send(filmes)
})

// Editar filme
app.patch('/filmes/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const filme = filmes.find(f => f.id === id)
  if (!filme) return res.status(404).send({ erro: 'Filme não encontrado.' })

  const { titulo, genero, ano } = req.body
  if (titulo) filme.titulo = titulo
  if (genero) filme.genero = genero
  if (ano) filme.ano = ano

  res.send(filme)
})

// Deletar filme (e suas reviews)
app.delete('/filmes/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = filmes.findIndex(f => f.id === id)
  if (index === -1) return res.status(404).send({ erro: 'Filme não encontrado.' })

  filmes.splice(index, 1)

  // Remover reviews associadas
  for (let i = reviews.length - 1; i >= 0; i--) {
    if (reviews[i].filmeId === id) {
      reviews.splice(i, 1)
    }
  }

  res.send({ mensagem: 'Filme e reviews apagados.' })
})

// -------- REVIEWS --------

// Criar review para um filme
app.post('/filmes/:filmeId/reviews', (req, res) => {
  const filmeId = parseInt(req.params.filmeId)
  const filme = filmes.find(f => f.id === filmeId)
  if (!filme) return res.status(404).send({ erro: 'Filme não encontrado.' })

  const { autor, comentario, nota } = req.body
  if (!autor || !comentario || typeof nota !== 'number') {
    return res.status(400).send({ erro: 'Campos obrigatórios: autor, comentario, nota (número).' })
  }

  const novaReview = {
    id: proximoIdReview++,
    filmeId,
    autor,
    comentario,
    nota
  }

  reviews.push(novaReview)
  res.status(201).send(novaReview)
})

// Listar reviews de um filme
app.get('/filmes/:filmeId/reviews', (req, res) => {
  const filmeId = parseInt(req.params.filmeId)
  const lista = reviews.filter(r => r.filmeId === filmeId)
  res.send(lista)
})

// Editar review
app.patch('/reviews/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const review = reviews.find(r => r.id === id)
  if (!review) return res.status(404).send({ erro: 'Review não encontrada.' })

  const { autor, comentario, nota } = req.body
  if (autor) review.autor = autor
  if (comentario) review.comentario = comentario
  if (nota !== undefined) review.nota = nota

  res.send(review)
})

// Deletar review
app.delete('/reviews/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = reviews.findIndex(r => r.id === id)
  if (index === -1) return res.status(404).send({ erro: 'Review não encontrada.' })

  reviews.splice(index, 1)
  res.send({ mensagem: 'Review deletada com sucesso.' })
})

// Iniciar servidor
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`)
})
