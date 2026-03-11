//VARIÁVEIS DE CONTROLE
const qtdLinha = 6;
const qtdColuna = 5;

let linhaAtual = 0;
let colunaAtual = 0;

let endGame = false;

let wordList = [];
let word = "";

//FUNÇÕES

//Função para exibir notificação
function exibirNotificacao(mensagem, tipo = '') {
    const container = document.querySelector('#container-notificacoes');
    const elemento = document.createElement('div');
    
    elemento.classList.add('notificacao');
    if (tipo) elemento.classList.add(tipo);
    elemento.textContent = mensagem;
    
    container.appendChild(elemento);

    setTimeout(() => {
        elemento.classList.add('fade-out');
        
        setTimeout(() => {
            elemento.remove();
        }, 1000); 
    }, 2000);
}

//Função para destacar a linha atual e a unidade atual
function destacarLinhaUnidade() {

    //Remove o destaque antigo
    document.querySelectorAll('.linha').forEach(l => l.classList.remove('linha-ativa'));
    document.querySelectorAll('.unidade').forEach(u => u.classList.remove('unidade-foco'));

    //Destaca a linha atual
    const linhas = document.querySelectorAll('.linha');
    if (linhas[linhaAtual]) {
        linhas[linhaAtual].classList.add('linha-ativa');
    }

    // Destaca a unidade atual atual
    let indexColuna = colunaAtual;

    // Se o usuário já preencheu tudo, mantemos o destaque na última unidade
    if (indexColuna == qtdColuna) {
        indexColuna  = qtdColuna - 1;
    }

    const itemAtivo = document.getElementById(`${linhaAtual}-${indexColuna}`);

    if (itemAtivo && !endGame) {
        itemAtivo.classList.add('unidade-foco');
    }
}

//Função para criar a matriz de quadrados onde irão ficar as palavras e letras
function criarTabuleiro(qtdLinha, qtdColuna) {

    //Cria a seção do tabuleiro 
    const tabuleiro = document.createElement('section');
    tabuleiro.classList.add('tabuleiro');

    //Cria as linhas
    for(l = 0; l < qtdLinha; l++) {
        let linha = document.createElement('ul');
        linha.classList.add('linha');

        //Cria as colunas
        for(c = 0; c < qtdColuna; c++) {
            let item = document.createElement('li');
            item.classList.add('unidade');
            item.id = `${l}-${c}`;

            //Adiciona cada unidade dentro da sua linha
            linha.appendChild(item);
        };

        //Adiciona cada linha dentro do tabuleiro 
        tabuleiro.appendChild(linha);
    }

    //Adiciona o tabuleiro criado no HTML
    document.querySelector('.container').appendChild(tabuleiro);
}


function update() {
    //
    if (colunaAtual < qtdColuna) return exibirNotificacao('Complete a palavra');

    let correct = 0;
    let letterCount = {};

    //Cria um "estoque" de letras da palavra correta para otimizar a verificação
    // Se a palavra for "ARARA", o estoque será { A: 3, R: 2 }
    for (let i = 0; i < word.length; i++) {
        let letter = word[i];
        if (letterCount[letter]) {
            letterCount[letter] += 1;
        } else {
            letterCount[letter] = 1;
        }
    }

    //Passo por toda a palavra e marco as letras que estão na posição certa de verdes
    for (let c = 0; c < qtdColuna; c++) {
        let itemAtual = document.getElementById(`${linhaAtual}-${c}`);
        let letter = itemAtual.innerText;

        //Verifica se a letra está na posição correta
        if (word[c] === letter) {
            itemAtual.classList.add('correct');
            correct += 1;
            letterCount[letter] -= 1; // Remove do estoque para não repetir no amarelo
        }
    }

    //Passo por toda a palavra e marco as letras que tem na palavra mas que estão na posição errada e as que não tem na palavra
    for (let c = 0; c < qtdColuna; c++) {
        let itemAtual = document.getElementById(`${linhaAtual}-${c}`);
        let letter = itemAtual.innerText;

        // Só verificamos se não for verde
        if (!itemAtual.classList.contains('correct')) {

            //Verificamos se a letra está na palavra certa e se ela já não foi marcada como verde 
            if (word.includes(letter) && letterCount[letter] > 0) {
                itemAtual.classList.add('present');
                letterCount[letter] -= 1;
            } else {
                itemAtual.classList.add('absent');
            }
        }
    }

    //Se acertou a palavra, retorna que o jogo acabou e exibi a notificação de vitória
    if (correct === qtdColuna) {
        endGame = true;
        exibirNotificacao("Você acertou!", 'sucesso');
        setTimeout(() => {
            window.location.reload();
        }, 2500);
        
    }else {
        linhaAtual += 1; // Pula para a linha de baixo
        colunaAtual = 0; // Volta para a primeira coluna da nova linha
    }
}


//Função para processar a tecla digitada
function processInput(letra) {
    if (endGame) return; // Se o jogo acabou, não processa nada

    //Verifica se a tecla clicada foi uma letra
    if (letra.code >= 'KeyA' && letra.code <= 'KeyZ') {

        //Verifica se já não foi preenchida todas as letras da linha
        if (colunaAtual < qtdColuna) {
            let itemAtual = document.getElementById(`${linhaAtual}-${colunaAtual}`);
            
            //Verifica se o item selecionado está vazio (meio desnecessário nesse contexto, mas vai servir se adicionarmos a opção de selecionar a unidade com o mouse)
            if (itemAtual.innerText === '') {
                itemAtual.innerText = letra.key.toUpperCase();
                colunaAtual += 1;
            }
        }
    } 
    
    //Apaga uma letra se clicar a tecla clicada foi o Backspace
    else if (letra.code === "Backspace") {
        if (colunaAtual > 0) {
            colunaAtual -= 1; // Volta uma posição antes de apagar
            let itemAtual = document.getElementById(`${linhaAtual}-${colunaAtual}`);
            itemAtual.innerText = '';
        }
    } 
    
    //Se a tecla clicada foi Enter, ou seja, ele quer enviar a tentativa, chamos a função para verificar essa tentativa
    else if (letra.code === 'Enter' || letra.code === 'NumpadEnter') {
        update();
    }

    destacarLinhaUnidade();

    //Verifica se as tentativas acabaram e o usuário perdeu
    if (!endGame && linhaAtual === qtdLinha) {
        //Indica que o jogo acabou
        endGame = true;

        //Mostra a palavra certa e reinicia a página
        exibirNotificacao("Que pena! A palavra era: " + word, 'erro');
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    criarTabuleiro(qtdLinha, qtdColuna);
    destacarLinhaUnidade();

    wordList = ['cacau', 'ponta', 'porta', 'curso'];
    word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    
    document.addEventListener('keyup', (letraClicada) => {
        processInput(letraClicada);
        console.log(letraClicada)
    })
})
