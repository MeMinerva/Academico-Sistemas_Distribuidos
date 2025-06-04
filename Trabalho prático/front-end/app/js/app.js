// --- CONFIGURAÇÃO E ESTADO DA APLICAÇÃO ---

const API_BASE_URL = 'https://piece-ic-gender-challenging.trycloudflare.com';
// O authToken ainda é definido aqui, mas o ID do usuário será extraído dele.
let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJuYW1laWQiOiIzIiwibmJmIjoxNzQ4OTY2NjMwLCJleHAiOjE3NDkwNTMwMzAsImlhdCI6MTc0ODk2NjYzMCwiaXNzIjoiV2hhdHNSdXJhbC5TZXJ2ZXIifQ.2t7zKBLJn-h40HBgw972MLYVba-rMg0bIiVv6mMB9Ys";

let pollingInterval = null; // Variável de controlo do polling
let MEU_USER_ID = null; // Será definido dinamicamente a partir do token

// --- FUNÇÕES AUXILIARES ---

/**
 * Decodifica um token JWT para extrair o seu payload.
 * ATENÇÃO: Esta função faz uma descodificação básica e não valida a assinatura do token.
 * A validação da assinatura deve ser feita no backend.
 * @param {string} token O token JWT.
 * @returns {object|null} O payload do token ou null em caso de erro.
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar o JWT:", e);
        return null;
    }
}

/**
 * Define o ID do usuário atual a partir do authToken.
 */
function definirMeuUserId() {
    if (authToken) {
        const tokenPayload = parseJwt(authToken);
        if (tokenPayload && tokenPayload.nameid) {
            MEU_USER_ID = tokenPayload.nameid;
            console.log("ID do Usuário definido como:", MEU_USER_ID);
        } else {
            console.error("Não foi possível extrair 'nameid' do token.");
            // Tratar o caso em que o ID não pode ser obtido (ex: redirecionar para login)
        }
    } else {
        console.error("AuthToken não encontrado. Não é possível definir o ID do usuário.");
        // Tratar o caso de token ausente
    }
}

// Define o ID do usuário assim que o script é carregado e o token está disponível
definirMeuUserId();

// --- FUNÇÕES GENÉRICAS E REUTILIZÁVEIS ---

