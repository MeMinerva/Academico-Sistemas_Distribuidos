<template>
  <div class="container">
    <div id="side-bar">
      <GenericButton :icon="chatIcon" iconPosition="left" class="side-button"
        :class="{ 'active-button': selected === 'chats' }" @click="selected = 'chats'">
        Conversas
      </GenericButton>

      <GenericButton :icon="groupIcon" iconPosition="left" class="side-button"
        :class="{ 'active-button': selected === 'groups' }" @click="selected = 'groups'">
        Grupos
      </GenericButton>

      <GenericButton @click="select('about')">Sobre</GenericButton>

      <GenericButton class="side-button" @click="handleLogout">Sair</GenericButton>
    </div>

    <div id="main-content">
      <div id="chat-list">
        <div v-if="selected === null">
          <p>Selecione uma opção para começar</p>
        </div>

        <div v-if="selected === 'chats'"
          style="width: 100%; margin:0px; gap: 10px; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin:0px">
            <h1>Conversas</h1>
            <AddButton :icon="plusIcon" tooltip="Adicionar novo chat" @click="handleAdd" />
          </div>
          <SearchInput />
          <div>
            <ChatListItem v-for="(chatItem, index) in chatList" :key="index" :userName="chatItem.name"
              :lastMessage="chatItem.last_message ? chatItem.last_message : ''"
              :lastMessageTime="chatItem.last_message ? chatItem.last_message.timestamp : ''" />

          </div>
        </div>

        <div v-if="selected === 'groups'"
          style="width: 100%; margin:0px; gap: 10px; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin:0px">
            <h1>Grupos</h1>
            <AddButton :icon="plusIcon" tooltip="Criar novo grupo" @click="handleAdd" />
          </div>
          <SearchInput />
        </div>

        <div v-if="selected === 'about'">
          <p>Você selecionou <strong>Sobre</strong>.</p>
          <hr />
        </div>
      </div>

      <div id="chat-area">
        <div v-if="chat === null"
          style="display: flex; justify-content:center; align-items: center; flex-direction: column;">
          <img id="gif" :src="gif" />
          <h2 style="margin-bottom: 0; color: rgb(70, 70, 70);">✨ Aplicativo de mensagens ✨</h2>
          <p style="margin-top: 0; color: rgb(150, 150, 150)">
            <b>By: Pedrinho</b> e Maria <b>(Minerva)</b> Eduarda
          </p>
          <p style="margin-bottom: 5px; font-size: smaller; color: rgb(150, 150, 150); position: fixed; bottom: 0;">
            Para mais informações, acesse o 'Sobre'!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const API_URL = "http://rpc.pedrohdncorrea.com.br"
/* global defineEmits */

import SearchInput from './SearchInput.vue'
import GenericButton from '@/components/GenericButton.vue'
import AddButton from '@/components/AddButton.vue'
import ChatListItem from './ChatListItem.vue'
import groupIcon from '@/assets/group.svg'
import chatIcon from '@/assets/chat.svg'
import plusIcon from '@/assets/plus.svg'
import gif from '@/assets/sailor.gif'

const emit = defineEmits(['logout'])

import { ref, inject, onMounted, onUnmounted } from 'vue'


const selected = ref('chats')
const chat = ref(null)
const chatList = ref([])

// Pega o token do provide/inject
const token = inject('token')

async function getChatList() {
  try {
    console.log("Buscando chats...")
    const response = await fetch(`${API_URL}/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`  // token é um ref
      }
    })
    if (!response.ok) throw new Error('Erro ao buscar chats')

    const data = await response.json()
    chatList.value = data
    console.log(chatList.value)
  } catch (error) {
    console.error('Erro:', error)
    chatList.value = []
  }
}

function select(option) {
  selected.value = option
  if (option === "chats") {
    getChatList()
  }
}

onMounted(() => {
  getChatList()
  const interval = setInterval(getChatList, 5000) // atualiza a cada 5 segundos

  onUnmounted(() => {
    clearInterval(interval)
  })
})

function handleAdd() {
  // Sua lógica para adicionar chat ou grupo
}

function handleLogout() {
  localStorage.removeItem('authToken')
  emit('logout')
}
</script>


<style>
:root {
  --color-cinza-1: #bccfe600;
  --color-cinza-2: #bebebe;
}

.container {
  display: flex;
}

#side-bar {
  display: flex;
  flex-direction: column;
  width: 140px;
  height: 100vh;
  position: fixed;
  padding: 5px;
  gap: 5px;
  left: 0;
}

#main-content {
  display: flex;
  height: 100vh;
  margin-left: 150px;
  width: calc(100vw - 140px);
  box-shadow: rgba(0, 0, 0, 0.178) 0px 2px 4px;
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
}

#chat-list {
  padding: 25px;
  display: flex;
  flex-direction: column;
  width: 30vw;
  height: 100vh;
  background-color: rgba(242, 243, 243, 0.541);
  backdrop-filter: blur(10px);
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
  border: solid 1px var(--color-cinza-2);
}

#chat-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70vw;
  height: 100vh;
  background-color: rgb(218, 218, 218);
  border: solid 1px var(--color-cinza-2);
}

#gif {
  width: 300px;
  height: 300px;
  border-radius: 10px;
}

h1 {
  font-size: 20px;
  margin: 0;
}

.side-button {
  position: relative;
  border: none;
  width: 100%;
  height: 30px;
  background-color: var(--color-cinza-1);
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  padding-left: 10px;
  transition: background-color 0.2s;
}

.side-button:hover {
  background-color: #00000015;
}

.side-button::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background-color: #ff009d;
  border-radius: 2px;
  transition: height 200ms ease, top 200ms ease;
}

.active-button {
  background-color: #00000015;
}

.active-button::before {
  height: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.plus-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.103);
}

.plus-button:hover {
  background-color: rgba(0, 0, 0, 0.192);
}

#plus-button-icon {
  height: 20px;
  width: 20px;
}

.plus-button .tooltip-text {
  visibility: hidden;
  opacity: 0;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 5px 8px;
  position: absolute;
  z-index: 1;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  transition: opacity 0.3s;
}

.plus-button:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
