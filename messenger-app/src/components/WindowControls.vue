<template>
  <div class="title-bar">
  <div class="title">
    <p>🐧</p>
    <h1>App de mensagens</h1>
  </div>
    <div style="display: flex; justify-content: center; align-items: center;">    
      
    <button @click="minimize">–</button>
    <button @click="close" >✖︎</button></div>

  </div>
</template>

<script setup>
// Se estiver com nodeIntegration ativado:
const { ipcRenderer } = window.require('electron')

function close() {
  ipcRenderer.send('window-close')
}

function minimize() {
  ipcRenderer.send('window-minimize')
}
</script>

<style scoped>
.title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 10px;
  justify-content: center;
}

.title p {
  font-size: 20px;
  color: black; /* cor do tema */
  -webkit-user-select: none; /* previne seleção de texto */
}
.title h1{
  font-size: 12px;
  font-weight: normal; /* normaliza o peso da fonte */
  /* font-weight: bold; */
  color: black; /* cor do tema */
  -webkit-user-select: none; /* previne seleção de texto */
}

.title-bar {
  display: flex;
  height: 25px;
  /* justify-content: flex-end; */
  gap: 10px;
  padding: 5px;
  background: transparent;
  -webkit-user-select: none;
  -webkit-app-region: drag; /* permite arrastar a janela */
}
button {
  -webkit-app-region: no-drag; /* botões não devem arrastar */
  background: transparent;
  cursor: pointer;
  border: none;
  color: aliceblue;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.25); /* exemplo de sombra */
}


button:hover {
  color:brown
}
</style>
