const API_BASE_URL = 'https://withdrawal-attempt-fabrics-stock.trycloudflare.com'; // Altere se necessário
let AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJuYW1laWQiOiIzIiwibmJmIjoxNzQ4OTY2NjMwLCJleHAiOjE3NDkwNTMwMzAsImlhdCI6MTc0ODk2NjYzMCwiaXNzIjoiV2hhdHNSdXJhbC5TZXJ2ZXIifQ.2t7zKBLJn-h40HBgw972MLYVba-rMg0bIiVv6mMB9Ys"; // Seu token de autenticação
let MEU_USER_ID = null;      // Será extraído do token JWT

document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const wrapper = document.getElementById('wrapper');

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
                alert(JSON.stringify({ email, password }));
                try {
                    const response = await fetch(`${API_BASE_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'authentication': `bearer ${AUTH_TOKEN}`,
                        
                    },
                    body: JSON.stringify({ email, password })
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
                            'authentication': `bearer ${AUTH_TOKEN}`
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
                        errorBox.textContent = 'Usuário já existe.';
                        errorBox.style.display = 'block';
                    } else {
                        errorBox.textContent = 'Erro ao registrar.';
                        errorBox.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Erro na requisição de registro:', error);
                    errorBox.textContent = 'Erro de conexão com o servidor.';
                    errorBox.style.display = 'block';
                }
            });
        });
});
