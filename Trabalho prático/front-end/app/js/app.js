// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
const API_BASE_URL = 'https://piece-ic-gender-challenging.trycloudflare.com'; // Altere se necessário
let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJuYW1laWQiOiIzIiwibmJmIjoxNzQ4OTY2NjMwLCJleHAiOjE3NDkwNTMwMzAsImlhdCI6MTc0ODk2NjYzMCwiaXNzIjoiV2hhdHNSdXJhbC5TZXJ2ZXIifQ.2t7zKBLJn-h40HBgw972MLYVba-rMg0bIiVv6mMB9Ys"; // Seu token de autenticação
let MEU_USER_ID = null;      // Será extraído do token JWT
let pollingInterval = null;  // Intervalo de polling para lista de chats
let chatPollingInterval = null; // Intervalo de polling para chat aberto

// --- FUNÇÃO AUXILIAR: DECODIFICA JWT E RETORNA PAYLOAD ---
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar o JWT:", e);
        return null;
    }
}

// --- FUNÇÃO: DEFINE MEU_USER_ID A PARTIR DO TOKEN JWT ---
function definirMeuUserId() {
    if (!authToken) {
        console.error("AuthToken não encontrado.");
        return;
    }
    const tokenPayload = parseJwt(authToken);
    if (tokenPayload && tokenPayload.nameid) {
        MEU_USER_ID = tokenPayload.nameid.toString();
        console.log("ID do Usuário definido como:", MEU_USER_ID);
    } else {
        console.error("Não foi possível extrair 'nameid' do token.");
    }
}
definirMeuUserId();

// --- BUSCA E RENDERIZA AS MENSAGENS DO CHAT ABERTO ---
async function buscarEAtualizarMensagens(chatId, chatType) {
    // Define endpoint conforme tipo: conversa privada ou grupo
    const messagesEndpoint = chatType === 'conversa'
        ? `${API_BASE_URL}/contacts/${chatId}/messages`
        : `${API_BASE_URL}/groups/${chatId}/messages`;

    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;

    // Verifica se estava rolado até o fim para manter posição
    const isScrolledToBottom = (messagesList.scrollHeight - messagesList.clientHeight) <= (messagesList.scrollTop + 1);

    try {
        const response = await fetch(messagesEndpoint, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
            console.warn(`Polling: Não foi possível buscar mensagens de ${messagesEndpoint} - Status ${response.status}`);
            return;
        }

        // A API retorna diretamente um array de mensagens
        const mensagensArray = await response.json(); // ex: [ { sender_id, group_id, content, timestamp, type }, ... ]

        // Quantidade atual x nova quantidade
        const novaQuantidade = mensagensArray.length;
        const atualQuantidade = messagesList.querySelectorAll('.message').length;

        if (atualQuantidade === novaQuantidade && atualQuantidade > 0) {
            // Sem alterações no número de mensagens, nada a fazer
            return;
        }

        // Limpa lista e re-renderiza
        messagesList.innerHTML = '';
        if (novaQuantidade === 0) {
            messagesList.innerHTML = '<p class="chat-info-message">Nenhuma mensagem ainda. Inicie a conversa!</p>';
        } else {
            mensagensArray.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');

                // Determina se foi enviada por mim ou recebida
                const senderIdStr = msg.sender_id.toString();
                if (senderIdStr === MEU_USER_ID) {
                    messageElement.classList.add('sent');
                } else {
                    messageElement.classList.add('received');
                }

                // Exibe “Eu” se for minha mensagem, ou o sender_id caso contrário
                const senderName = (senderIdStr === MEU_USER_ID) ? 'Eu' : `ID:${senderIdStr}`;
                const content    = msg.content    || '';
                const timestamp  = msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : '';

                messageElement.innerHTML = `
                    <p class="sender-name">${senderName}</p>
                    <p class="message-content">${content}</p>
                    <p class="message-timestamp">${timestamp}</p>
                `;
                messagesList.appendChild(messageElement);
            });
        }

        // Se estava rolado até o fim, mantém no fim
        if (isScrolledToBottom) {
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    } catch (error) {
        console.error("Erro no polling do chat:", error);
    }
}

