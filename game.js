const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 50; // Cada quadrado terá 50x50
let rows = 8;
let cols = 12;

let grid = [];
let modoPlantio = 'normal';
let moedas = 5; // valor inicial para testes
let sementes = 5;
const TEMPO_CRESCIMENTO_BASE = 30000;
let modificadorVelocidade = 1;
let custoSemente = 5;
let custoExpandirFazenda = 250;
let expandirParaColuna = true;
let habilidade3x3Comprada = false;
let habilidade5x5Comprada = false;

const COSTO_HABILIDADE_3X3 = 50;
const COSTO_HABILIDADE_5X5 = 100;
const COSTO_UPGRADE_5S = 100;
const COSTO_UPGRADE_10S = 200;

const imgGrama = new Image();
const imgTerra = new Image();
const imgPlantaP = new Image();
const imgPlantaG = new Image();
let gramaPattern = null;
let imagesLoaded = 0;
const totalImages = 4;

function atualizarUI() {
    document.getElementById('moedas').textContent = moedas;
    document.getElementById('sementes').textContent = sementes;
    document.getElementById('fazenda-tamanho').textContent = `${rows}x${cols}`;
    document.getElementById('tempo-cultivo').textContent = `${getTempoCrescimento() / 1000}s`;
    document.getElementById('modo-plantio').textContent = modoPlantio === 'normal' ? 'Normal' : modoPlantio === '3x3' ? '3x3' : '5x5';
    document.getElementById('comprar-semente').textContent = `Comprar Semente (${custoSemente} moedas)`;
    document.getElementById('comprar-3x3').textContent = habilidade3x3Comprada ? 'Habilidade 3x3 Comprada' : `Comprar Habilidade 3x3 (${COSTO_HABILIDADE_3X3} moedas)`;
    document.getElementById('comprar-5x5').textContent = habilidade5x5Comprada ? 'Habilidade 5x5 Comprada' : `Comprar Habilidade 5x5 (${COSTO_HABILIDADE_5X5} moedas)`;
    document.getElementById('upgrade-velocidade-5s').textContent = `Comprar -5s (${COSTO_UPGRADE_5S} moedas)`;
    document.getElementById('upgrade-velocidade-10s').textContent = `Comprar -10s (${COSTO_UPGRADE_10S} moedas)`;
    document.getElementById('expandir-fazenda').textContent = `Expandir Fazenda (${custoExpandirFazenda} moedas)`;
}

function getTempoCrescimento() {
    return Math.max(5000, Math.round(TEMPO_CRESCIMENTO_BASE / modificadorVelocidade));
}

function init() {
    grid = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid.push({
                x: c * TILE_SIZE,
                y: r * TILE_SIZE,
                state: 'grama' // grama, terra, semente, colheita
            });
        }
    }
}

function onImageLoad(imageName) {
    imagesLoaded++;
    console.log(`Imagem carregada com sucesso: ${imageName}`);
    if (imagesLoaded === totalImages) {
        gramaPattern = ctx.createPattern(imgGrama, 'repeat');
        startGame();
    }
}

function onImageError(imageName, event) {
    console.error(`Falha ao carregar imagem: ${imageName}`, event);
}

function startGame() {
    init();
    atualizarUI();
    draw();
}

function loadImages() {
    imgGrama.onload = () => onImageLoad('img/grama.png');
    imgGrama.onerror = (event) => onImageError('img/grama.png', event);
    imgTerra.onload = () => onImageLoad('img/Terra.png');
    imgTerra.onerror = (event) => onImageError('img/Terra.png', event);
    imgPlantaP.onload = () => onImageLoad('img/PlantaP.png');
    imgPlantaP.onerror = (event) => onImageError('img/PlantaP.png', event);
    imgPlantaG.onload = () => onImageLoad('img/PlantaG.png');
    imgPlantaG.onerror = (event) => onImageError('img/PlantaG.png', event);
    imgGrama.src = 'img/grama.png';
    imgTerra.src = 'img/Terra.png';
    imgPlantaP.src = 'img/PlantaP.png';
    imgPlantaG.src = 'img/PlantaG.png';
}

function plantarTile(tile) {
    tile.state = 'semente';
    setTimeout(() => {
        if (tile.state === 'semente') {
            tile.state = 'colheita';
        }
    }, getTempoCrescimento());
}

