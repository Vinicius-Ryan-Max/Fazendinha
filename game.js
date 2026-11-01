const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let TILE_SIZE = 50; // Cada quadrado terá 50x50
let rows = 8;
let cols = 12;

let grid = [];
let lastFrameTimestamp = null;
let modoPlantio = 'normal';
let celulaPrevia = null;
let celulaToquePendente = null;
let moedas = 5;
let sementes = 5;
const TEMPO_CRESCIMENTO_BASE = 30;
const TEMPO_CRESCIMENTO_MIN = 2;
let tempoCrescimento = TEMPO_CRESCIMENTO_BASE;
const SAVE_KEY = 'fazendinhaGameSave';
const RESET_SESSION_KEY = 'fazendinhaResetPending';
let custoSemente = 5;
let custoExpandirFazenda = 250;
let expandirParaColuna = true;
let habilidade3x3Comprada = false;
let habilidade5x5Comprada = false;
let autoClickers = 0;
let custoAutoClicker = 50;
let multiplicadorDeLucro = 1;
let custoFertilizante = 75;
let comprasUpgrade5s = 0;
let comprasUpgrade10s = 0;
let habilidadeFazendaCompletaDesbloqueada = false;
let cliquesUltimoEmBreve = 0;
const CLIQUES_PARA_EASTER_EGG = 69;

const CUSTO_HABILIDADE_3X3 = 50;
const CUSTO_HABILIDADE_5X5 = 100;
const CUSTO_UPGRADE_5S = 100;
const CUSTO_UPGRADE_10S = 200;
const CUSTO_FERTILIZANTE = 75;
const INCREMENTO_FERTILIZANTE = 0.2;

const imgGrama = new Image();
const imgTerra = new Image();
const imgPlantaP = new Image();
const imgPlantaG = new Image();
let gramaPattern = null;
let imagesLoaded = 0;
let gameStarted = false;
const totalImages = 4;
let cliquesArvore = 0;
let pontosEvolucao = 0;
let nivelPlantacao = 1;
let multiplicadorNivel = 1;
const MAX_NIVEL_PLANTACAO = 5;
const CULTURAS = {
    cenoura: { emoji: '🥕', tempo: 0.65, renda: 0.8 },
    abobora: { emoji: '🎃', tempo: 1.8, renda: 2.5 }
};
let cultivoSelecionado = 'cenoura';
let aboboraDesbloqueada = false;
let galinhas = 0;
let vacas = 0;
let ovos = 0;
let leites = 0;
let tempoOvos = 0;
let tempoLeite = 0;
const TUTORIAL_ETAPAS = [
    { id: 'plantar', texto: 'Abra um canteiro e plante uma semente.' },
    { id: 'colher', texto: 'Colha sua primeira planta.' },
    { id: 'upgrade', texto: 'Compre uma melhoria na loja.' },
    { id: 'expandir', texto: 'Expanda sua fazenda.' }
];
let etapaTutorial = 0;
let totalColheitas = 0;
let dataMissaoDiaria = new Date().toLocaleDateString('sv-SE');
let semanaMissao = obterChaveSemana(new Date());
let somAtivo = true;
let audioContext = null;
let eventoAtivo = null;
let eventoRestante = 0;
let proximoEventoEm = 35;
let tempoDesdeVerificacaoData = 0;
let saveTimeout = null;
let reiniciandoJogo = false;
const DURACAO_EVENTO = 25;

const EVENTOS = {
    chuva: { titulo: '🌧️ Chuva boa', descricao: 'As plantas crescem 75% mais rápido.', crescimento: 1.75, renda: 1 },
    sol: { titulo: '☀️ Sol forte', descricao: 'As colheitas rendem 50% mais moedas.', crescimento: 1, renda: 1.5 },
    praga: { titulo: '🐛 Praga', descricao: 'As colheitas rendem menos até a praga passar.', crescimento: 1, renda: 0.65 }
};

const MISSOES = {
    diarias: [
        { acao: 'harvest', verbo: 'Colha', unidade: 'plantas', alvo: 10, recompensa: 100 },
        { acao: 'plant', verbo: 'Plante', unidade: 'sementes', alvo: 12, recompensa: 90 },
        { acao: 'coins', verbo: 'Ganhe', unidade: 'moedas', alvo: 250, recompensa: 120 },
        { acao: 'tree', verbo: 'Toque na árvore', unidade: 'vezes', alvo: 20, recompensa: 100 }
    ],
    semanais: [
        { acao: 'harvest', verbo: 'Colha', unidade: 'plantas', alvo: 50, recompensa: 300 },
        { acao: 'plant', verbo: 'Plante', unidade: 'sementes', alvo: 60, recompensa: 280 },
        { acao: 'coins', verbo: 'Ganhe', unidade: 'moedas', alvo: 1500, recompensa: 350 },
        { acao: 'tree', verbo: 'Toque na árvore', unidade: 'vezes', alvo: 100, recompensa: 320 }
    ],
    jornada: [
        { acao: 'harvest', verbo: 'Colha', unidade: 'plantas', alvo: 100, recompensa: 500 },
        { acao: 'plant', verbo: 'Plante', unidade: 'sementes', alvo: 120, recompensa: 450 },
        { acao: 'coins', verbo: 'Ganhe', unidade: 'moedas', alvo: 5000, recompensa: 650 },
        { acao: 'tree', verbo: 'Toque na árvore', unidade: 'vezes', alvo: 250, recompensa: 550 }
    ]
};
const NOMES_MISSAO = {
    diarias: 'Missão diária',
    semanais: 'Missão semanal',
    jornada: 'Missão da jornada'
};
let missoes = {
    diarias: { indice: 0, progresso: 0 },
    semanais: { indice: 0, progresso: 0 },
    jornada: { indice: 0, progresso: 0 }
};

function obterChaveSemana(data) {
    const dataUTC = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
    dataUTC.setUTCDate(dataUTC.getUTCDate() + 4 - (dataUTC.getUTCDay() || 7));
    const inicioAno = new Date(Date.UTC(dataUTC.getUTCFullYear(), 0, 1));
    const numeroSemana = Math.ceil((((dataUTC - inicioAno) / 86400000) + 1) / 7);
    return `${dataUTC.getUTCFullYear()}-W${String(numeroSemana).padStart(2, '0')}`;
}

