document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o formulário pelo ID
    const formNovaConversa = document.getElementById('form-nova-conversa');

    // Adiciona o "escutador" de evento ao formulário, não ao botão.
    // Isso permite capturar o envio tanto pelo clique no botão quanto pela tecla "Enter".
    formNovaConversa.addEventListener('submit', async (event) => {
        // 1. Previne o comportamento padrão do formulário (que é recarregar a página)
        event.preventDefault();

        // 2. Seleciona os campos e obtém seus valores
        const emailContato = document.getElementById('email-contato').value;
        const mensagem = document.getElementById('input-mensagem').value;

        // 3. (Opcional, mas recomendado) Validação simples para garantir que os campos não estão vazios
        if (!emailContato.trim() || !mensagem.trim()) {
            alert('Por favor, preencha todos os campos.');
            return; // Interrompe a execução se a validação falhar
        }

        // 4. Monta o objeto de dados que será enviado no corpo da requisição
        const dados = {
            email: emailContato,
            mensagem: mensagem
        };

        // 5. Bloco try...catch para lidar com erros de rede ou da requisição
        try {
            // Exibe um feedback para o usuário (opcional)
            console.log('Enviando dados:', dados);
            alert('Enviando sua mensagem...');

            // 6. Realiza a requisição POST usando a API fetch
            const response = await fetch(`http://192.168.74.85:8000/user?email=${emailContato}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authentication': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJuYW1laWQiOiIzIiwibmJmIjoxNzQ4OTY2NjMwLCJleHAiOjE3NDkwNTMwMzAsImlhdCI6MTc0ODk2NjYzMCwiaXNzIjoiV2hhdHNSdXJhbC5TZXJ2ZXIifQ.2t7zKBLJn-h40HBgw972MLYVba-rMg0bIiVv6mMB9Ys'
                },
            });

            // 7. Verifica se a requisição foi bem-sucedida (status HTTP 2xx)
            if (response.ok) {
                const resultado = await response.json(); // Tenta converter a resposta para JSON
                console.log('Resposta do servidor:', resultado);
                alert('Mensagem enviada com sucesso!');
                
                // Opcional: Limpa o formulário após o envio bem-sucedido
                formNovaConversa.reset(); 
            } else {
                // Se a resposta não foi 'ok', lança um erro para ser pego pelo catch
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }

        } catch (error) {
            // 8. Captura e exibe erros que possam ocorrer durante o processo
            console.error('Falha ao enviar a conversa:', error);
            alert('Ocorreu um erro ao tentar enviar a mensagem. Por favor, tente novamente.');
        }
    });
});