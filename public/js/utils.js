var CORES_POSICAO = ['#D4AF37', '#A8A9AD', '#CD7F32'];

function getUsuarioId() {
    var id = sessionStorage.ID_USUARIO;
    return id ? parseInt(id) : 0;
}

function getPlaceholderColor(id) {
    var cores = ['#A855F7', '#D421BF', '#EC4899', '#06B6D4', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];
    return cores[id % cores.length];
}

function formatarNumero(n) {
    if (n === null || n === undefined) return '--';
    n = Number(n);
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
}

function colorirPosicoes() {
    var rankings = document.querySelectorAll('.ranking-number');
    rankings.forEach(function (el, idx) {
        el.style.color = (idx < CORES_POSICAO.length) ? CORES_POSICAO[idx] : '#1A0A2E';
    });
}

function colorRankingNumbers() {
    var rankings = document.querySelectorAll('.ranking-number');
    var cores = { '1o': '#D4AF37', '2o': '#A8A9AD', '3o': '#CD7F32' };
    rankings.forEach(function (el) {
        var cor = cores[el.textContent.trim()];
        el.style.color = cor || '#000000';
    });
}

function obterIdDaURL() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    return id ? parseInt(id) : null;
}

function dataBRparaISO(dataBR) {
    var partes = dataBR.split('/');
    if (partes.length === 3) {
        return partes[2] + '-' + partes[1] + '-' + partes[0];
    }
    return '';
}

function dataHojeISO() {
    var d = new Date();
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
}

function calcularBadge(v1, v2) {
    var media = (Math.abs(v1) + Math.abs(v2)) / 2;
    if (media === 0) return { melhor: 0, pct1: '0%', pct2: '0%', delta: '0' };
    var melhor = v1 >= v2 ? 1 : 2;
    var pctDiff = Math.abs((v1 - v2) / media * 100).toFixed(1);
    var pct1 = v1 >= v2 ? ('+' + pctDiff + '%') : ('-' + pctDiff + '%');
    var pct2 = v2 >= v1 ? ('+' + pctDiff + '%') : ('-' + pctDiff + '%');
    var deltaNum = v1 - v2;
    var delta;
    if (Math.abs(deltaNum) >= 1e9)      delta = (deltaNum >= 0 ? '+' : '') + (deltaNum / 1e9).toFixed(1) + 'B';
    else if (Math.abs(deltaNum) >= 1e6) delta = (deltaNum >= 0 ? '+' : '') + (deltaNum / 1e6).toFixed(1) + 'M';
    else if (Math.abs(deltaNum) >= 1e3) delta = (deltaNum >= 0 ? '+' : '') + (deltaNum / 1e3).toFixed(1) + 'K';
    else                                delta = (deltaNum >= 0 ? '+' : '') + deltaNum.toFixed(2);
    return { melhor: melhor, pct1: pct1, pct2: pct2, delta: delta };
}