function atualizarUI() {
    const moedaPrint = formatarNumero(moedas);
    const sementesPrint = formatarNumero(sementes);
    const custoSementePrint = formatarNumero(custoSemente);
    const custoFertilizantePrint = formatarNumero(custoFertilizante);
    const custoExpandirPrint = formatarNumero(custoExpandirFazenda);
    const custoUpgrade5sPrint = formatarNumero(calcularCustoUpgrade5s());
    const custoUpgrade10sPrint = formatarNumero(calcularCustoUpgrade10s());

    document.getElementById('moedas').textContent = moedaPrint;
    document.getElementById('sementes').textContent = sementesPrint;
    document.getElementById('fazenda-tamanho').textContent = `${rows}x${cols}`;
    document.getElementById('tempo-cultivo').textContent = `${(getTempoCrescimento(cultivoSelecionado) / 1000).toFixed(tempoCrescimento % 1 ? 1 : 0)}s`;
    document.getElementById('modo-plantio').textContent = modoPlantio === 'normal' ? 'Normal' : modoPlantio === '3x3' ? '3x3' : modoPlantio === '5x5' ? '5x5' : 'Fazenda Total';
    document.getElementById('comprar-semente').textContent = `Comprar Semente (${custoSementePrint} moedas)`;
    document.getElementById('comprar-3x3').textContent = habilidade3x3Comprada ? 'Habilidade 3x3 Comprada' : `Comprar Habilidade 3x3 (${CUSTO_HABILIDADE_3X3} moedas)`;
    document.getElementById('comprar-5x5').textContent = habilidade5x5Comprada ? 'Habilidade 5x5 Comprada' : `Comprar Habilidade 5x5 (${CUSTO_HABILIDADE_5X5} moedas)`;
    document.getElementById('expandir-fazenda').textContent = `Expandir Fazenda (${custoExpandirPrint} moedas)`;
    document.getElementById('rank-fazenda').textContent = obterRankFazenda();
    document.getElementById('som-toggle').textContent = somAtivo ? '🔊 Som' : '🔇 Som';
    document.getElementById('som-toggle').setAttribute('aria-pressed', String(somAtivo));
    document.getElementById('upgrade-velocidade-5s').textContent = `Crescimento -3s (${custoUpgrade5sPrint} moedas)`;
    document.getElementById('upgrade-velocidade-10s').textContent = `Crescimento -5s (${custoUpgrade10sPrint} moedas)`;
    document.getElementById('cultivo-cenoura').classList.toggle('selected-mode', cultivoSelecionado === 'cenoura');
    const btnAbobora = document.getElementById('cultivo-abobora');
    btnAbobora.textContent = aboboraDesbloqueada
        ? '🎃 Abóbora · valiosa'
        : '🔒 Desbloquear abóbora (150 moedas)';
    btnAbobora.classList.toggle('selected-mode', cultivoSelecionado === 'abobora');
    btnAbobora.title = aboboraDesbloqueada
        ? 'Abóbora rende mais por colheita, mas leva mais tempo para crescer.'
        : 'Desbloqueia permanentemente a abóbora, que rende mais e cresce mais devagar.';
    document.getElementById('comprar-galinha').textContent = `🐔 Comprar galinha (${formatarNumero(100 + galinhas * 75)} moedas)`;
    document.getElementById('comprar-vaca').textContent = `🐄 Comprar vaca (${formatarNumero(250 + vacas * 150)} moedas)`;
    document.getElementById('vender-ovos').textContent = `Vender ovos (${ovos}) · ${formatarNumero(ovos * 12)} moedas`;
    document.getElementById('vender-leite').textContent = `Vender leite (${leites}) · ${formatarNumero(leites * 30)} moedas`;
    document.getElementById('tela-comprar-galinha').textContent = `🐔 Comprar galinha (${formatarNumero(100 + galinhas * 75)} moedas)`;
    document.getElementById('tela-comprar-vaca').textContent = `🐄 Comprar vaca (${formatarNumero(250 + vacas * 150)} moedas)`;
    document.getElementById('tela-vender-ovos').textContent = `Vender ovos (${ovos}) · ${formatarNumero(ovos * 12)} moedas`;
    document.getElementById('tela-vender-leite').textContent = `Vender leite (${leites}) · ${formatarNumero(leites * 30)} moedas`;
    
    if (document.getElementById('melhorar-fertilizante')) {
        document.getElementById('melhorar-fertilizante').textContent = `Melhorar Fertilizante +${INCREMENTO_FERTILIZANTE}x (${custoFertilizantePrint} moedas)`;
        document.getElementById('melhorar-fertilizante').disabled = moedas < custoFertilizante;
    }

    document.getElementById('comprar-semente').disabled = moedas < custoSemente;
    document.getElementById('comprar-3x3').disabled = habilidade3x3Comprada || moedas < CUSTO_HABILIDADE_3X3;
    document.getElementById('comprar-5x5').disabled = habilidade5x5Comprada || moedas < CUSTO_HABILIDADE_5X5;
    document.getElementById('upgrade-velocidade-5s').disabled = moedas < calcularCustoUpgrade5s() || tempoCrescimento <= 2;
    document.getElementById('upgrade-velocidade-10s').disabled = moedas < calcularCustoUpgrade10s() || tempoCrescimento <= 2;
    document.getElementById('expandir-fazenda').disabled = moedas < custoExpandirFazenda;
    document.getElementById('comprar-galinha').disabled = moedas < 100 + galinhas * 75;
    document.getElementById('comprar-vaca').disabled = moedas < 250 + vacas * 150;
    document.getElementById('vender-ovos').disabled = ovos <= 0;
    document.getElementById('vender-leite').disabled = leites <= 0;
    document.getElementById('tela-comprar-galinha').disabled = moedas < 100 + galinhas * 75;
    document.getElementById('tela-comprar-vaca').disabled = moedas < 250 + vacas * 150;
    document.getElementById('tela-vender-ovos').disabled = ovos <= 0;
    document.getElementById('tela-vender-leite').disabled = leites <= 0;
    btnAbobora.disabled = !aboboraDesbloqueada && moedas < 150;
    document.getElementById('modo-fazenda').style.display = habilidadeFazendaCompletaDesbloqueada ? 'block' : 'none';

    atualizarEvolucaoUI();
    atualizarProgressoUI();
    agendarSave();
}

function getTempoCrescimento(cultivo = cultivoSelecionado) {
    return Math.max(TEMPO_CRESCIMENTO_MIN, tempoCrescimento) *
        (CULTURAS[cultivo] || CULTURAS.cenoura).tempo * 1000;
}

function formatarNumero(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}

function calcularValorColheita(tile) {
    const multiplicadorClima = eventoAtivo ? EVENTOS[eventoAtivo].renda : 1;
    const cultura = CULTURAS[tile.cultivo] || CULTURAS.cenoura;
    return Math.max(1, Math.round(15 * multiplicadorNivel * multiplicadorDeLucro * multiplicadorClima * cultura.renda));
}

function calcularCustoUpgrade5s() {
    return Math.ceil(CUSTO_UPGRADE_5S * Math.pow(1.75, comprasUpgrade5s));
}

function calcularCustoUpgrade10s() {
    return Math.ceil(CUSTO_UPGRADE_10S * Math.pow(1.8, comprasUpgrade10s));
}

function criarDadosSave() {
    return {
        moedas,
        sementes,
        autoClickers,
        custoAutoClicker,
        tempoCrescimento,
        comprasUpgrade5s,
        comprasUpgrade10s,
        multiplicadorDeLucro,
        custoFertilizante,
        custoSemente,
        custoExpandirFazenda,
        nivelPlantacao,
        habilidade3x3Comprada,
        habilidade5x5Comprada,
        habilidadeFazendaCompletaDesbloqueada,
        etapaTutorial,
        totalColheitas,
        dataMissaoDiaria,
        somAtivo,
        cliquesArvore,
        pontosEvolucao,
        cultivoSelecionado,
        aboboraDesbloqueada,
        galinhas,
        vacas,
        ovos,
        leites,
        tempoOvos,
        tempoLeite,
        semanaMissao,
        missoes,
        rows,
        cols,
        grid: grid.map(tile => ({
            state: tile.state,
            tempoCrescimento: tile.tempoCrescimento,
            cultivo: tile.cultivo
        }))
    };
}

function salvarJogo() {
    if (reiniciandoJogo) return;

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(criarDadosSave()));
    } catch (error) {
        console.warn('Não foi possível salvar o jogo:', error);
    }
}

function agendarSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        salvarJogo();
        mostrarMensagemSave('Jogo salvo');
    }, 900);
}

function atualizarProgressoUI() {
    const objetivoEl = document.getElementById('objetivo-tutorial');
    const progressoEl = document.getElementById('progresso-tutorial');
    if (etapaTutorial >= TUTORIAL_ETAPAS.length) {
        objetivoEl.textContent = 'Tutorial concluído! Sua fazenda está pronta para crescer.';
        progressoEl.style.width = '100%';
    } else {
        objetivoEl.textContent = `${etapaTutorial + 1}/4 · ${TUTORIAL_ETAPAS[etapaTutorial].texto}`;
        progressoEl.style.width = `${(etapaTutorial / TUTORIAL_ETAPAS.length) * 100}%`;
    }

    document.getElementById('animais-galinhas').textContent = galinhas;
    document.getElementById('animais-vacas').textContent = vacas;
    document.getElementById('animais-ovos').textContent = ovos;
    document.getElementById('animais-leites').textContent = leites;
    desenharAnimais();
    atualizarMissoesUI();
}

function obterMissaoAtual(categoria) {
    const lista = MISSOES[categoria];
    const estado = missoes[categoria];
    const indice = Math.max(0, Math.floor(estado.indice));
    const modelo = lista[indice % lista.length];
    const ciclo = Math.floor(indice / lista.length);
    return {
        ...modelo,
        alvo: modelo.alvo + Math.ceil(modelo.alvo * ciclo / 5),
        recompensa: modelo.recompensa + Math.floor(modelo.recompensa * ciclo * 12 / 100),
        nivel: ciclo + 1
    };
}

