/**
 * Serviço de autenticação com a API do Spotify
 * Implementa o fluxo Client Credentials OAuth 2.0
 */

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

var _token = null;
var _tokenExpiry = 0;

async function obterToken() {
  if (_token && Date.now() < _tokenExpiry) {
    return _token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não configurados no .env"
    );
  }

  const credenciais = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  try {
    const resposta = await fetch(SPOTIFY_AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credenciais}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!resposta.ok) {
      throw new Error(
        `Erro ao autenticar com Spotify: ${resposta.status} ${resposta.statusText}`
      );
    }

    const dados = await resposta.json();
    _token = dados.access_token;
    _tokenExpiry = Date.now() + (dados.expires_in - 300) * 1000;
    return _token;
  } catch (erro) {
    console.error("Erro na autenticação Spotify:", erro.message);
    throw erro;
  }
}

/**
 * Faz uma requisição para a API do Spotify
 * @param {string} endpoint - Endpoint da API (ex: /artists/{id})
 * @param {string} token - Token de acesso
 * @returns {Promise<Object>} Dados retornados pela API
 * @throws {Error} Se a requisição falhar
 */
async function fazerRequisicao(endpoint, token) {
  const url = `${SPOTIFY_API_BASE_URL}${endpoint}`;

  try {
    const resposta = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resposta.ok) {
      const erro = new Error(
        `Erro na requisição Spotify: ${resposta.status} ${resposta.statusText}`
      );
      erro.status = resposta.status;
      throw erro;
    }

    const dados = await resposta.json();
    return dados;
  } catch (erro) {
    console.error("Erro na requisição Spotify:", erro.message);
    throw erro;
  }
}

/**
 * Obtém informações de um artista do Spotify
 * @param {string} spotifyId - ID do artista no Spotify
 * @returns {Promise<Object>} Dados do artista
 * @throws {Error} Se algo der errado
 */
async function obterArtista(spotifyId) {
  if (!spotifyId) {
    throw new Error("ID do artista não fornecido");
  }

  const token = await obterToken();
  const artista = await fazerRequisicao(`/artists/${spotifyId}`, token);

  return artista;
}

/**
 * Busca um artista no Spotify pelo nome
 * @param {string} nome - Nome do artista
 * @returns {Promise<Object>} Dados do primeiro resultado
 * @throws {Error} Se não encontrar ou der erro
 */
async function searchArtista(nome) {
  if (!nome) {
    throw new Error("Nome do artista não fornecido");
  }

  const token = await obterToken();
  const dados = await fazerRequisicao(
    `/search?q=${encodeURIComponent(nome)}&type=artist&limit=1`,
    token
  );

  if (!dados.artists || dados.artists.items.length === 0) {
    const erro = new Error(`Artista "${nome}" não encontrado no Spotify`);
    erro.status = 404;
    throw erro;
  }

  return dados.artists.items[0];
}

module.exports = {
  obterToken,
  fazerRequisicao,
  obterArtista,
  searchArtista,
};
