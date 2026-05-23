/**
 * Controller para integração com API do Spotify
 * Retorna dados de artistas incluindo imagens
 */

const spotifyAuth = require("../services/spotifyAuth");

/**
 * Obtém a imagem de um artista do Spotify
 * Retorna apenas a imagem de maior tamanho
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
async function obterImagemArtista(req, res) {
  try {
    const { id } = req.params;

    // Validar se o ID foi fornecido
    if (!id) {
      return res.status(400).json({
        erro: "ID do artista não fornecido",
        mensagem: "Por favor, forneça o Spotify ID do artista na URL",
      });
    }

    console.log(`\nBuscando artista com ID: ${id}`);

    // Obter dados do artista do Spotify
    const artista = await spotifyAuth.obterArtista(id);
    console.log(`Artista encontrado: ${artista}`);
    // Verificar se existem imagens
    if (!artista.images || artista.images.length === 0) {
      return res.status(404).json({
        erro: "Imagem não encontrada",
        mensagem: "O artista não possui imagens no Spotify",
      });
    }

    // Retornar apenas a primeira imagem (maior tamanho)
    const imagemMaior = artista.images[0];

    console.log(`Imagem encontrada para artista: ${artista.name}`);
    console.log(`URL da imagem: ${imagemMaior.url}`);

    return res.status(200).json({
      artistaId: artista.id,
      nomeArtista: artista.name,
      imagem: {
        url: imagemMaior.url,
        altura: imagemMaior.height,
        largura: imagemMaior.width,
      },
    });
  } catch (erro) {
    console.error("Erro ao obter imagem do artista:", erro.message);

    // Tratamento de erros específicos
    if (erro.status === 404) {
      return res.status(404).json({
        erro: "Artista não encontrado",
        mensagem: "O Spotify ID fornecido não corresponde a nenhum artista",
      });
    }

    if (erro.status === 401) {
      return res.status(401).json({
        erro: "Erro de autenticação",
        mensagem: "Falha na autenticação com a API do Spotify",
      });
    }

    if (
      erro.message.includes("SPOTIFY_CLIENT_ID") ||
      erro.message.includes("SPOTIFY_CLIENT_SECRET")
    ) {
      return res.status(500).json({
        erro: "Configuração incompleta",
        mensagem:
          "Credenciais do Spotify não configuradas. Adicione SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET ao .env",
      });
    }

    // Erro genérico
    return res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: erro.message,
    });
  }
}

/**
 * Busca a imagem de um artista pelo nome (pesquisa no Spotify)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
async function buscarImagemPorNome(req, res) {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({
        erro: "Nome do artista não fornecido",
        mensagem: "Forneça o parâmetro 'nome' na query string",
      });
    }

    console.log(`\nBuscando artista por nome: "${nome}"`);

    const artista = await spotifyAuth.searchArtista(nome);

    if (!artista.images || artista.images.length === 0) {
      return res.status(404).json({
        erro: "Imagem não encontrada",
        mensagem: `O artista "${nome}" não possui imagens no Spotify`,
      });
    }

    const imagemMaior = artista.images[0];

    return res.status(200).json({
      artistaId: artista.id,
      nomeArtista: artista.name,
      imagem: {
        url: imagemMaior.url,
        altura: imagemMaior.height,
        largura: imagemMaior.width,
      },
    });
  } catch (erro) {
    console.error("Erro ao buscar imagem por nome:", erro.message);

    if (erro.status === 404) {
      return res.status(404).json({
        erro: "Artista não encontrado",
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: erro.message,
    });
  }
}

module.exports = {
  obterImagemArtista,
  buscarImagemPorNome,
};