function atualizarMissoesUI() {
    const categoria = document.querySelector('.mission-tab[aria-selected="true"]')?.dataset.missionTab || 'diarias';
    const missao = obterMissaoAtual(categoria);
    const estado = missoes[categoria];
    const progresso = Math.min(estado.progresso, missao.alvo);
    const sequencia = categoria === 'jornada'
        ? `Etapa ${estado.indice + 1} · nível ${missao.nivel}`
        : `Sequência ${categoria === 'diarias' ? 'diária' : 'semanal'} · missão ${estado.indice + 1}`;

    document.getElementById('mission-cycle').textContent = NOMES_MISSAO[categoria];
    document.getElementById('mission-title').textContent = `${missao.verbo} ${formatarNumero(missao.alvo)} ${missao.unidade}`;
    document.getElementById('mission-description').textContent =
        `Progresso: ${formatarNumero(progresso)}/${formatarNumero(missao.alvo)}`;
    document.getElementById('mission-progress-bar').style.width =
        `${Math.min(100, progresso / missao.alvo * 100)}%`;
    document.getElementById('mission-reward').textContent =
        `Recompensa: ${formatarNumero(missao.recompensa)} moedas`;
    document.getElementById('mission-next').textContent = sequencia;
}

function registrarProgressoMissoes(acao, quantidade = 1) {
    if (quantidade <= 0) return;
    let atualizou = false;
    Object.keys(MISSOES).forEach(categoria => {
        const estado = missoes[categoria];
        let restante = quantidade;
        let tentativas = 0;
        while (restante > 0 && tentativas < 1000) {
            const missao = obterMissaoAtual(categoria);
            if (missao.acao !== acao) break;
            const aplicado = Math.min(restante, missao.alvo - estado.progresso);
            estado.progresso += aplicado;
            restante -= aplicado;
            atualizou = true;
            if (estado.progresso < missao.alvo) break;

            moedas += missao.recompensa;
            mostrarToast(`🎯 ${NOMES_MISSAO[categoria]}: +${formatarNumero(missao.recompensa)} moedas`, canvas.width / 2, 24);
            playSound('evoluir');
            estado.indice++;
            estado.progresso = 0;
            tentativas++;
        }
    });
    if (atualizou) {
        atualizarMissoesUI();
        agendarSave();
    }
}

function obterRankFazenda() {
    if (totalColheitas >= 100) return 'Lendária';
    if (totalColheitas >= 50) return 'Próspera';
    if (totalColheitas >= 10) return 'Produtiva';
    return 'Semente';
}

function desenharAnimais() {
    const pasto = document.getElementById('animal-pasture');
    const fragmento = document.createDocumentFragment();
    const quantidadeVisivel = Math.min(20, galinhas + vacas);
    for (let indice = 0; indice < quantidadeVisivel; indice++) {
        const animal = document.createElement('span');
        animal.className = 'pasture-animal';
        animal.textContent = indice < galinhas ? '🐔' : '🐄';
        animal.style.animationDelay = `${(indice % 5) * 0.12}s`;
        fragmento.appendChild(animal);
    }

    if (galinhas + vacas > quantidadeVisivel) {
        const extra = document.createElement('span');
        extra.className = 'pasture-animal-count';
        extra.textContent = `+${galinhas + vacas - quantidadeVisivel}`;
        fragmento.appendChild(extra);
    }
    if (galinhas + vacas === 0) {
        const vazio = document.createElement('span');
        vazio.className = 'pasture-empty';
        vazio.textContent = 'Compre sua primeira galinha ou vaca para povoar o pasto.';
        fragmento.appendChild(vazio);
    }
    pasto.replaceChildren(fragmento);
}

function concluirTutorial(acao) {
    if (TUTORIAL_ETAPAS[etapaTutorial]?.id !== acao) return;
    etapaTutorial++;
    playSound('evoluir');
    atualizarProgressoUI();
    mostrarToast(`Objetivo concluído · ${etapaTutorial}/4`, canvas.width / 2, 24);
}

function mostrarToast(texto, x, y, tipo = '') {
    const container = document.getElementById('game-toasts');
    const rect = canvas.getBoundingClientRect();
    const escalaX = rect.width / canvas.width;
    const escalaY = rect.height / canvas.height;
    const toast = document.createElement('span');
    toast.className = `floating-toast ${tipo}`;
    toast.textContent = texto;
    toast.style.left = `${rect.left + x * escalaX}px`;
    toast.style.top = `${rect.top + y * escalaY}px`;
    container.appendChild(toast);
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

function playSound(tipo) {
    if (!somAtivo) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioContext = audioContext || new AudioContextClass();
        if (audioContext.state === 'suspended') audioContext.resume();

        const agora = audioContext.currentTime;
        const notas = tipo === 'comprar'
            ? [660, 880]
            : tipo === 'colher'
                ? [523, 784]
                : [660, 880, 1047];
        notas.forEach((frequencia, indice) => {
            const oscilador = audioContext.createOscillator();
            const volume = audioContext.createGain();
            const inicio = agora + indice * 0.07;
            oscilador.type = 'sine';
            oscilador.frequency.setValueAtTime(frequencia, inicio);
            volume.gain.setValueAtTime(0.0001, inicio);
            volume.gain.exponentialRampToValueAtTime(0.07, inicio + 0.015);
            volume.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);
            oscilador.connect(volume);
            volume.connect(audioContext.destination);
            oscilador.start(inicio);
            oscilador.stop(inicio + 0.17);
        });
    } catch (error) {
        console.warn('Não foi possível reproduzir o efeito sonoro:', error);
    }
}

function verificarViradaMissao() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    let alterou = false;
    if (dataMissaoDiaria !== hoje) {
        dataMissaoDiaria = hoje;
        missoes.diarias.progresso = 0;
        alterou = true;
    }

    const semanaAtual = obterChaveSemana(new Date());
    if (semanaMissao !== semanaAtual) {
        semanaMissao = semanaAtual;
        missoes.semanais.progresso = 0;
        alterou = true;
    }
    if (alterou) {
        atualizarProgressoUI();
        agendarSave();
    }
}

function atualizarEvento(delta) {
    tempoDesdeVerificacaoData += delta;
    if (tempoDesdeVerificacaoData >= 1000) {
        tempoDesdeVerificacaoData %= 1000;
        verificarViradaMissao();
    }
    const anterior = Math.ceil(eventoAtivo ? eventoRestante : proximoEventoEm);
    if (eventoAtivo) {
        eventoRestante -= delta / 1000;
        if (eventoRestante <= 0) {
            eventoAtivo = null;
            proximoEventoEm = 45;
        }
    } else {
        proximoEventoEm -= delta / 1000;
        if (proximoEventoEm <= 0) {
            const tipos = Object.keys(EVENTOS);
            eventoAtivo = tipos[Math.floor(Math.random() * tipos.length)];
            eventoRestante = DURACAO_EVENTO;
        }
    }

    const restante = Math.ceil(eventoAtivo ? eventoRestante : proximoEventoEm);
    if (restante !== anterior || restante <= 0) atualizarEventoUI();
}

function atualizarEventoUI() {
    const titulo = document.getElementById('evento-titulo');
    const descricao = document.getElementById('evento-descricao');
    const tempo = document.getElementById('evento-tempo');
    if (!titulo || !descricao || !tempo) return;
    if (eventoAtivo) {
        const evento = EVENTOS[eventoAtivo];
        titulo.textContent = evento.titulo;
        descricao.textContent = evento.descricao;
        tempo.textContent = `Termina em ${Math.ceil(eventoRestante)}s`;
    } else {
        titulo.textContent = '🌤️ Clima da fazenda';
        descricao.textContent = 'Prepare-se para a próxima mudança de clima.';
        tempo.textContent = `Próximo evento em ${Math.ceil(proximoEventoEm)}s`;
    }
}

function registrarColheita(tile) {
    tile.state = 'terra';
    tile.tempoCrescimento = 0;
    const valor = calcularValorColheita(tile);
    moedas += valor;
    registrarProgressoMissoes('coins', valor);
    sementes += 1;
    totalColheitas++;
    registrarProgressoMissoes('harvest');

    mostrarToast(`+${formatarNumero(valor)} moedas`, tile.x + TILE_SIZE / 2, tile.y + 8);
    mostrarToast('+1 semente', tile.x + TILE_SIZE / 2, tile.y + 28, 'seed');
    concluirTutorial('colher');
    atualizarProgressoUI();
}

