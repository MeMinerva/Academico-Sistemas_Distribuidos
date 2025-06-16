<template>
  <div class="login-page">
    <h2>Login</h2>
    <input v-model="username" placeholder="Usuário" />
    <input v-model="password" placeholder="Senha" type="password" />
    <button @click="doLogin">Entrar</button>
    <p>
      Ainda não tem conta?
      <a href="#" @click.prevent="$emit('switchToRegister')">Registre aqui!</a>
    </p>
  </div>
</template>

<script>
const API_URL = "http://rpc.pedrohdncorrea.com.br"

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async doLogin() {
      if (!this.username || !this.password) {
        alert('Por favor, preencha usuário e senha.')
        return
      }

      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.username,
            password: this.password
          })
        })

        if (!response.ok) {
          throw new Error(`Erro ao fazer login: ${response.statusText}`)
        }

        const data = await response.json()
        if (data.token) {
          this.$emit('login', data.token)
        } else {
          alert('Login falhou: token não recebido.')
        }

      } catch (error) {
        console.error(error)
        alert(`Login falhou: ${error.message}`)
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
  margin: 100px auto;
}

input {
  padding: 8px;
}

button {
  padding: 8px;
}

p {
  font-size: 14px;
}

a {
  color: #007BFF;
  cursor: pointer;
  text-decoration: underline;
}
</style>
