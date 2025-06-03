// ARQUIVO: renderer.js (Versão Atualizada)

const { ipcRenderer } = require('electron');

// Altere o seletor para buscar o novo ID '#botao-sobre'
let botaoSobre = document.querySelector('#botao-sobre');

// Adiciona o ouvinte de clique ao novo botão
botaoSobre.addEventListener('click', function() {
    // A ação de enviar o evento para o main.js continua exatamente a mesma
    ipcRenderer.send('open-window');
});