function produzirItensAnimais(delta) {
    if (!galinhas && !vacas) return;
    tempoOvos += delta;
    tempoLeite += delta;
    let produziu = false;
    while (galinhas && tempoOvos >= 30000) {
        ovos += galinhas;
        tempoOvos -= 30000;
        produziu = true;
    }
    while (vacas && tempoLeite >= 50000) {
        leites += vacas;
        tempoLeite -= 50000;
        produziu = true;
    }
    if (produziu) {
        mostrarToast('🐾 Seus animais produziram!', canvas.width / 2, 16);
        atualizarUI();
    }
}

function carregarJogo() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return false;

        const data = JSON.parse(saved);
        if (!data || typeof data !== 'object' || !Array.isArray(data.grid)) return false;

        moedas = Number(data.moedas) || moedas;
        sementes = Number(data.sementes) || sementes;
        autoClickers = Number(data.autoClickers) || autoClickers;
        custoAutoClicker = Number(data.custoAutoClicker) || custoAutoClicker;
        tempoCrescimento = Math.max(TEMPO_CRESCIMENTO_MIN, Number(data.tempoCrescimento) || tempoCrescimento);
        comprasUpgrade5s = Number(data.comprasUpgrade5s) || comprasUpgrade5s;
        comprasUpgrade10s = Number(data.comprasUpgrade10s) || comprasUpgrade10s;
        multiplicadorDeLucro = Number(data.multiplicadorDeLucro) || multiplicadorDeLucro;
        custoFertilizante = Number(data.custoFertilizante) || custoFertilizante;
        custoSemente = Number(data.custoSemente) || custoSemente;
        custoExpandirFazenda = Number(data.custoExpandirFazenda) || custoExpandirFazenda;
        nivelPlantacao = Number(data.nivelPlantacao) || nivelPlantacao;
        habilidade3x3Comprada = Boolean(data.habilidade3x3Comprada);
        habilidade5x5Comprada = Boolean(data.habilidade5x5Comprada);
        habilidadeFazendaCompletaDesbloqueada = Boolean(data.habilidadeFazendaCompletaDesbloqueada);
        etapaTutorial = Math.min(TUTORIAL_ETAPAS.length, Number(data.etapaTutorial) || 0);
        totalColheitas = Number(data.totalColheitas) || 0;
        dataMissaoDiaria = data.dataMissaoDiaria || dataMissaoDiaria;
        somAtivo = data.somAtivo !== false;
        cliquesArvore = Number(data.cliquesArvore) || 0;
        pontosEvolucao = Number(data.pontosEvolucao) || 0;
        cultivoSelecionado = CULTURAS[data.cultivoSelecionado] ? data.cultivoSelecionado : 'cenoura';
        aboboraDesbloqueada = data.aboboraDesbloqueada == null
            ? cultivoSelecionado === 'abobora'
            : Boolean(data.aboboraDesbloqueada);
        if (!aboboraDesbloqueada && cultivoSelecionado === 'abobora') cultivoSelecionado = 'cenoura';
        galinhas = Math.max(0, Number(data.galinhas) || 0);
        vacas = Math.max(0, Number(data.vacas) || 0);
        ovos = Math.max(0, Number(data.ovos) || 0);
        leites = Math.max(0, Number(data.leites) || 0);
        tempoOvos = Math.max(0, Number(data.tempoOvos) || 0);
        tempoLeite = Math.max(0, Number(data.tempoLeite) || 0);
        semanaMissao = data.semanaMissao || semanaMissao;
        missoes = {
            diarias: { indice: 0, progresso: 0 },
            semanais: { indice: 0, progresso: 0 },
            jornada: { indice: 0, progresso: 0 }
        };
        if (data.missoes && typeof data.missoes === 'object') {
            Object.keys(MISSOES).forEach(categoria => {
                const salvo = data.missoes[categoria];
                if (!salvo || typeof salvo !== 'object') return;
                const indice = Number(salvo.indice);
                const progresso = Number(salvo.progresso);
                missoes[categoria] = {
                    indice: Number.isSafeInteger(indice) && indice >= 0 ? indice : 0,
                    progresso: Number.isFinite(progresso) ? Math.max(0, progresso) : 0
                };
            });
        } else {
            const colheitasSemanaAntiga = data.colheitasSemana == null
                ? Object.entries(data.historicoColheitas || {})
                    .filter(([dia]) => obterChaveSemana(new Date(`${dia}T12:00:00`)) === semanaMissao)
                    .reduce((total, [, quantidade]) => total + Number(quantidade || 0), 0)
                : Math.max(0, Number(data.colheitasSemana) || 0);
            missoes.diarias = {
                indice: data.missaoConcluida ? 1 : 0,
                progresso: data.missaoConcluida ? 0 : Math.max(0, Number(data.colheitasHoje) || 0)
            };
            missoes.semanais = {
                indice: data.missaoSemanalConcluida ? 1 : 0,
                progresso: data.missaoSemanalConcluida ? 0 : colheitasSemanaAntiga
            };
        }
        Object.keys(MISSOES).forEach(categoria => {
            missoes[categoria].progresso = Math.min(
                missoes[categoria].progresso,
                obterMissaoAtual(categoria).alvo
            );
        });
        verificarViradaMissao();
        rows = Number(data.rows) || rows;
        cols = Number(data.cols) || cols;

        grid = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const index = r * cols + c;
                const savedTile = data.grid[index] || { state: 'grama', tempoCrescimento: 0 };
                const tile = criarTile(r, c, savedTile.state || 'grama');
                tile.tempoCrescimento = Number(savedTile.tempoCrescimento) || 0;
                tile.cultivo = CULTURAS[savedTile.cultivo] ? savedTile.cultivo : 'cenoura';
                grid.push(tile);
            }
        }

        atualizarMultiplicadorNivel();
        return true;
    } catch (error) {
        console.warn('Falha ao carregar o jogo salvo:', error);
        return false;
    }
}

function mostrarMensagemSave(text) {
    let mensagem = document.getElementById('save-message');
    if (!mensagem) {
        mensagem = document.createElement('div');
        mensagem.id = 'save-message';
        mensagem.style.position = 'fixed';
        mensagem.style.right = '20px';
        mensagem.style.top = 'auto';
        mensagem.style.bottom = '80px';
        mensagem.style.padding = '10px 14px';
        mensagem.style.background = 'rgba(0, 0, 0, 0.75)';
        mensagem.style.color = '#fff';
        mensagem.style.borderRadius = '8px';
        mensagem.style.fontSize = '14px';
        mensagem.style.zIndex = '11001';
        mensagem.style.opacity = '0';
        mensagem.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(mensagem);
    }

    mensagem.textContent = text;
    mensagem.style.opacity = '1';

    clearTimeout(mensagem.hideTimeout);
    mensagem.hideTimeout = setTimeout(() => {
        mensagem.style.opacity = '0';
    }, 1400);
}

function criarTile(r, c, state = 'grama') {
    return {
        x: c * TILE_SIZE,
        y: r * TILE_SIZE,
        state,
        cultivo: cultivoSelecionado,
        tempoCrescimento: 0
    };
}

function ajustarCanvasResponsivo() {
    if (window.innerWidth < 600) {
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        const availableWidth = Math.max(300, window.innerWidth - 40);
        const newSize = Math.max(25, Math.floor(availableWidth / cols));
        TILE_SIZE = newSize;
    } else {
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        TILE_SIZE = 60;
    }

    ajustarTamanhoCanvas();

    grid.forEach((tile, index) => {
        const r = Math.floor(index / cols);
        const c = index % cols;
        tile.x = c * TILE_SIZE;
        tile.y = r * TILE_SIZE;
    });
}

function ajustarTamanhoCanvas() {
    canvas.width = cols * TILE_SIZE;
    canvas.height = rows * TILE_SIZE;
}

function getPontosParaProximoNivel(level) {
    switch (level) {
        case 2:
            return 10;
        case 3:
            return 25;
        case 4:
            return 40;
        case 5:
            return 50;
        default:
            return 0;
    }
}

function atualizarMultiplicadorNivel() {
    multiplicadorNivel = nivelPlantacao;
}

