/**
 * CONFIGURAÇÕES E ELEMENTOS DO DOM
 */
const QTD_LINHA = 6;
const QTD_COLUNA = 5;

const DOM = {
    container: document.querySelector('.container'),
    notificacoes: document.querySelector('#container-notificacoes'),
    barraTimer: document.getElementById('barra-timer'),
    modalAjuda: document.getElementById('modal-ajuda'),
    overlayInicio: document.getElementById('overlay-inicio'),
    btnAbrirAjuda: document.getElementById('btn-ajuda'),
    btnFecharAjuda: document.getElementById('fechar-modal'),
    btnComecar: document.getElementById('btn-comecar')
};

/**
 * ESTADO DO JOGO
 */
let linhaAtual = 0;
let colunaAtual = 0;
let endGame = false;
let word = "";
let tempoRestante = 100;
let timerIntervalo = null;
let gameStarted = false;
let tempoEscolhido = 15;
/**
 * MÓDULO DE INTERFACE E COMPONENTES (UI)
 */

function exibirNotificacao(mensagem, tipo = '') {
    const elemento = document.createElement('div');
    elemento.classList.add('notificacao');
    if (tipo) elemento.classList.add(tipo);
    elemento.textContent = mensagem;
    
    DOM.notificacoes.appendChild(elemento);

    setTimeout(() => {
        elemento.classList.add('fade-out');
        setTimeout(() => elemento.remove(), 1000);
    }, 2000);
}

function criarTabuleiro() {
    const tabuleiro = document.createElement('section');
    tabuleiro.classList.add('tabuleiro');

    for (let l = 0; l < QTD_LINHA; l++) {
        const linha = document.createElement('ul');
        linha.classList.add('linha');

        for (let c = 0; c < QTD_COLUNA; c++) {
            const item = document.createElement('li');
            item.classList.add('unidade');
            item.id = `${l}-${c}`;
            item.addEventListener('click', () => selecionarUnidadeComMouse(l, c));
            linha.appendChild(item);
        }
        tabuleiro.appendChild(linha);
    }
    DOM.container.appendChild(tabuleiro);
}

function criarTeclado() {
    const layout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Backspace'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Enter']
    ];

    const teclado = document.createElement('section');
    teclado.classList.add('teclado');

    layout.forEach((linhaTeclas) => {
        const linha = document.createElement('div');
        linha.classList.add('teclado-linha');

        linhaTeclas.forEach((letra) => {
            const tecla = document.createElement('button');
            tecla.textContent = letra;
            tecla.classList.add('tecla');
            tecla.id = `tecla-${letra.toUpperCase()}`;

            tecla.addEventListener('click', () => {
                if (!endGame) {
                    const atributosLetra = {
                        key: letra,
                        code: letra.length > 1 ? letra : `Key${letra.toUpperCase()}`
                    };
                    processInput(atributosLetra);
                }
            });
            linha.appendChild(tecla);
        });
        teclado.appendChild(linha);
    });
    DOM.container.appendChild(teclado);
}

function destacarLinhaUnidade() {
    document.querySelectorAll('.unidade').forEach(u => {
        u.classList.remove('linha-active', 'linha-ativa', 'unidade-foco'); // Suportando ambas classes se houver variação
    });

    const linhas = document.querySelectorAll('.linha');
    const linhaFoco = linhas[linhaAtual];

    if (linhaFoco && !endGame) {
        linhaFoco.querySelectorAll('.unidade').forEach(u => u.classList.add('linha-ativa'));
        const itemAtivo = document.getElementById(`${linhaAtual}-${colunaAtual}`);
        if (itemAtivo) itemAtivo.classList.add('unidade-foco');
    }
}

function atualizarClasseTeclado(letra, classe) {
    const tecla = document.getElementById(`tecla-${letra.toUpperCase()}`);
    if (!tecla) return;
    if (tecla.classList.contains('correct')) return;
    if (tecla.classList.contains('present') && classe === 'absent') return;

    tecla.classList.remove('present', 'absent');
    tecla.classList.add(classe);
}

/**
 * LÓGICA DO TEMPO (TIMER)
 */