async function apiFetch(endpoint) {
    if (!authToken) {
        console.error('Erro de autenticação: Token não encontrado.');
        // Idealmente, redirecionar para a página de login ou mostrar uma mensagem ao usuário.
        return null; 
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
        });
        if (!response.ok) {
            console.error(`Erro ao buscar dados de ${endpoint}:`, response.status);
            if (response.status === 401) { // Unauthorized
                console.error("Token inválido ou expirado. Faça login novamente.");
                // Lógica para logout ou refresh do token aqui
            }
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha na requisição para ${endpoint}:`, error);
        return null;
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO ---

async function abrirChat(chatId, chatNome, chatType) {
    if (!MEU_USER_ID) {
        console.error("ID do usuário não definido. Não é possível abrir o chat.");
        // Mostrar uma mensagem de erro para o usuário ou redirecionar para o login
        alert("Erro: ID do usuário não encontrado. Por favor, faça login novamente.");
        return;
    }

    console.log(`Abrindo chat do tipo ${chatType} com ID ${chatId} (Meu User ID: ${MEU_USER_ID})`);
    const chatContainer = document.getElementById('chat-container');
    
    chatContainer.innerHTML = `
        <div id="chat-header">
            <h4>${chatNome}</h4>
        </div>
        <div id="messages-list">
            <p class="loading-message">A carregar mensagens...</p>
        </div>
        <div id="message-input-container">
            <input type="text" id="message-input" placeholder="Digite a sua mensagem...">
            <button id="send-button">Enviar</button>
        </div>
    `;

    const endpoint = chatType === 'conversa'
        ? `/contacts/${chatId}/messages`
        : `/groups/${chatId}/messages`; // Assumindo que a API de grupos também usa /messages

    const responseData = await apiFetch(endpoint);
    const messagesList = document.getElementById('messages-list');
    
    if (!responseData || !responseData.messages || responseData.messages.length === 0) {
        messagesList.innerHTML = '<p class="chat-info-message">Nenhuma mensagem ainda. Inicie a conversa!</p>';
    } else {
        messagesList.innerHTML = ''; 
        responseData.messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            
            // Compara o sender_id da mensagem com o MEU_USER_ID
            if (msg.sender_id && msg.sender_id.toString() === MEU_USER_ID) {
                messageElement.classList.add('sent');
            } else {
                messageElement.classList.add('received');
            }

            messageElement.innerHTML = `
                <p class="sender-name">${msg.sender_name || 'Desconhecido'}</p>
                <p class="message-content">${msg.content || ''}</p>
                <p class="message-timestamp">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</p>
            `;
            messagesList.appendChild(messageElement);
        });
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    document.getElementById('send-button').addEventListener('click', async () => {
        const input = document.getElementById('message-input');
        const messageContent = input.value.trim();
        if (messageContent) {
            console.log(`A enviar: "${messageContent}" para o ${chatType} ID ${chatId}`);
            
            const sendEndpoint = chatType === 'conversa'
                ? `/contacts/${chatId}/messages` // Endpoint para enviar mensagem para contato
                : `/groups/${chatId}/messages`;  // Endpoint para enviar mensagem para grupo

            const payload = {
                content: messageContent
                // A API deve usar o sender_id do token autenticado
            };

            try {
                const response = await fetch(`${API_BASE_URL}${sendEndpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log("Mensagem enviada com sucesso!");
                    input.value = '';
                    
                    const messagesList = document.getElementById('messages-list');
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message', 'sent');
                    messageElement.innerHTML = `
                        <p class="sender-name">Eu</p> 
                        <p class="message-content">${messageContent}</p>
                        <p class="message-timestamp">${new Date().toLocaleTimeString()}</p>
                    `;
                    const emptyMsgEl = messagesList.querySelector('.chat-info-message');
                    if (emptyMsgEl) emptyMsgEl.remove();
                    
                    messagesList.appendChild(messageElement);
                    messagesList.scrollTop = messagesList.scrollHeight;

                } else {
                    const errorData = await response.json();
                    console.error("Erro ao enviar mensagem:", response.status, errorData);
                    alert(`Erro ao enviar mensagem: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Falha ao enviar mensagem:", error);
                alert("Falha na rede ao tentar enviar mensagem.");
            }
        }
    });
}

// =================================================================================
//   FUNÇÃO ATUALIZADA PARA MELHOR ESTILO E FUNCIONALIDADE
// =================================================================================
/**
 * Renderiza uma lista de itens (conversas ou grupos) no container especificado.
 * @param {Array} items - Os itens a serem renderizados.
 * @param {string} containerSelector - O seletor CSS para o container da lista.
 * @param {string} itemType - O tipo de item ('conversa' ou 'grupo').
 * @param {string} emptyMessage - A mensagem a ser exibida se a lista estiver vazia.
 */
function renderizarLista(items, containerSelector, itemType, emptyMessage) {
    const listContainer = document.querySelector(containerSelector);
    if (!listContainer) {
        console.error("Container da lista não encontrado:", containerSelector);
        return;
    }

    listContainer.innerHTML = ''; // Limpa a lista antiga

    if (!items || items.length === 0) {
        listContainer.innerHTML = `<p class="empty-list-message">${emptyMessage}</p>`;
        return;
    }

    items.forEach(item => {
        const itemElement = document.createElement('div');
        // NOTA: A classe foi alterada de 'chat' para 'chat-item' para ser mais específica.
        itemElement.className = 'chat-item';
        itemElement.id = `${itemType}-${item.id}`; // ID único para o elemento

        const nome = item.nome || 'Desconhecido';
        // Pega a primeira letra do nome para usar no avatar
        const primeiraLetra = nome.charAt(0).toUpperCase();

        // Nova estrutura HTML para cada item da lista
        itemElement.innerHTML = `
            <div class="chat-item-avatar" title="${nome}">
                <span>${primeiraLetra}</span>
            </div>
            <div class="chat-item-details">
                <h6 class="chat-item-name">${nome}</h6>
                <p class="chat-item-last-message">${item.ultimaMensagem || 'Nenhuma mensagem recente'}</p>
            </div>
        `;
        
        itemElement.addEventListener('click', () => {
            // Para a atualização automática da lista ao entrar em um chat
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null; 
                console.log("Polling da lista parado ao abrir chat.");
            }

            // --- LÓGICA DE ESTILO ADICIONADA ---
            // Remove a classe 'active' de qualquer outro item da lista
            const allItems = document.querySelectorAll('.chat-item');
            allItems.forEach(el => el.classList.remove('active'));

            // Adiciona a classe 'active' ao item que foi clicado
            itemElement.classList.add('active');
            // --- FIM DA LÓGICA DE ESTILO ---

            abrirChat(item.id, item.nome, itemType);
        });
        
        listContainer.appendChild(itemElement);
    });
}
// =================================================================================


// --- LÓGICA DE NEGÓCIO COM MAPEAMENTO ---

async function buscarErenderizarConversas() {
    const responseData = await apiFetch('/contacts');
    if (!responseData || !responseData.contacts) {
        renderizarLista([], '.chat-list', 'conversa', 'Nenhuma conversa encontrada.');
        return;
    }
    const conversasMapeadas = responseData.contacts.map(contact => ({
        id: contact.id,
        nome: contact.name,
        ultimaMensagem: contact.last_message?.content 
    }));
    renderizarLista(conversasMapeadas, '.chat-list', 'conversa', 'Nenhuma conversa encontrada.');
}

async function buscarErenderizarGrupos() {
    const responseData = await apiFetch('/my-groups');
    if (!responseData || !responseData.groups) {
        renderizarLista([], '.group-list', 'grupo', 'Nenhum grupo encontrado.');
        return;
    }
    const gruposMapeados = responseData.groups.map(group => ({
        id: group.group_id,
        nome: group.group_name,
        ultimaMensagem: group.last_message?.content
    }));
    renderizarLista(gruposMapeados, '.group-list', 'grupo', 'Nenhum grupo encontrado.');
}

// --- LÓGICA PRINCIPAL DA APLICAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const wrapper = document.getElementById('wrapper');
    const sairBtn = document.getElementById('botao-sair');
    const todosOsBotoesAbas = document.querySelectorAll('#menu #sup .icon'); // Seleciona apenas botões de abas
    const infoContainer = document.querySelector('#info-container');
    const { ipcRenderer } = require('electron'); // Certifique-se que isto é necessário e está configurado corretamente

    if (!MEU_USER_ID && authToken) { // Tenta definir novamente se não foi definido no carregamento inicial
        definirMeuUserId();
    }
    
    // Verifica se o usuário está "logado" (tem um token e ID)
    if (authToken && MEU_USER_ID) {
        loginContainer.style.display = 'none';
        wrapper.style.display = 'flex'; // Ou o display original do wrapper
        // Carregar a primeira aba por defeito, por exemplo, conversas
        const botaoConversas = document.getElementById('botao-conversas');
        if (botaoConversas) {
            botaoConversas.click(); // Simula um clique para carregar a aba inicial
        }
    } else {
        loginContainer.style.display = 'flex';
        wrapper.style.display = 'none';
    }


    sairBtn.addEventListener('click', () => {
        console.log('Botão Sair clicado. A efetuar logout...');
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        wrapper.style.display = 'none';
        loginContainer.style.display = 'flex';
        
        // Limpa o token e o ID do usuário
        authToken = null;
        MEU_USER_ID = null; 
        
        // Limpa o conteúdo do chat e da lista
        document.getElementById('chat-container').innerHTML = `
            <img src="icons/giphy.gif" id="gif" />
            <h2 style="margin-bottom: 0; color: rgb(70, 70, 70);">✨ Aplicativo de mensagens ✨</h2>
            <p style="margin-top: 0; color: rgb(150, 150, 150)"><b>By: Pedrinho</b> e Maria <b>(Minerva)</b> Eduarda</p>
            <p style="margin-bottom: 5px; font-size: smaller; color: rgb(150, 150, 150); position: fixed; bottom: 0;">Para mais informações, acesse o 'Sobre'!</p>
        `;
        if(infoContainer) infoContainer.innerHTML = '';

        console.log('Logout efetuado. Token, User ID e polling foram limpos.');
    });

    const tabsConfig = {
        'botao-conversas': {
            title: 'Contatos',
            listContainerClass: 'chat-list',
            fetchFunction: buscarErenderizarConversas,
            addEventName: 'abrir-nova-conversa'
        },
        'botao-grupos': {
            title: 'Grupos',
            listContainerClass: 'group-list',
            fetchFunction: buscarErenderizarGrupos,
            addEventName: 'abrir-novo-grupo'
        }
    };

    todosOsBotoesAbas.forEach(botao => {
        botao.addEventListener('click', () => {
            const config = tabsConfig[botao.id];
            if (!config) return; 

            todosOsBotoesAbas.forEach(btn => btn.classList.remove('selecionado'));
            botao.classList.add('selecionado');
            
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                console.log("Polling da lista anterior parado.");
            }

            infoContainer.innerHTML = `
                <div class="aa"> <h3>${config.title}</h3>
                    <div class="icon2" id="add-item" title="Adicionar novo ${config.title.slice(0,-1).toLowerCase()}">
                        <div class="img-icon" id="add"><img src="icons/mais.png" width="30px" height="30px"></div>
                    </div>
                </div>
                <div class="${config.listContainerClass}"></div>`; // Container para a lista

            config.fetchFunction(); // Busca e renderiza a lista uma vez
            pollingInterval = setInterval(config.fetchFunction, 5000); // Inicia polling para esta lista
            console.log(`Polling iniciado para ${config.title}`);

            document.getElementById('add-item').addEventListener('click', () => {
                ipcRenderer.send(config.addEventName); // Para Electron
            });
        });
    });

    // Lógica para o botão 'Sobre', se necessário
    const botaoSobre = document.getElementById('botao-sobre');
    if (botaoSobre) {
        botaoSobre.addEventListener('click', () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                console.log("Polling da lista parado ao abrir 'Sobre'.");
            }
            todosOsBotoesAbas.forEach(btn => btn.classList.remove('selecionado'));
            botaoSobre.classList.add('selecionado');

            if (infoContainer) infoContainer.innerHTML = ''; 
            
            // Remove a classe 'active' de todos os itens de chat/grupo ao ir para 'Sobre'
            document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
            
            document.getElementById('chat-container').innerHTML = `
                <img src="icons/giphy.gif" id="gif" />
                <h2 style="margin-bottom: 0; color: rgb(70, 70, 70);">✨ Aplicativo de mensagens ✨</h2>
                <p style="margin-top: 0; color: rgb(150, 150, 150)"><b>By: Pedrinho</b> e Maria <b>(Minerva)</b> Eduarda</p>
                <p>Esta é uma aplicação de chat desenvolvida com muito carinho!</p>
                <p>Versão: 1.0.0</p>
                <p style="margin-bottom: 5px; font-size: smaller; color: rgb(150, 150, 150); position: fixed; bottom: 0;">Para mais informações, acesse o 'Sobre'!</p>
            `;
        });
    }
});