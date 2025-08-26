const express = require('express')
const app = express()
const { v4: uuidv4 } = require('uuid')
const port = 3000

// Aqui guardamos os dados recebidos temporariamente
const dadosArmazenados = []
let proximoId = 1

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Envia os dados (GET)
app.get('/dados', (req, res) => {
  res.send(dadosArmazenados)
})

// Recebe dados (POST)
app.post('/dados', (req, res) => {
  const { nome, idade } = req.body

  if (!nome || typeof nome !== 'string') {
    return res.status(400).send({ erro: 'Nome inválido.' })
  }

  if (typeof idade !== 'number') {
    return res.status(400).send({ erro: 'Idade inválida.' })
  }

  const novoDado = {
    id: proximoId++, // ID simples, ex: 1, 2, 3...
    nome,
    idade
  }

  dadosArmazenados.push(novoDado)
  res.send({ mensagem: 'Criado com sucesso!', dados: novoDado })
})

app.patch('/dados/:id', (req, res) => {
  const id = parseInt(req.params.id) // ID vem da URL
  const dado = dadosArmazenados.find(item => item.id === id)

  if (!dado) {
    return res.status(404).send({ erro: 'Dado não encontrado.' })
  }

  const { nome, idade } = req.body

  if (nome !== undefined) {
    if (typeof nome !== 'string') {
      return res.status(400).send({ erro: '"nome" deve ser string.' })
    }
    dado.nome = nome // atualiza o nome
  }

  if (idade !== undefined) {
    if (typeof idade !== 'number') {
      return res.status(400).send({ erro: '"idade" deve ser número.' })
    }
    dado.idade = idade // atualiza a idade
  }

  res.send({ mensagem: 'Dado atualizado com sucesso!', dados: dado })
})

app.listen(port, () => {
  console.log(`App rodando na porta ${port}`)
})