function atualizarEvolucaoUI() {
    const barra = document.getElementById('barra-evolucao');
    if (barra) {
        barra.value = cliquesArvore;
    }
    const nivelEvolucaoEl = document.getElementById('nivel-evolucao');
    if (nivelEvolucaoEl) {
        nivelEvolucaoEl.textContent = pontosEvolucao;
    }
    const nivelPlantacaoEl = document.getElementById('nivel-plantacao');
    if (nivelPlantacaoEl) {
        nivelPlantacaoEl.textContent = nivelPlantacao;
    }
    const btnAjudante = document.getElementById('comprar-ajudante');
    if (btnAjudante) {
        btnAjudante.textContent = `Comprar Ajudante (${custoAutoClicker} moedas) - ${autoClickers}x`;
        btnAjudante.disabled = moedas < custoAutoClicker;
    }
}

function showDiscoveryScreen() {
    document.getElementById('game-layout').style.display = 'none';
    document.getElementById('tela-animais').style.display = 'none';
    document.getElementById('tela-missoes').style.display = 'none';
    document.getElementById('tela-descoberta').style.display = 'block';
}

function showAnimalScreen() {
    document.getElementById('game-layout').style.display = 'none';
    document.getElementById('tela-descoberta').style.display = 'none';
    document.getElementById('tela-missoes').style.display = 'none';
    document.getElementById('tela-animais').style.display = 'block';
    atualizarUI();
}

function showMissionScreen() {
    document.getElementById('game-layout').style.display = 'none';
    document.getElementById('tela-descoberta').style.display = 'none';
    document.getElementById('tela-animais').style.display = 'none';
    document.getElementById('tela-missoes').style.display = 'block';
    atualizarMissoesUI();
}

function showGameLayout() {
    document.getElementById('tela-descoberta').style.display = 'none';
    document.getElementById('tela-animais').style.display = 'none';
    document.getElementById('tela-missoes').style.display = 'none';
    document.getElementById('game-layout').style.display = 'block';
}

function mostraEfeito(quantidade) {
    const tree = document.getElementById('arvore-descoberta');
    const tela = document.getElementById('tela-descoberta');
    if (!tree || !tela) return;
    const treeRect = tree.getBoundingClientRect();
    const telaRect = tela.getBoundingClientRect();
    const plusOne = document.createElement('div');
    plusOne.textContent = `+${quantidade}`;
    plusOne.className = 'plus-one';
    plusOne.style.left = (treeRect.left - telaRect.left + treeRect.width / 2 - 12) + 'px';
    plusOne.style.top = (treeRect.top - telaRect.top - 10) + 'px';
    tela.appendChild(plusOne);
    setTimeout(() => {
        plusOne.remove();
    }, 1000);
}

function mostrarOverlayEasterEgg(mensagem) {
    const overlay = document.getElementById('easter-egg-overlay');
    if (!overlay) return;
    overlay.textContent = mensagem;
    overlay.classList.add('visible');
    setTimeout(() => {
        overlay.classList.remove('visible');
    }, 5000);
}

function processarFazendaInteira() {
    let actions = 0;
    let colheitas = 0;

    grid.forEach(tile => {
        if (tile.state === 'grama') {
            tile.state = 'terra';
            actions++;
        } else if (tile.state === 'terra') {
            if (sementes <= 0) return;
            plantarTile(tile);
            sementes--;
            actions++;
        } else if (tile.state === 'colheita') {
            registrarColheita(tile);
            colheitas++;
            actions++;
        }
    });

    if (colheitas > 0) playSound('colher');
    return actions;
}

function ativarEasterEggFazenda() {
    if (habilidadeFazendaCompletaDesbloqueada) return;
    habilidadeFazendaCompletaDesbloqueada = true;
    document.getElementById('modo-fazenda').style.display = 'block';
    mostrarOverlayEasterEgg('Seu Safadinho(a)');
    alert('Easter egg desbloqueado! Agora você tem a habilidade Fazenda Total para processar toda a plantação com um clique.');
}

function clicarArvore(quantidade = 1) {
    cliquesArvore += quantidade;
    registrarProgressoMissoes('tree', quantidade);
    mostraEfeito(quantidade);

    while (cliquesArvore >= 100) {
        cliquesArvore -= 100;
        pontosEvolucao++;
        if (nivelPlantacao < MAX_NIVEL_PLANTACAO) {
            const pontosNecessarios = getPontosParaProximoNivel(nivelPlantacao + 1);
            if (pontosEvolucao >= pontosNecessarios) {
                pontosEvolucao = 0;
                nivelPlantacao++;
                atualizarMultiplicadorNivel();
                playSound('evoluir');
                mostrarToast(`Plantação evoluiu para o nível ${nivelPlantacao}!`, canvas.width / 2, 24);
            }
        }
    }
    atualizarEvolucaoUI();
    agendarSave();
}

function init() {
    grid = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid.push(criarTile(r, c, 'grama'));
        }
    }
}

function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded !== totalImages || gameStarted) return;
    gameStarted = true;
    gramaPattern = ctx.createPattern(imgGrama, 'repeat');
    startGame();
}

function criarImagemFallback(nome) {
    const fallback = document.createElement('canvas');
    fallback.width = 64;
    fallback.height = 64;
    const fallbackContext = fallback.getContext('2d');
    const cores = nome.toLowerCase().includes('terra')
        ? ['#795548', '#8d6e63']
        : nome.toLowerCase().includes('grama')
            ? ['#4caf50', '#66bb6a']
            : ['#7cb342', '#a5d66f'];

    fallbackContext.fillStyle = cores[0];
    fallbackContext.fillRect(0, 0, fallback.width, fallback.height);
    if (nome.toLowerCase().includes('grama') || nome.toLowerCase().includes('terra')) {
        fallbackContext.fillStyle = cores[1];
        fallbackContext.fillRect(8, 12, 12, 8);
        fallbackContext.fillRect(38, 42, 16, 10);
    } else {
        fallbackContext.fillStyle = cores[1];
        fallbackContext.beginPath();
        fallbackContext.ellipse(32, 38, 12, 22, 0, 0, Math.PI * 2);
        fallbackContext.fill();
    }
    return fallback.toDataURL('image/png');
}

function onImageError(imageName, image) {
    console.error(`Falha ao carregar imagem: ${imageName}. Usando imagem alternativa.`);
    image.onerror = null;
    image.src = criarImagemFallback(imageName);
}

function startGame() {
    const resetPendente = sessionStorage.getItem(RESET_SESSION_KEY) === '1';
    if (resetPendente) {
        sessionStorage.removeItem(RESET_SESSION_KEY);
        localStorage.removeItem(SAVE_KEY);
    }

    const loaded = resetPendente ? false : carregarJogo();
    if (!loaded) {
        init();
    }
    ajustarCanvasResponsivo();
    atualizarUI();
    atualizarEventoUI();
    setModoPlantio('normal');
    setInterval(() => {
        if (autoClickers > 0) {
            clicarArvore(autoClickers);
        }
    }, 1000);
    requestAnimationFrame(draw);
}

function loadImages() {
    imgGrama.onload = onImageLoad;
    imgGrama.onerror = () => onImageError('img/grama.png', imgGrama);
    imgTerra.onload = onImageLoad;
    imgTerra.onerror = () => onImageError('img/Terra.png', imgTerra);
    imgPlantaP.onload = onImageLoad;
    imgPlantaP.onerror = () => onImageError('img/PlantaP.png', imgPlantaP);
    imgPlantaG.onload = onImageLoad;
    imgPlantaG.onerror = () => onImageError('img/PlantaG.png', imgPlantaG);
    imgGrama.src = 'img/grama.png';
    imgTerra.src = 'img/Terra.png';
    imgPlantaP.src = 'img/PlantaP.png';
    imgPlantaG.src = 'img/PlantaG.png';
}

function plantarTile(tile) {
    tile.state = 'semente';
    tile.tempoCrescimento = 0;
    tile.cultivo = cultivoSelecionado;
    registrarProgressoMissoes('plant');
    concluirTutorial('plantar');
}