function processarArea(centerCol, centerRow, radius) {
    const centerTile = grid[centerRow * cols + centerCol];
    if (!centerTile) return 0;

    let actions = 0;
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
                tile.state = 'semente';
                sementes--;
                actions++;
                setTimeout(() => {
                    if (tile.state === 'semente') {
                        tile.state = 'colheita';
                    }
                }, getTempoCrescimento());
            } else if (actionType === 'colheita' && tile.state === 'colheita') {
                tile.state = 'terra';
                moedas += 10;
                sementes += 1;
                actions++;
            }
        }
    }

    return actions;
}

function plantar3x3(centerCol, centerRow) {
    return processarArea(centerCol, centerRow, 1);
}

function plantar5x5(centerCol, centerRow) {
    return processarArea(centerCol, centerRow, 2);
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

    if (newCols !== cols) {
        canvas.width = newCols * TILE_SIZE;
    }
    if (newRows !== rows) {
        canvas.height = newRows * TILE_SIZE;
    }

    rows = newRows;
    cols = newCols;

    const newGrid = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r < oldRows && c < oldCols) {
                const oldTile = grid[r * oldCols + c];
                newGrid.push({
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    state: oldTile.state
                });
            } else {
                newGrid.push({
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    state: 'grama'
                });
            }
        }
    }
    grid = newGrid;
    atualizarUI();
}

function draw() {
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
            ctx.drawImage(imgPlantaP, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
        }

        if (tile.state === 'colheita') {
            ctx.drawImage(imgTerra, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
            ctx.drawImage(imgPlantaG, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
        }

        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
    });

    requestAnimationFrame(draw);
}

function setModoPlantio(modo) {
    modoPlantio = modo;
    atualizarUI();
}

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

    if (modoPlantio === '3x3') {
        if (!habilidade3x3Comprada) {
            alert('Você precisa comprar a habilidade 3x3 primeiro.');
            return;
        }
        const actions = processarArea(col, row, 1);
        if (actions === 0) {
            alert('Não há ações disponíveis na área 3x3.');
        }
        atualizarUI();
        return;
    }

    if (modoPlantio === '5x5') {
        if (!habilidade5x5Comprada) {
            alert('Você precisa comprar a habilidade 5x5 primeiro.');
            return;
        }
        const actions = processarArea(col, row, 2);
        if (actions === 0) {
            alert('Não há ações disponíveis na área 5x5.');
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
        tile.state = 'terra';
        moedas += 10;
        sementes += 1;
        atualizarUI();
    }
});

document.getElementById('comprar-semente').addEventListener('click', () => {
    if (moedas >= custoSemente) {
        moedas -= custoSemente;
        sementes += 1;
        custoSemente = Math.ceil(custoSemente * 1.05);
        atualizarUI();
    } else {
        alert('Você não tem moedas suficientes para comprar uma semente.');
    }
});

document.getElementById('comprar-3x3').addEventListener('click', () => {
    if (habilidade3x3Comprada) return;
    if (moedas >= COSTO_HABILIDADE_3X3) {
        moedas -= COSTO_HABILIDADE_3X3;
        habilidade3x3Comprada = true;
        setModoPlantio('3x3');
    } else {
        alert('Moedas insuficientes para comprar a habilidade 3x3.');
    }
});

document.getElementById('comprar-5x5').addEventListener('click', () => {
    if (habilidade5x5Comprada) return;
    if (moedas >= COSTO_HABILIDADE_5X5) {
        moedas -= COSTO_HABILIDADE_5X5;
        habilidade5x5Comprada = true;
        setModoPlantio('5x5');
    } else {
        alert('Moedas insuficientes para comprar a habilidade 5x5.');
    }
});

document.getElementById('modo-normal').addEventListener('click', () => setModoPlantio('normal'));
document.getElementById('modo-3x3').addEventListener('click', () => setModoPlantio('3x3'));
document.getElementById('modo-5x5').addEventListener('click', () => setModoPlantio('5x5'));

document.getElementById('upgrade-velocidade-5s').addEventListener('click', () => {
    if (moedas >= COSTO_UPGRADE_5S) {
        moedas -= COSTO_UPGRADE_5S;
        modificadorVelocidade *= 1.2;
        atualizarUI();
    } else {
        alert('Moedas insuficientes para comprar o upgrade de velocidade.');
    }
});

document.getElementById('upgrade-velocidade-10s').addEventListener('click', () => {
    if (moedas >= COSTO_UPGRADE_10S) {
        moedas -= COSTO_UPGRADE_10S;
        modificadorVelocidade *= 1.5;
        atualizarUI();
    } else {
        alert('Moedas insuficientes para comprar o upgrade de velocidade.');
    }
});

document.getElementById('expandir-fazenda').addEventListener('click', expandirFazenda);

loadImages();