// --- ABRE O CHAT (CONVERSA OU GRUPO) E CONFIGURA ENVIO / POLLING ---
async function abrirChat(chatId, chatNome, chatType) {
    if (!MEU_USER_ID) {
        console.error("ID do usuário não definido. Não é possível abrir o chat.");
        return;
    }

    // Cancela polling anteriores
    if (pollingInterval)     { clearInterval(pollingInterval); pollingInterval = null; }
    if (chatPollingInterval) { clearInterval(chatPollingInterval); chatPollingInterval = null; }

    // Marca item selecionado
    document.querySelectorAll('.chat-item.active').forEach(activeItem => {
        activeItem.classList.remove('active');
    });
    const listItem = document.getElementById(`${chatType}-${chatId}`);
    if (listItem) listItem.classList.add('active');

    // Monta UI do chat
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = `
        <div id="chat-header"><h4>${chatNome}</h4></div>
        <div id="messages-list"><p class="loading-message">Carregando mensagens...</p></div>
        <div id="message-input-container">
            <input type="text" id="message-input" placeholder="Digite a sua mensagem...">
            <button id="send-button">Enviar</button>
        </div>
    `;

    // Primeira chamada para preencher mensagens
    await buscarEAtualizarMensagens(chatId, chatType);

    // Polling a cada 3 segundos
    chatPollingInterval = setInterval(() => buscarEAtualizarMensagens(chatId, chatType), 3000);

    // Elementos de envio
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const messagesList = document.getElementById('messages-list');

    // Função chamada ao clicar em “Enviar”
    sendButton.addEventListener('click', async () => {
        const messageContent = messageInput.value.trim();
        if (!messageContent) return;

        // Cria mensagem temporária na interface
        const tempId = `temp_${Date.now()}`;
        messageInput.value = '';
        const tempMessageElement = document.createElement('div');
        tempMessageElement.id = tempId;
        tempMessageElement.classList.add('message', 'sent', 'sending');
        tempMessageElement.innerHTML = `
            <p class="sender-name">Eu</p>
            <p class="message-content">${messageContent}</p>
            <p class="message-timestamp">${new Date().toLocaleTimeString()} (Enviando...)</p>
        `;
        const emptyMsgEl = messagesList.querySelector('.chat-info-message');
        if (emptyMsgEl) emptyMsgEl.remove();
        messagesList.appendChild(tempMessageElement);
        messagesList.scrollTop = messagesList.scrollHeight;

        // Monta payload conforme tipo de chat
        const data_contact = {
            user_id: chatId,       // ID do usuário destinatário
            content: messageContent,
            type: "PRIVATE"
        };
        const data_group = {
            group_id: chatId,
            content: messageContent,
            type: "GROUP"
        };
        const payload = (chatType === 'conversa') ? data_contact : data_group;

        try {
            const response = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            const sentMessageElement = document.getElementById(tempId);
            if (response.ok) {
                // A API retorna apenas { message_id }, sem timestamp.
                // Ajustamos na interface e aguardamos o próximo polling recarregar a lista real.
                if (sentMessageElement) {
                    const timestampEl = sentMessageElement.querySelector('.message-timestamp');
                    if (timestampEl) {
                        // Usa hora local como “confirmação”
                        timestampEl.textContent = new Date().toLocaleTimeString();
                    }
                    sentMessageElement.classList.remove('sending');
                    sentMessageElement.classList.add('sent');
                }
                // Recarrega mensagens de fato
                await buscarEAtualizarMensagens(chatId, chatType);
            } else {
                console.error("Erro ao enviar mensagem:", response.status, await response.text());
                if (sentMessageElement) {
                    const timestampEl = sentMessageElement.querySelector('.message-timestamp');
                    if (timestampEl) timestampEl.textContent += " (Falha ao enviar)";
                    sentMessageElement.classList.add('failed');
                    sentMessageElement.classList.remove('sending');
                }
                messageInput.value = messageContent;
            }
        } catch (error) {
            console.error("Falha na requisição de envio de mensagem:", error);
            const failedMessageElement = document.getElementById(tempId);
            if (failedMessageElement) {
                const timestampEl = failedMessageElement.querySelector('.message-timestamp');
                if (timestampEl) timestampEl.textContent += " (Erro de rede)";
                failedMessageElement.classList.add('failed');
                failedMessageElement.classList.remove('sending');
            }
            messageInput.value = messageContent;
        }
    });

    // Permite ENTER para enviar
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
        }
    });
}

