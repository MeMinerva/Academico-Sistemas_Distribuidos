<template>
  <div id="app">
    <WindowControls />

    <template v-if="!loggedIn">
      <LoginPage 
        v-if="mode === 'login'" 
        @login="handleLogin" 
        @switchToRegister="mode = 'register'" 
      />
      <RegisterPage 
        v-else 
        @register="handleLogin" 
        @switchToLogin="mode = 'login'" 
      />
    </template>

    <MainPage 
      v-else 
      @logout="handleLogout" 
    />
  </div>
</template>

<script setup>
import { provide, ref, computed } from 'vue'
import WindowControls from '@/components/WindowControls.vue'
import LoginPage from './components/LoginPage.vue'
import RegisterPage from './components/RegisterPage.vue'
import MainPage from './components/MainPage.vue'

// token reativo
const token = ref(localStorage.getItem('authToken'))

// fornecer token para toda a árvore
provide('token', token)

// modo login/register
const mode = ref('login')

// loggedIn dinâmico
const loggedIn = computed(() => !!token.value)

// métodos
function handleLogin(tokenFromBackend) {
  token.value = tokenFromBackend
  localStorage.setItem('authToken', tokenFromBackend)
}

function handleLogout() {
  console.log('Deslogando token:', token.value)
  token.value = null
  localStorage.removeItem('authToken')
  mode.value = 'login'
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

#app {
  background: radial-gradient(circle at 10% 50%, #ffe1ed, #afd2ff);
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.title-bar {
  height: 32px;
  background-color: var(--vscode-titleBar-activeBackground);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
}

.window-controls button {
  -webkit-app-region: no-drag;
}
</style>
