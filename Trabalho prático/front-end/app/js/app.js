document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const registerToggle = document.getElementById('register-toggle');
    const registerButton = document.getElementById('register-button');
    const backToLogin = document.getElementById('back-to-login');

    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const wrapper = document.getElementById('wrapper');

    // Removido o uso de localStorage
    loginButton.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://192.168.74.85:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authentication': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJuYW1laWQiOiIzIiwibmJmIjoxNzQ4OTY2NjMwLCJleHAiOjE3NDkwNTMwMzAsImlhdCI6MTc0ODk2NjYzMCwiaXNzIjoiV2hhdHNSdXJhbC5TZXJ2ZXIifQ.2t7zKBLJn-h40HBgw972MLYVba-rMg0bIiVv6mMB9Ys'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (response.ok) {
                loginContainer.style.display = 'none';
                wrapper.style.display = 'flex';
            } else {
                document.getElementById('login-error').style.display = 'block';
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            document.getElementById('login-error').style.display = 'block';
        }
    });

    registerToggle.addEventListener('click', () => {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'flex';
    });

    backToLogin.addEventListener('click', () => {
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'flex';
        document.getElementById('register-error').style.display = 'none';
    });

    // REGISTRO VIA FETCH (substituição feita aqui)
    registerButton.addEventListener('click', async () => {
        const newUsername = document.getElementById('new-username').value;
        const newPassword = document.getElementById('new-password').value;
        const newEmail = document.getElementById('new-email').value;

        document.getElementById('register-error').style.display = 'none';

        try {
            const response = await fetch('http://192.168.74.85:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authentication': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJuYW1laWQiOiIzIiwibmJmIjoxNzQ4OTY2NjMwLCJleHAiOjE3NDkwNTMwMzAsImlhdCI6MTc0ODk2NjYzMCwiaXNzIjoiV2hhdHNSdXJhbC5TZXJ2ZXIifQ.2t7zKBLJn-h40HBgw972MLYVba-rMg0bIiVv6mMB9Ys'
                },
                body: JSON.stringify({
                    name: newUsername,
                    email: newEmail,
                    password: newPassword
                })
            });

            if (response.ok) {
                registerContainer.style.display = 'none';
                wrapper.style.display = 'flex';
            } else if (response.status === 409) {
                document.getElementById('register-error').textContent = 'Usuário já existe.';
                document.getElementById('register-error').style.display = 'block';
            } else {
                document.getElementById('register-error').textContent = 'Erro ao registrar.';
                document.getElementById('register-error').style.display = 'block';
            }
        } catch (error) {
            console.error('Erro na requisição de registro:', error);
            document.getElementById('register-error').textContent = 'Erro de conexão com o servidor.';
            document.getElementById('register-error').style.display = 'block';
        }
    });

    // Botão "Sair"
    const sairBtn = document.getElementById('botao-sair');
    sairBtn.addEventListener('click', () => {
        wrapper.style.display = 'none';
        loginContainer.style.display = 'flex';
    });

    // Menu
    const todosOsBotoes = document.querySelectorAll('.icon');
    const infoContainer = document.querySelector('#info-container');
    const { ipcRenderer } = require('electron'); // Mover para fora do forEach, já que não muda

    todosOsBotoes.forEach(botao => {
        botao.addEventListener('click', () => {
            todosOsBotoes.forEach(btn => btn.classList.remove('selecionado'));
            botao.classList.add('selecionado');

            if (botao.id === 'botao-conversas') {
                infoContainer.innerHTML = `
                    <div class="aa">
                        <h3>Contatos</h3>
                        <div class="icon2" id="add-chat">
                            <div class="img-icon" id="add">
                                <img src="icons/mais.png" width="30px" height="30px">
                            </div>
                        </div>
                    </div>
                    <div class="chat-list">
                        <div class="chat">
                            <h6>Contato 1 <3</h6>
                        </div>
                    </div>
                `;
                const addChatBtn = document.getElementById('add-chat');
                if (addChatBtn) {
                    addChatBtn.addEventListener('click', () => {
                        ipcRenderer.send('abrir-nova-conversa');
                    });
                }
            } else if (botao.id === 'botao-grupos') {
                infoContainer.innerHTML = `
                    <div class="aa">
                        <h3>Grupos</h3>
                        <div class="icon2" id="add-group">
                            <img src="icons/mais.png" alt="Adicionar Grupo">
                        </div>
                    </div>
                `;
                const addGroupBtn = document.getElementById('add-group');
                const form = document.getElementById('form-nova-conversa'); // Formulário carregado no primeiro evento
                
                if (addGroupBtn && form) {
                    // Evento 1: Abre o formulário quando o botão for clicado
                    addGroupBtn.addEventListener('click', () => {
                        // Envia o IPC para abrir a janela de formulário
                        ipcRenderer.send('abrir-novo-grupo');
                
                        // Exibe o formulário
                        form.style.display = 'block';
                    });

                    // Evento 2: Envia os dados do formulário quando o formulário for enviado
                    form.addEventListener('submit', async (event) => {
                        // 1. Previne o comportamento padrão do formulário
                        event.preventDefault();

                        // 2. Seleciona os campos e obtém seus valores
                        const emailContato = document.getElementById('email-contato').value;
                        const mensagem = document.getElementById('input-mensagem').value;

                        // 3. Validação simples
                        if (!emailContato.trim() || !mensagem.trim()) {
                            alert('Por favor, preencha todos os campos.');
                            return;
                        }

                        // 4. Monta os dados
                        const dados = {
                            email: emailContato,
                            mensagem: mensagem
                        };

                        // 5. Realiza a requisição POST via fetch
                        try {
                            console.log('Enviando dados:', dados);
                            alert('Enviando sua mensagem...');

                            const response = await fetch(`http://192.168.74.85:8000/user?email=${emailContato}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'authentication': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJuYW1laWQiOiIzIiwibmJmIjoxNzQ4OTY2NjMwLCJleHAiOjE3NDkwNTMwMzAsImlhdCI6MTc0ODk2NjYzMCwiaXNzIjoiV2hhdHNSdXJhbC5TZXJ2ZXIifQ.2t7zKBLJn-h40HBgw972MLYVba-rMg0bIiVv6mMB9Ys'
                                },
                            });

                            if (response.ok) {
                                const resultado = await response.json();
                                console.log('Resposta do servidor:', resultado);
                                alert('Mensagem enviada com sucesso!');
                                form.reset(); // Limpa o formulário
                            } else {
                                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
                            }
                        } catch (error) {
                            console.error('Falha ao enviar a conversa:', error);
                            alert('Ocorreu um erro ao tentar enviar a mensagem. Por favor, tente novamente.');
                        }
                    });
                }
            }
        });
    });
});
