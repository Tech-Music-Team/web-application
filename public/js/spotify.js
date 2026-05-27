var URL_API = 'http://localhost:3333';

async function carregarImagemSpotify(nomeArtista, elemento) {
  var cacheKey = 'simg_' + nomeArtista;
  var urlSalva = sessionStorage.getItem(cacheKey);

  function aplicarImagem(url) {
    var img = document.createElement('img');
    img.src = url;
    img.alt = nomeArtista;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;';
    elemento.innerHTML = '';
    elemento.appendChild(img);
  }

  if (urlSalva) {
    aplicarImagem(urlSalva);
    return;
  }

  try {
    var response = await fetch(URL_API + '/artistas/spotify/buscar-imagem?nome=' + encodeURIComponent(nomeArtista));
    if (!response.ok) return;
    var data = await response.json();
    if (data.imagem && data.imagem.url) {
      aplicarImagem(data.imagem.url);
      sessionStorage.setItem(cacheKey, data.imagem.url);
    }
  } catch (e) {
    console.error('Erro ao carregar imagem do Spotify:', e);
  }
}