function processarArea(centerCol, centerRow, radius) {
    const centerTile = grid[centerRow * cols + centerCol];
    if (!centerTile) return 0;

    let actions = 0;
    let colheitas = 0;
    const actionType = centerTile.state;

    for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
            const r = centerRow + dr;
            const c = centerCol + dc;
            if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
            const tile = grid[r * cols + c];
            if (!tile) continue;

            if (actionType === 'grama' && tile.state === 'grama') {
                tile.state = 'terra';
                actions++;
            } else if (actionType === 'terra' && tile.state === 'terra') {
                if (sementes <= 0) return actions;
                plantarTile(tile);
                sementes--;
                actions++;
            } else if (actionType === 'colheita' && tile.state === 'colheita') {
                registrarColheita(tile);
                colheitas++;
                actions++;
            }
        }
    }

    if (colheitas > 0) playSound('colher');
    return actions;
}

function expandirFazenda() {
    if (moedas < custoExpandirFazenda) {
        alert(`Você precisa de ${custoExpandirFazenda} moedas para expandir a fazenda.`);
        return;
    }

    moedas -= custoExpandirFazenda;
    custoExpandirFazenda = Math.ceil(custoExpandirFazenda * 1.5);

    const oldRows = rows;
    const oldCols = cols;
    const newRows = expandirParaColuna ? rows : rows + 1;
    const newCols = expandirParaColuna ? cols + 1 : cols;
    expandirParaColuna = !expandirParaColuna;

    rows = newRows;
    cols = newCols;

    ajustarTamanhoCanvas();

    const newGrid = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r < oldRows && c < oldCols) {
                const oldTile = grid[r * oldCols + c];
                newGrid.push(criarTile(r, c, oldTile.state));
                newGrid[newGrid.length - 1].tempoCrescimento = oldTile.tempoCrescimento || 0;
                newGrid[newGrid.length - 1].cultivo = oldTile.cultivo || 'cenoura';
            } else {
                newGrid.push(criarTile(r, c, 'grama'));
            }
        }
    }
    grid = newGrid;
    atualizarUI();
    playSound('comprar');
    concluirTutorial('expandir');
}

function atualizarCrescimento(timestamp, delta) {
    atualizarEvento(delta);
    produzirItensAnimais(delta);
    const multiplicadorCrescimento = eventoAtivo ? EVENTOS[eventoAtivo].crescimento : 1;
    grid.forEach(tile => {
        if (tile.state === 'semente') {
            tile.tempoCrescimento += delta * multiplicadorCrescimento;
            if (tile.tempoCrescimento >= getTempoCrescimento(tile.cultivo)) {
                tile.state = 'colheita';
                tile.tempoCrescimento = 0;
                mostrarToast(`${CULTURAS[tile.cultivo].emoji} Pronto para colher!`, tile.x + TILE_SIZE / 2, tile.y + 8);
            }
        }
    });
}

