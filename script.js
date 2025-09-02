const API_URL = 'http://localhost:3000'

// Função auxiliar para criar elementos
function criarElemento(tag, innerHTML = '', className = '') {
  const el = document.createElement(tag)
  el.innerHTML = innerHTML
  if (className) el.className = className
  return el
}

// Carrega e exibe todos os filmes
async function carregarFilmes() {
  try {
    const res = await fetch(`${API_URL}/filmes`)
    const filmes = await res.json()
    const container = document.getElementById('lista-filmes')
    container.innerHTML = ''

    for (const filme of filmes) {
      const div = criarElemento('div', '', 'filme')
      div.innerHTML = `
        <strong>${filme.titulo}</strong> (${filme.ano})<br />
        Gênero: ${filme.genero}<br />
        <button onclick="deletarFilme(${filme.id})">Deletar</button>
        <h4>Reviews</h4>
        <ul id="reviews-${filme.id}"><li>Carregando...</li></ul>
      `

      const form = document.createElement('form')
      form.onsubmit = (e) => adicionarReview(e, filme.id)
      form.innerHTML = `
        <input name="autor" placeholder="Autor" required />
        <input name="comentario" placeholder="Comentário" required />
        <input name="nota" type="number" placeholder="Nota" required min="0" max="10" />
        <button type="submit">Adicionar Review</button>
      `
      div.appendChild(form)

      container.appendChild(div)
      carregarReviews(filme.id)
    }
  } catch (err) {
    alert('Erro ao carregar filmes.')
  }
}

// Carrega as reviews de um filme
async function carregarReviews(filmeId) {
  const list = document.getElementById(`reviews-${filmeId}`)
  try {
    const res = await fetch(`${API_URL}/filmes/${filmeId}/reviews`)
    const reviews = await res.json()

    list.innerHTML = reviews.length
      ? reviews.map(r => `<li><strong>${r.autor}</strong>: ${r.comentario} (Nota: ${r.nota})</li>`).join('')
      : '<li>Nenhuma review ainda.</li>'
  } catch {
    list.innerHTML = '<li>Erro ao carregar reviews.</li>'
  }
}

// Adiciona um novo filme
async function adicionarFilme() {
  const titulo = document.getElementById('titulo').value.trim()
  const genero = document.getElementById('genero').value.trim()
  const ano = parseInt(document.getElementById('ano').value)

  if (!titulo || !genero || isNaN(ano)) {
    alert('Preencha todos os campos!')
    return
  }

  try {
    await fetch(`${API_URL}/filmes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, genero, ano })
    })

    document.getElementById('titulo').value = ''
    document.getElementById('genero').value = ''
    document.getElementById('ano').value = ''
    carregarFilmes()
  } catch {
    alert('Erro ao adicionar filme.')
  }
}

// Deleta um filme
async function deletarFilme(id) {
  try {
    await fetch(`${API_URL}/filmes/${id}`, { method: 'DELETE' })
    carregarFilmes()
  } catch {
    alert('Erro ao deletar filme.')
  }
}

// Adiciona uma review
async function adicionarReview(event, filmeId) {
  event.preventDefault()
  const form = event.target
  const autor = form.autor.value.trim()
  const comentario = form.comentario.value.trim()
  const nota = parseInt(form.nota.value)

  if (!autor || !comentario || isNaN(nota)) {
    alert('Preencha todos os campos da review!')
    return
  }

  try {
    await fetch(`${API_URL}/filmes/${filmeId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor, comentario, nota })
    })
    carregarFilmes()
  } catch {
    alert('Erro ao adicionar review.')
  }
}

// Inicializar
carregarFilmes()
