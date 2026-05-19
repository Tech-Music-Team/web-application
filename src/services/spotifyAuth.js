/**
 * Serviço de autenticação com a API do Spotify
 * Implementa o fluxo Client Credentials OAuth 2.0
 */

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

/**
 * Obtém um token de acesso do Spotify
 * @returns {Promise<string>} Token de acesso
 * @throws {Error} Se falhar na autenticação
 */
async function obterToken() {
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
    return dados.access_token;
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

module.exports = {
  obterToken,
  fazerRequisicao,
  obterArtista,
};