function draw(timestamp) {
    const deltaTime = lastFrameTimestamp === null ? 0 : timestamp - lastFrameTimestamp;
    lastFrameTimestamp = timestamp;
    atualizarCrescimento(timestamp, deltaTime);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gramaPattern) {
        ctx.fillStyle = gramaPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    grid.forEach(tile => {
        if (tile.state === 'terra') {
            ctx.drawImage(imgTerra, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
        }

        if (tile.state === 'semente') {
            ctx.drawImage(imgTerra, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
            const progresso = Math.min(1, tile.tempoCrescimento / getTempoCrescimento(tile.cultivo));
            const pulso = 1 + Math.sin(timestamp / 250 + tile.x) * 0.035;
            if (progresso < 0.2) {
                const tamanho = TILE_SIZE * 0.16;
                ctx.fillStyle = '#d7bd77';
                ctx.beginPath();
                ctx.ellipse(tile.x + TILE_SIZE / 2, tile.y + TILE_SIZE * 0.72, tamanho, tamanho * 0.55, -0.3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const usaPlantaGrande = progresso >= 0.68;
                const imagem = usaPlantaGrande ? imgPlantaG : imgPlantaP;
                const tamanho = TILE_SIZE * (0.4 + progresso * 0.48) * pulso;
                const margem = (TILE_SIZE - tamanho) / 2;
                ctx.drawImage(imagem, tile.x + margem, tile.y + margem, tamanho, tamanho);
            }
            if (progresso >= 0.4) {
                ctx.font = `${Math.max(14, TILE_SIZE * 0.34)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(CULTURAS[tile.cultivo].emoji, tile.x + TILE_SIZE * 0.5, tile.y + TILE_SIZE * 0.72);
            }
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(tile.x + 5, tile.y + TILE_SIZE - 7, TILE_SIZE - 10, 3);
            ctx.fillStyle = '#a5d66f';
            ctx.fillRect(tile.x + 5, tile.y + TILE_SIZE - 7, (TILE_SIZE - 10) * progresso, 3);
        }

        if (tile.state === 'colheita') {
            ctx.drawImage(imgTerra, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(imgPlantaG, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
            ctx.font = `${Math.max(16, TILE_SIZE * 0.42)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(CULTURAS[tile.cultivo].emoji, tile.x + TILE_SIZE * 0.5, tile.y + TILE_SIZE * 0.72);
        }

        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
    });

    desenharEventoClima(timestamp);
    desenharPreviaArea();
    requestAnimationFrame(draw);
}

function desenharEventoClima(timestamp) {
    if (eventoAtivo === 'chuva') {
        ctx.save();
        ctx.strokeStyle = 'rgba(190, 225, 255, 0.48)';
        ctx.lineWidth = Math.max(1, TILE_SIZE * 0.025);
        for (let indice = 0; indice < 100; indice++) {
            const x = (indice * 97 + timestamp * 0.28) % canvas.width;
            const y = (indice * 53 + timestamp * 0.62) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - TILE_SIZE * 0.11, y + TILE_SIZE * 0.24);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eventoAtivo === 'sol') {
        ctx.save();
        const x = canvas.width - TILE_SIZE * 0.8;
        const y = TILE_SIZE * 0.75;
        const brilho = ctx.createRadialGradient(x, y, TILE_SIZE * 0.1, x, y, TILE_SIZE * 2.2);
        brilho.addColorStop(0, 'rgba(255, 231, 130, 0.3)');
        brilho.addColorStop(1, 'rgba(255, 231, 130, 0)');
        ctx.fillStyle = brilho;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 239, 157, 0.85)';
        ctx.beginPath();
        ctx.arc(x, y, TILE_SIZE * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else if (eventoAtivo === 'praga') {
        ctx.save();
        ctx.font = `${Math.max(12, TILE_SIZE * 0.25)}px sans-serif`;
        ctx.textAlign = 'center';
        grid.forEach((tile, indice) => {
            if ((tile.state === 'semente' || tile.state === 'colheita') && indice % 4 === 0) {
                const deslocamento = Math.sin(timestamp / 180 + indice) * TILE_SIZE * 0.07;
                ctx.fillText('🐛', tile.x + TILE_SIZE * 0.82, tile.y + TILE_SIZE * 0.3 + deslocamento);
            }
        });
        ctx.restore();
    }
}

function atualizarCelulaPrevia(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) * canvas.width / rect.width) / TILE_SIZE);
    const row = Math.floor(((clientY - rect.top) * canvas.height / rect.height) / TILE_SIZE);
    celulaPrevia = col >= 0 && row >= 0 && col < cols && row < rows ? { col, row } : null;
}

function desenharPreviaArea() {
    const radius = modoPlantio === '3x3' ? 1 : modoPlantio === '5x5' ? 2 : 0;
    const habilidadeDisponivel = modoPlantio === '3x3'
        ? habilidade3x3Comprada
        : modoPlantio === '5x5' && habilidade5x5Comprada;
    if (!radius || !habilidadeDisponivel || !celulaPrevia) return;

    const tileCentral = grid[celulaPrevia.row * cols + celulaPrevia.col];
    if (!tileCentral) return;

    const inicioColuna = Math.max(0, celulaPrevia.col - radius);
    const fimColuna = Math.min(cols - 1, celulaPrevia.col + radius);
    const inicioLinha = Math.max(0, celulaPrevia.row - radius);
    const fimLinha = Math.min(rows - 1, celulaPrevia.row + radius);
    const tilesProcessaveis = new Set();
    let sementesDisponiveis = sementes;

    area:
    for (let linha = inicioLinha; linha <= fimLinha; linha++) {
        for (let coluna = inicioColuna; coluna <= fimColuna; coluna++) {
            const indice = linha * cols + coluna;
            const tile = grid[indice];
            if (tile.state !== tileCentral.state) continue;
            if (tile.state === 'terra') {
                if (sementesDisponiveis <= 0) break area;
                sementesDisponiveis--;
            }
            tilesProcessaveis.add(indice);
        }
    }

    ctx.save();
    for (let linha = inicioLinha; linha <= fimLinha; linha++) {
        for (let coluna = inicioColuna; coluna <= fimColuna; coluna++) {
            const indice = linha * cols + coluna;
            const tile = grid[indice];
            const vaiProcessar = tilesProcessaveis.has(indice);
            ctx.fillStyle = vaiProcessar ? 'rgba(166, 230, 92, 0.38)' : 'rgba(30, 30, 30, 0.24)';
            ctx.fillRect(tile.x + 1, tile.y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            ctx.strokeStyle = vaiProcessar ? 'rgba(222, 255, 166, 0.85)' : 'rgba(255, 255, 255, 0.22)';
            ctx.lineWidth = 2;
            ctx.strokeRect(tile.x + 2, tile.y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }
    }

    ctx.strokeStyle = '#fff4a8';
    ctx.lineWidth = 3;
    ctx.strokeRect(
        celulaPrevia.col * TILE_SIZE + 2,
        celulaPrevia.row * TILE_SIZE + 2,
        TILE_SIZE - 4,
        TILE_SIZE - 4
    );
    ctx.restore();
}

function setModoPlantio(modo) {
    modoPlantio = modo;
    const habilidadeAtiva = (modo === '3x3' && habilidade3x3Comprada) ||
        (modo === '5x5' && habilidade5x5Comprada);
    if (!habilidadeAtiva && modo !== '3x3' && modo !== '5x5') {
        celulaPrevia = null;
    }
    const dicaPrevia = document.getElementById('area-preview-hint');
    const mostrarDica = habilidadeAtiva;
    dicaPrevia.hidden = !mostrarDica;
    const controlesToque = document.getElementById('area-touch-controls');
    const mostrarControlesToque = mostrarDica &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
        !document.getElementById('shop-panel').classList.contains('open');
    if (mostrarDica) {
        celulaPrevia = mostrarControlesToque ? null : celulaPrevia || {
            col: Math.floor(cols / 2),
            row: Math.floor(rows / 2)
        };
    } else {
        celulaPrevia = null;
    }
    controlesToque.hidden = !mostrarControlesToque;
    celulaToquePendente = null;
    document.getElementById('confirmar-area').disabled = true;
    if (mostrarDica) {
        const tamanho = modo === '3x3' ? '3×3' : '5×5';
        dicaPrevia.textContent = mostrarControlesToque
            ? `Prévia ${tamanho}: toque no terreno para posicionar e confirme antes de aplicar.`
            : `Prévia ${tamanho}: mova o cursor para posicionar. As casas verdes serão processadas; clique para aplicar.`;
    }
    document.getElementById('modo-normal').classList.remove('selected-mode');
    document.getElementById('modo-3x3').classList.remove('selected-mode');
    document.getElementById('modo-5x5').classList.remove('selected-mode');
    document.getElementById('modo-fazenda').classList.remove('selected-mode');
    document.getElementById('modo-' + modo).classList.add('selected-mode');
    atualizarUI();
}

canvas.addEventListener('pointermove', (event) => {
    if (modoPlantio === '3x3' || modoPlantio === '5x5') {
        atualizarCelulaPrevia(event.clientX, event.clientY);
    }
});

canvas.addEventListener('pointerleave', () => {
    if ((modoPlantio === '3x3' || modoPlantio === '5x5') &&
        !('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        celulaPrevia = null;
    }
});

function executarHabilidadeArea(col, row) {
    const raio = modoPlantio === '3x3' ? 1 : 2;
    const habilidadeComprada = modoPlantio === '3x3' ? habilidade3x3Comprada : habilidade5x5Comprada;
    if (!habilidadeComprada) {
        alert(`Você precisa comprar a habilidade ${modoPlantio} primeiro.`);
        return;
    }

    const actions = processarArea(col, row, raio);
    if (actions === 0) alert(`Não há ações disponíveis na área ${modoPlantio}.`);
    atualizarUI();
}

document.getElementById('confirmar-area').addEventListener('click', () => {
    if (!celulaToquePendente) return;
    const { col, row } = celulaToquePendente;
    executarHabilidadeArea(col, row);
    celulaToquePendente = null;
    celulaPrevia = null;
    document.getElementById('confirmar-area').disabled = true;
    document.getElementById('area-touch-message').textContent = 'Toque no terreno para escolher outra área.';
});

document.getElementById('cancelar-area').addEventListener('click', () => {
    celulaPrevia = null;
    celulaToquePendente = null;
    document.getElementById('confirmar-area').disabled = true;
    document.getElementById('area-touch-message').textContent = 'Área cancelada. Toque no terreno para escolher outra.';
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(mouseX / TILE_SIZE);
    const row = Math.floor(mouseY / TILE_SIZE);
    const index = row * cols + col;
    const tile = grid[index];
    if (!tile) return;
    celulaPrevia = { col, row };

    if (modoPlantio === '3x3' || modoPlantio === '5x5') {
        if (e.pointerType === 'touch') {
            celulaToquePendente = { col, row };
            const tamanho = modoPlantio === '3x3' ? '3×3' : '5×5';
            document.getElementById('confirmar-area').disabled = false;
            document.getElementById('area-touch-message').textContent = `Área ${tamanho} selecionada. Confira o destaque e confirme.`;
            return;
        }
        executarHabilidadeArea(col, row);
        return;
    }

    if (modoPlantio === 'fazenda') {
        if (!habilidadeFazendaCompletaDesbloqueada) {
            alert('Modo Fazenda não está disponível ainda.');
            return;
        }
        const actions = processarFazendaInteira();
        if (actions === 0) {
            alert('Não há ações disponíveis em toda a fazenda.');
        }
        atualizarUI();
        return;
    }

    if (tile.state === 'grama') {
        tile.state = 'terra';
        atualizarUI();
        return;
    }

    if (tile.state === 'terra') {
        if (sementes <= 0) {
            alert('Você não tem sementes!');
            return;
        }

        plantarTile(tile);
        sementes--;
        atualizarUI();
        return;
    }

    if (tile.state === 'colheita') {
        registrarColheita(tile);
        playSound('colher');
        atualizarUI();
    }
});

document.getElementById('comprar-semente').addEventListener('click', () => {
    if (moedas >= custoSemente) {
        moedas -= custoSemente;
        sementes += 1;
        custoSemente = Math.max(custoSemente + 1, Math.ceil(custoSemente * 1.15));
        playSound('comprar');
        atualizarUI();
    } else {
        alert('Você não tem moedas suficientes para comprar uma semente.');
    }
});

document.getElementById('comprar-3x3').addEventListener('click', () => {
    if (habilidade3x3Comprada) return;
    if (moedas >= CUSTO_HABILIDADE_3X3) {
        moedas -= CUSTO_HABILIDADE_3X3;
        habilidade3x3Comprada = true;
        playSound('comprar');
        concluirTutorial('upgrade');
        setModoPlantio('3x3');
    } else {
        alert('Moedas insuficientes para comprar a habilidade 3x3.');
    }
});

document.getElementById('comprar-5x5').addEventListener('click', () => {
    if (habilidade5x5Comprada) return;
    if (moedas >= CUSTO_HABILIDADE_5X5) {
        moedas -= CUSTO_HABILIDADE_5X5;
        habilidade5x5Comprada = true;
        playSound('comprar');
        concluirTutorial('upgrade');
        setModoPlantio('5x5');
    } else {
        alert('Moedas insuficientes para comprar a habilidade 5x5.');
    }
});

document.getElementById('modo-normal').addEventListener('click', () => setModoPlantio('normal'));
document.getElementById('modo-3x3').addEventListener('click', () => setModoPlantio('3x3'));
document.getElementById('modo-5x5').addEventListener('click', () => setModoPlantio('5x5'));
document.getElementById('modo-fazenda').addEventListener('click', () => setModoPlantio('fazenda'));
document.getElementById('easter-egg-trigger').addEventListener('click', () => {
    if (habilidadeFazendaCompletaDesbloqueada) return;
    cliquesUltimoEmBreve++;
    if (cliquesUltimoEmBreve >= CLIQUES_PARA_EASTER_EGG) {
        ativarEasterEggFazenda();
    }
});
document.getElementById('modo-descoberta').addEventListener('click', () => {
    document.getElementById('shop-panel').classList.remove('open');
    document.getElementById('shop-toggle').setAttribute('aria-expanded', 'false');
    showDiscoveryScreen();
});
document.getElementById('modo-animais').addEventListener('click', () => {
    document.getElementById('shop-panel').classList.remove('open');
    document.getElementById('shop-toggle').setAttribute('aria-expanded', 'false');
    showAnimalScreen();
});
document.getElementById('modo-missoes').addEventListener('click', () => {
    document.getElementById('shop-panel').classList.remove('open');
    document.getElementById('shop-toggle').setAttribute('aria-expanded', 'false');
    showMissionScreen();
});
document.getElementById('shop-toggle').addEventListener('click', () => {
    const shopPanel = document.getElementById('shop-panel');
    const aberto = shopPanel.classList.toggle('open');
    document.getElementById('shop-toggle').setAttribute('aria-expanded', String(aberto));
    const controlesToque = document.getElementById('area-touch-controls');
    const habilidadeAtiva = (modoPlantio === '3x3' && habilidade3x3Comprada) ||
        (modoPlantio === '5x5' && habilidade5x5Comprada);
    controlesToque.hidden = aberto || !habilidadeAtiva ||
        !('ontouchstart' in window || navigator.maxTouchPoints > 0);
});
document.getElementById('som-toggle').addEventListener('click', () => {
    somAtivo = !somAtivo;
    atualizarUI();
    if (somAtivo) playSound('comprar');
});
document.getElementById('voltar-descoberta').addEventListener('click', showGameLayout);
document.getElementById('voltar-animais').addEventListener('click', showGameLayout);
document.getElementById('voltar-missoes').addEventListener('click', showGameLayout);
document.querySelectorAll('.mission-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.mission-tab').forEach(item => {
            const selecionada = item === tab;
            item.classList.toggle('selected-mode', selecionada);
            item.setAttribute('aria-selected', String(selecionada));
        });
        atualizarMissoesUI();
    });
});
const arvoreDescoberta = document.getElementById('arvore-descoberta');
arvoreDescoberta.addEventListener('click', () => {
    clicarArvore();
    arvoreDescoberta.classList.add('pulse');
});
arvoreDescoberta.addEventListener('animationend', () => {
    arvoreDescoberta.classList.remove('pulse');
});
document.getElementById('comprar-ajudante').addEventListener('click', () => {
    if (moedas < custoAutoClicker) return;

    moedas -= custoAutoClicker;
    autoClickers++;
    custoAutoClicker = Math.round(custoAutoClicker * 1.5);
    playSound('comprar');
    concluirTutorial('upgrade');
    atualizarUI();
});

document.getElementById('upgrade-velocidade-5s').addEventListener('click', () => {
    const custoDinamico = calcularCustoUpgrade5s();
    if (moedas >= custoDinamico) {
        moedas -= custoDinamico;
        comprasUpgrade5s++;
        tempoCrescimento = Math.max(2, tempoCrescimento - 3);
        playSound('comprar');
        concluirTutorial('upgrade');
        atualizarUI();
    } else {
        alert('Moedas insuficientes para comprar o upgrade de velocidade.');
    }
});

document.getElementById('upgrade-velocidade-10s').addEventListener('click', () => {
    const custoDinamico = calcularCustoUpgrade10s();
    if (moedas >= custoDinamico) {
        moedas -= custoDinamico;
        comprasUpgrade10s++;
        tempoCrescimento = Math.max(2, tempoCrescimento - 5);
        playSound('comprar');
        concluirTutorial('upgrade');
        atualizarUI();
    } else {
        alert('Moedas insuficientes para comprar o upgrade de velocidade.');
    }
});

const btnFertilizante = document.getElementById('melhorar-fertilizante');
if (btnFertilizante) {
    btnFertilizante.addEventListener('click', () => {
        if (moedas >= custoFertilizante) {
            moedas -= custoFertilizante;
            multiplicadorDeLucro += INCREMENTO_FERTILIZANTE;
            custoFertilizante = Math.ceil(custoFertilizante * 1.5);
            playSound('comprar');
            concluirTutorial('upgrade');
            atualizarUI();
        } else {
            alert('Moedas insuficientes para comprar a melhoria de fertilizante.');
        }
    });
}

document.getElementById('expandir-fazenda').addEventListener('click', expandirFazenda);

document.getElementById('cultivo-cenoura').addEventListener('click', () => {
    cultivoSelecionado = 'cenoura';
    atualizarUI();
});
document.getElementById('cultivo-abobora').addEventListener('click', () => {
    if (!aboboraDesbloqueada) {
        const custo = 150;
        if (moedas < custo) return;
        moedas -= custo;
        aboboraDesbloqueada = true;
        cultivoSelecionado = 'abobora';
        playSound('comprar');
        mostrarToast('🎃 Abóbora desbloqueada!', canvas.width / 2, 24);
    } else {
        cultivoSelecionado = 'abobora';
    }
    atualizarUI();
});

function comprarGalinha() {
    const custo = 100 + galinhas * 75;
    if (moedas < custo) return;
    moedas -= custo;
    galinhas++;
    playSound('comprar');
    atualizarUI();
}

function comprarVaca() {
    const custo = 250 + vacas * 150;
    if (moedas < custo) return;
    moedas -= custo;
    vacas++;
    playSound('comprar');
    atualizarUI();
}

function venderOvos() {
    if (ovos <= 0) return;
    const valor = ovos * 12;
    moedas += valor;
    registrarProgressoMissoes('coins', valor);
    ovos = 0;
    playSound('comprar');
    atualizarUI();
}

function venderLeite() {
    if (leites <= 0) return;
    const valor = leites * 30;
    moedas += valor;
    registrarProgressoMissoes('coins', valor);
    leites = 0;
    playSound('comprar');
    atualizarUI();
}

document.getElementById('comprar-galinha').addEventListener('click', comprarGalinha);
document.getElementById('comprar-vaca').addEventListener('click', comprarVaca);
document.getElementById('vender-ovos').addEventListener('click', venderOvos);
document.getElementById('vender-leite').addEventListener('click', venderLeite);
document.getElementById('tela-comprar-galinha').addEventListener('click', comprarGalinha);
document.getElementById('tela-comprar-vaca').addEventListener('click', comprarVaca);
document.getElementById('tela-vender-ovos').addEventListener('click', venderOvos);
document.getElementById('tela-vender-leite').addEventListener('click', venderLeite);

document.getElementById('exportar-save').addEventListener('click', () => {
    let save;
    try {
        save = JSON.stringify(criarDadosSave());
    } catch (error) {
        console.error('Não foi possível preparar o arquivo de progresso:', error);
        mostrarMensagemSave('Não foi possível exportar o progresso.');
        return;
    }

    const arquivo = new Blob([save], { type: 'application/json' });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fazendinha-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    mostrarMensagemSave('Progresso exportado!');
});

document.getElementById('reiniciar-jogo').addEventListener('click', () => {
    if (!window.confirm('Tem certeza que deseja reiniciar? Todo o progresso salvo será apagado.')) return;
    reiniciandoJogo = true;
    clearTimeout(saveTimeout);
    window.removeEventListener('beforeunload', salvarJogo);

    try {
        sessionStorage.setItem(RESET_SESSION_KEY, '1');
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
    } catch (error) {
        try {
            sessionStorage.removeItem(RESET_SESSION_KEY);
        } catch (cleanupError) {
            console.error('Não foi possível limpar o marcador de reinício:', cleanupError);
        }
        reiniciandoJogo = false;
        window.addEventListener('beforeunload', salvarJogo);
        console.error('Não foi possível reiniciar o progresso salvo:', error);
        mostrarMensagemSave('Não foi possível reiniciar. Verifique o armazenamento do navegador.');
    }
});

window.addEventListener('resize', ajustarCanvasResponsivo);
window.addEventListener('beforeunload', salvarJogo);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') salvarJogo();
});

loadImages();