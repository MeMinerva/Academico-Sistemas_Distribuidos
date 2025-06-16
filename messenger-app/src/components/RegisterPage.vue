<template>
  <div class="register-page">
    <h2>Registro</h2>
    <input v-model="name" placeholder="Nome" />
    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Senha" type="password" />
    <input v-model="confirmPassword" placeholder="Confirmar Senha" type="password" />
    <button @click="doRegister">Registrar</button>
    <p>
      Já tem conta?
      <a href="#" @click.prevent="$emit('switchToLogin')">Entrar</a>
    </p>
  </div>
</template>

<script>
const API_URL = "http://rpc.pedrohdncorrea.com.br"

export default {
  name: 'RegisterPage',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    async doRegister() {
      if (!this.name || !this.email || !this.password || !this.confirmPassword) {
        alert('Preencha todos os campos.')
        return
      }
      if (this.password !== this.confirmPassword) {
        alert('As senhas não coincidem.')
        return
      }

      try {
        console.log("registrando...")
        const body = JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password
          })

        console.log(body)
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password
          })
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`Erro no registro: ${text || response.statusText}`)
        }

        const data = await response.json()
        if (data.token) {
          this.$emit('register', data.token)
        } else {
          alert('Registro realizado com sucesso! Agora faça login.')
          this.$emit('switchToLogin')
        }

      } catch (error) {
        console.error(error)
        alert(`Registro falhou: ${error.message}`)
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
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
  text-decoration: underline;
  cursor: pointer;
}
</style>