// --- RENDERIZA LISTA DE CONTATOS OU GRUPOS (SEM CHAT ABERTO) ---
function renderizarLista(items, containerSelector, itemType, emptyMessage) {
    const listContainer = document.querySelector(containerSelector);
    if (!listContainer) {
        console.error("Container da lista não encontrado:", containerSelector);
        return;
    }
    listContainer.innerHTML = '';
    if (!items || items.length === 0) {
        listContainer.innerHTML = `<p class="empty-list-message">${emptyMessage}</p>`;
        return;
    }

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'chat-item';
        itemElement.id = `${itemType}-${item.id}`;
        const nome = item.nome || 'Desconhecido';
        const primeiraLetra = nome.charAt(0).toUpperCase();
        // Se houver última mensagem, usa content; senão exibe mensagem genérica
        const ultimaMsgContent = item.ultimaMensagem
            ? item.ultimaMensagem.content || ''
            : null;

        itemElement.innerHTML = `
            <div class="chat-item-avatar" title="${nome}"><span>${primeiraLetra}</span></div>
            <div class="chat-item-details">
                <h6 class="chat-item-name">${nome}</h6>
                <p class="chat-item-last-message">${ultimaMsgContent || 'Nenhuma mensagem recente'}</p>
            </div>
        `;
        // Ao clicar, chama abrirChat com tipo (“conversa” ou “grupo”)
        itemElement.addEventListener('click', () => abrirChat(item.id, item.nome, itemType));
        listContainer.appendChild(itemElement);
    });
}