function iniciarAmpulheta(tempoEscolhido = 15) {
    clearInterval(timerIntervalo);
    tempoRestante = 100;
    DOM.barraTimer.style.width = '100%';
    DOM.barraTimer.classList.remove('timer-critico');

    timerIntervalo = setInterval(() => {
        tempoRestante -= (10 / tempoEscolhido); 

        if (tempoRestante <= 0) {
            clearInterval(timerIntervalo);
            DOM.barraTimer.style.width = '0%';
            tempoEsgotado();
        } else {
            DOM.barraTimer.style.width = `${tempoRestante}%`;
            if (tempoRestante < 25) DOM.barraTimer.classList.add('timer-critico');
        }
    }, 100);
}

function tempoEsgotado() {
    exibirNotificacao("Tempo esgotado!", "erro");

    for (let c = 0; c < QTD_COLUNA; c++) {
        let unidade = document.getElementById(`${linhaAtual}-${c}`);
        unidade.innerText = "X";
        unidade.classList.add("absent");
    }

    avancarLinha();
}

function configurarTempo(segundos) {
    if (!jogo.gameStarted) {
        jogo.tempoEscolhido = segundos;
        
        exibirNotificacao(`Tempo definido para ${segundos}s`);
    }
}

/**
 * LÓGICA DE FLUXO (START/RESET)
 */

async function iniciarJogo() {
    gameStarted = true;
    endGame = false;
    linhaAtual = 0;
    colunaAtual = 0;
    
    //Sorteia palavra
    word = await obterPalavraSecreta();
    
    //Some com o overlay inicial
    DOM.overlayInicio.style.display = 'none';

    //Determina o tempo do jogo
    let tempoJogo = document.querySelector('input[name="tempo"]:checked');
    tempoEscolhido = parseInt(tempoJogo.value);

    //UI
    destacarLinhaUnidade();
    iniciarAmpulheta(tempoEscolhido);
}

function reiniciarJogo() {
    // Para tudo
    clearInterval(timerIntervalo);
    
    // Reseta variáveis
    linhaAtual = 0;
    colunaAtual = 0;
    endGame = false;
    
    // Limpa Visual
    document.querySelectorAll('.unidade').forEach(u => {
        u.innerText = "";
        u.className = "unidade";
    });
    document.querySelectorAll('.tecla').forEach(t => {
        t.classList.remove('correct', 'present', 'absent');
    });

    iniciarJogo();
}

/**
 * LÓGICA DO JOGO (CORE)
 */

async function obterPalavraSecreta() {
    try {
        const response = await fetch('./db/db.json');
        const data = await response.json();
        const listaPalavras = data.palavras;
        const indiceAleatorio = Math.floor(Math.random() * listaPalavras.length);
        const palavraSorteada = listaPalavras[indiceAleatorio];

        return palavraSorteada.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    } catch (error) {
        console.error("Erro ao buscar banco de dados:", error);
        return "PORTA";
    }
}

function obterPalavraDigitada() {
    let palavra = "";
    // Percorre de 0 a 4 (colunas) para a linha atual
    for (let c = 0; c < QTD_COLUNA; c++) {
        const unidade = document.getElementById(`${linhaAtual}-${c}`);
        if (unidade) {
            palavra += unidade.innerText.trim();
        }
    }
    return palavra;
}

