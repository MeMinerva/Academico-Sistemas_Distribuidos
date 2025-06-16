const API_BASE_URL = 'https://rpc.pedrohdncorrea.com.br';
const AUTH_TOKEN = localStorage.getItem('authToken');

console.log(AUTH_TOKEN)
// const AUTH_TOKEN = "..." // <<< ALTERAÇÃO: Token fixo removido.

document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const wrapper = document.getElementById('wrapper');

    function updateView() {
        const loggedIn = localStorage.getItem('loggedIn');
        if (loggedIn === 'true') {
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'none';
            wrapper.style.display = 'flex';
        } else {
            loginContainer.style.display = 'flex';
            registerContainer.style.display = 'none';
            wrapper.style.display = 'none';
        }
    }

    fetch('html/loginpage.html')
        .then(response => response.text())
        .then(data => {
            loginContainer.innerHTML = data;

            const registerToggle = document.getElementById('register-toggle');
            const loginButton = document.getElementById('login-button');

            registerToggle.addEventListener('click', () => {
                loginContainer.style.display = 'none';
                registerContainer.style.display = 'flex';
            });

            loginButton.addEventListener('click', async () => {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    const response = await fetch(`${API_BASE_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // <<< ALTERAÇÃO: Cabeçalho de autenticação removido daqui.
                        },
                        body: JSON.stringify({ email, password })
                    });

                    if (response.ok) {
                        // <<< ALTERAÇÃO: Captura e armazena o token retornado pela API.
                        const responseData = await response.json(); 
                        if (responseData.token) {
                            localStorage.setItem('authToken', responseData.token); // Salva o token
                            localStorage.setItem('loggedIn', 'true');
                            updateView();
                        } else {
                            // Caso a resposta seja OK, mas não contenha um token
                            document.getElementById('login-error').textContent = 'Erro: Token não recebido do servidor.';
                            document.getElementById('login-error').style.display = 'block';
                        }
                    } else {
                        document.getElementById('login-error').textContent = 'Email ou senha inválidos.';
                        document.getElementById('login-error').style.display = 'block';
                    }
                } catch (error) {
                    console.error('Erro na requisição de login:', error);
                    document.getElementById('login-error').textContent = 'Erro de conexão.';
                    document.getElementById('login-error').style.display = 'block';
                }
            });
        });

    fetch('html/registerpage.html')
    .then(response => response.text())
    .then(data => {
        registerContainer.innerHTML = data;

        const backToLogin = document.getElementById('back-to-login');
        const registerButton = document.getElementById('register-button');

        backToLogin.addEventListener('click', () => {
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'flex';
            document.getElementById('register-error').style.display = 'none';
        });

        registerButton.addEventListener('click', async () => {
            const newUsername = document.getElementById('new-username').value;
            const newPassword = document.getElementById('new-password').value;
            const newEmail = document.getElementById('new-email').value;

            const errorBox = document.getElementById('register-error');
            errorBox.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: newUsername,
                        email: newEmail,
                        password: newPassword
                    })
                });

                if (response.ok) {
                    // Registro bem-sucedido: retorna para a tela de login
                    
                    // Esconde a tela de registro
                    registerContainer.style.display = 'none';
                    
                    // Mostra a tela de login
                    loginContainer.style.display = 'flex';

                    // Exibe uma mensagem de sucesso temporária na tela de login
                    const loginErrorElement = document.getElementById('login-error');
                    if (loginErrorElement) {
                        loginErrorElement.textContent = 'Usuário registrado com sucesso! Faça o login.';
                        loginErrorElement.style.color = 'green'; // Muda a cor para verde para indicar sucesso
                        loginErrorElement.style.display = 'block';

                        // Opcional: faz a mensagem de sucesso desaparecer após alguns segundos
                        setTimeout(() => {
                           if(loginErrorElement.textContent === 'Usuário registrado com sucesso! Faça o login.'){
                                loginErrorElement.style.display = 'none';
                                loginErrorElement.style.color = ''; // Reseta a cor
                           }
                        }, 5000); // 5 segundos
                    }

                } else if (response.status === 409) {
                    errorBox.textContent = 'Este e-mail já está em uso.';
                    errorBox.style.display = 'block';
                } else {
                    const errorData = await response.text();
                    errorBox.textContent = `Erro ao registrar: ${errorData}`;
                    errorBox.style.display = 'block';
                }
            } catch (error) {
                console.error('Erro na requisição de registro:', error);
                errorBox.textContent = 'Erro de conexão com o servidor.';
                errorBox.style.display = 'block';
            }
        });
    });

    updateView();
});