// --- FUNÇÃO AUXILIAR PARA CHAMADAS GET COM AUTH ---
async function fetchApi(endpoint) {
    if (!authToken) {
        console.error('Erro de autenticação: Token não encontrado.');
        return null;
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) {
            console.error(`Erro ao buscar dados de ${endpoint}:`, response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha na requisição para ${endpoint}:`, error);
        return null;
    }
}

// --- BUSCA LISTA DE CONTATOS (/contacts) ---
async function buscarErenderizarConversas() {
    const responseData = await fetchApi('/contacts');
    if (!responseData || !responseData.contacts) {
        renderizarLista([], '.chat-list', 'conversa', 'Nenhuma conversa encontrada.');
        return;
    }
    // Mapeia cada contato para { id, nome, ultimaMensagem }
    const conversasMapeadas = responseData.contacts.map(contact => ({
        id: contact.id,
        nome: contact.name,
        ultimaMensagem: contact.last_message // Pode ser null ou { sender_id, content, timestamp, type }
    }));
    renderizarLista(conversasMapeadas, '.chat-list', 'conversa', 'Nenhuma conversa encontrada.');
}

// --- BUSCA LISTA DE GRUPOS (/my-groups) ---
async function buscarErenderizarGrupos() {
    const responseData = await fetchApi('/my-groups');
    if (!responseData || !responseData.groups) {
        renderizarLista([], '.group-list', 'grupo', 'Nenhum grupo encontrado.');
        return;
    }
    // Mapeia cada grupo para { id, nome, ultimaMensagem }
    const gruposMapeados = responseData.groups.map(group => ({
        id: group.group_id,
        nome: group.group_name,
        ultimaMensagem: group.last_message // Pode ser null ou { sender_id, content, timestamp, type }
    }));
    renderizarLista(gruposMapeados, '.group-list', 'grupo', 'Nenhum grupo encontrado.');
}

// --- AO CARREGAR A PÁGINA (“DOMContentLoaded”) ---
document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const wrapper = document.getElementById('wrapper');
    const sairBtn = document.getElementById('botao-sair');
    const todosOsBotoesAbas = document.querySelectorAll('#menu #sup .icon');
    const infoContainer = document.querySelector('#info-container');
    const chatContainer = document.getElementById('chat-container');
    let ipcRenderer = null;

    try {
        ipcRenderer = require('electron').ipcRenderer;
    } catch (e) {
        console.warn("Não está rodando em Electron, ipcRenderer não disponível.");
    }

    // Se já tivermos token e MEU_USER_ID válido, exibe interface principal
    if (authToken && MEU_USER_ID) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (wrapper) wrapper.style.display = 'flex';
        const botaoConversas = document.getElementById('botao-conversas');
        if (botaoConversas) botaoConversas.click();
    } else {
        if (loginContainer) loginContainer.style.display = 'flex';
        if (wrapper) wrapper.style.display = 'none';
    }

    // BOTÃO “Sair”: limpa token, intervals e volta ao login
    if (sairBtn) {
        sairBtn.addEventListener('click', () => {
            console.log('Botão Sair clicado. Efetuando logout...');
            if (pollingInterval)     { clearInterval(pollingInterval); pollingInterval = null; }
            if (chatPollingInterval) { clearInterval(chatPollingInterval); chatPollingInterval = null; }

            if (wrapper) wrapper.style.display = 'none';
            if (loginContainer) loginContainer.style.display = 'flex';

            authToken = null;
            MEU_USER_ID = null;

            if (chatContainer) {
                chatContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
                        <img src="icons/giphy.gif" id="gif" alt="GIF animado de boas-vindas" style="width: 150px; height: auto; margin-bottom: 20px;" />
                        <h2 style="margin-bottom: 0; color: rgb(70, 70, 70);">✨ Aplicativo de mensagens ✨</h2>
                        <p style="margin-top: 5px; color: rgb(150, 150, 150)"><b>By: Pedrinho</b> e Maria <b>(Minerva)</b> Eduarda</p>
                        <p style="margin-top: 20px; font-size: smaller; color: rgb(150, 150, 150); position: absolute; bottom: 10px;">Para mais informações, acesse o 'Sobre'!</p>
                    </div>
                `;
            }
            if (infoContainer) infoContainer.innerHTML = '';
            console.log('Logout efetuado. Token, User ID e polling foram limpos.');
        });
    }

    // CONFIGURAÇÃO DAS ABAS “Contatos” E “Grupos”
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
        if (tabsConfig[botao.id]) {
            botao.addEventListener('click', () => {
                // Cancela polling do chat aberto, se existir
                if (chatPollingInterval) { clearInterval(chatPollingInterval); chatPollingInterval = null; }

                const config = tabsConfig[botao.id];
                todosOsBotoesAbas.forEach(btn => btn.classList.remove('selecionado'));
                botao.classList.add('selecionado');

                // Cancela polling da lista anterior
                if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }

                // Monta cabeçalho + container da lista
                if (infoContainer) {
                    infoContainer.innerHTML = `
                        <div class="aa" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 1px solid #eee;">
                            <h3 style="margin: 0; font-size: 1.2em;">${config.title}</h3>
                            <div class="icon2" id="add-item" title="Adicionar novo ${config.title.slice(0, -1).toLowerCase()}" style="cursor: pointer;">
                                <div class="img-icon" id="add"><img src="icons/mais.png" width="24px" height="24px" alt="Adicionar"></div>
                            </div>
                        </div>
                        <div class="${config.listContainerClass}" style="height: calc(100% - 50px); overflow-y: auto;"></div>
                    `;
                }

                // Carrega lista e inicia polling a cada 5 segundos
                config.fetchFunction();
                pollingInterval = setInterval(config.fetchFunction, 2000);
                console.log(`Polling iniciado para ${config.title}`);

                // Evento do botão “+” (caso use Electron para novas conversas/grupos)
                const addItemButton = document.getElementById('add-item');
                if (addItemButton) {
                    addItemButton.addEventListener('click', () => {
                        if (ipcRenderer && config.addEventName) {
                            ipcRenderer.send(config.addEventName);
                        } else {
                            console.warn(`ipcRenderer não disponível ou evento '${config.addEventName}' não definido.`);
                        }
                    });
                }
            });
        }
    });

    // ABA “Sobre”
    const botaoSobre = document.getElementById('botao-sobre');
    if (botaoSobre) {
        botaoSobre.addEventListener('click', () => {
            if (pollingInterval)     { clearInterval(pollingInterval); pollingInterval = null; }
            if (chatPollingInterval) { clearInterval(chatPollingInterval); chatPollingInterval = null; }

            todosOsBotoesAbas.forEach(btn => btn.classList.remove('selecionado'));
            botaoSobre.classList.add('selecionado');
            document.querySelectorAll('.chat-item.active').forEach(activeItem => {
                activeItem.classList.remove('active');
            });

            if (infoContainer) infoContainer.innerHTML = '';
            if (chatContainer) {
                chatContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 20px;">
                        <img src="icons/giphy.gif" id="gif" />
                        <h2 style="margin-bottom: 0; color: rgb(70, 70, 70);">✨ Aplicativo de mensagens ✨</h2>
                        <p style="margin-top: 5px; color: rgb(150, 150, 150);"><b>By: Pedrinho</b> e Maria <b>(Minerva)</b> Eduarda</p>
                        <p style="margin-top: 15px;">Esta é uma aplicação de chat desenvolvida com muito carinho!</p>
                        <p>Versão: 1.0.0</p>
                        <p style="margin-top: 20px; font-size: smaller; color: rgb(150, 150, 150); position: absolute; bottom: 10px;">Para mais informações, acesse o 'Sobre'!</p>
                    </div>
                `;
            }
        });
    }
});