function validarTentativa() {
    const linhas = document.querySelectorAll('.linha');
    const linhaFoco = linhas[linhaAtual];
    const unidades = Array.from(linhaFoco.querySelectorAll('.unidade'));
    const letrasPreenchidas = unidades.filter(letra => letra.textContent.trim() !== '').length;

    if (letrasPreenchidas < QTD_COLUNA) {
        return exibirNotificacao('Complete a palavra');
    }

    let correct = 0;
    let letterCount = {};

    // Mapeia estoque de letras
    for (let i = 0; i < word.length; i++) {
        let letter = word[i];
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    // Primeira passada: Verdes (Corretas)
    for (let c = 0; c < QTD_COLUNA; c++) {
        let itemAtual = document.getElementById(`${linhaAtual}-${c}`);
        let letter = itemAtual.innerText;

        if (word[c] === letter) {
            itemAtual.classList.add('correct');
            correct += 1;
            letterCount[letter] -= 1;
            atualizarClasseTeclado(letter, 'correct');
        }
    }

    // Segunda passada: Amarelas e Cinzas
    for (let c = 0; c < QTD_COLUNA; c++) {
        let itemAtual = document.getElementById(`${linhaAtual}-${c}`);
        let letter = itemAtual.innerText;

        if (!itemAtual.classList.contains('correct')) {
            if (word.includes(letter) && letterCount[letter] > 0) {
                itemAtual.classList.add('present');
                letterCount[letter] -= 1;
                atualizarClasseTeclado(letter, 'present');
            } else {
                itemAtual.classList.add('absent');
                atualizarClasseTeclado(letter, 'absent');
            }
        }
    }

    if (correct === QTD_COLUNA) {
        finalizarJogo(true);
    } else {
        avancarLinha();
    }
}

function avancarLinha() {
    linhaAtual += 1;
    colunaAtual = 0;

    if (linhaAtual < QTD_LINHA) {
        destacarLinhaUnidade();
        iniciarAmpulheta(tempoEscolhido);
    } else {
        finalizarJogo(false);
    }
}

function finalizarJogo(vitoria) {
    endGame = true;
    clearInterval(timerIntervalo);
    
    if (vitoria) {
        exibirNotificacao("Você acertou!", 'sucesso');
    } else {
        exibirNotificacao("Que pena! A palavra era: " + word, 'erro');
    }

    setTimeout(() => window.location.reload(), vitoria ? 2500 : 3000);
}

/**
 * PROCESSAMENTO DE ENTRADA (INPUT)
 */

function processInput(letra) {
    if (!gameStarted || endGame) return;

    // A-Z
    if (letra.code >= 'KeyA' && letra.code <= 'KeyZ') {
        if (colunaAtual < QTD_COLUNA) {
            let itemAtual = document.getElementById(`${linhaAtual}-${colunaAtual}`);
            if (itemAtual) {
                itemAtual.innerText = letra.key.toUpperCase();
                colunaAtual += 1;
            }
        }
    } 
    // BACKSPACE
    else if (letra.code === "Backspace") {
        // Se o cursor passou do limite (ex: digitou 5 letras, coluna é 5), traz para a última (4)
        if (colunaAtual >= QTD_COLUNA) {
            colunaAtual = QTD_COLUNA - 1;
        }

        let itemAtual = document.getElementById(`${linhaAtual}-${colunaAtual}`);

        if (itemAtual) {
            // Se a caixa atual está vazia e não é a primeira da linha, 
            // significa que o usuário quer apagar a letra anterior
            if (itemAtual.innerText === "" && colunaAtual > 0) {
                colunaAtual -= 1;
                itemAtual = document.getElementById(`${linhaAtual}-${colunaAtual}`);
            }
            
            // Limpa o texto da caixa (seja a atual ou a anterior selecionada acima)
            itemAtual.innerText = '';
        }
    }
    // ENTER
    else if (letra.code === 'Enter' || letra.code === 'NumpadEnter') {
        const tentativa = obterPalavraDigitada();
        if (tentativa.length < QTD_COLUNA) {
            exibirNotificacao('Complete a palavra');
            return; // Para a execução aqui
        }

        validarTentativa();
    }
    // SETAS
    else if (letra.code === "ArrowLeft" && colunaAtual > 0) {
        colunaAtual -= 1;
    } 
    else if (letra.code === "ArrowRight" && colunaAtual < 4) {
        colunaAtual += 1;
    } 

    destacarLinhaUnidade();
}

function selecionarUnidadeComMouse(l, c) {
    if (l == linhaAtual && !endGame) {
        colunaAtual = c;
        destacarLinhaUnidade();
    }
}

/**
 * INICIALIZAÇÃO
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Configura Modais
    DOM.btnAbrirAjuda.onclick = () => DOM.modalAjuda.style.display = 'flex';
    DOM.btnFecharAjuda.onclick = () => DOM.modalAjuda.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == DOM.modalAjuda) DOM.modalAjuda.style.display = 'none';
    };

    // Monta o Jogo
    criarTabuleiro();
    criarTeclado();
    destacarLinhaUnidade();
    
    word = await obterPalavraSecreta();

    DOM.btnComecar.addEventListener('click', () => {
        //Começa o game
        iniciarJogo();
    })
    
    // Eventos de Teclado Físico
    document.addEventListener('keyup', (event) => {
        processInput(event);
    });
});