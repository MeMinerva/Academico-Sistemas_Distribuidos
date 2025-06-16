<template>
  <div class="modal-container">
    <ul>
      <li>
        <button @click="$emit('option-click', 'new-chat')">Nova Conversa</button>
      </li>
      <li>
        <button @click="$emit('option-click', 'find-user')">Procurar Usuário</button>
      </li>
      <li>
        <button @click="$emit('option-click', 'new-group')">Criar Novo Grupo</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
defineEmits(['option-click']);
</script>

<style scoped>
.modal-container {
  position: absolute;
  top: 110%; /* Posiciona um pouco abaixo do botão */
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  width: 200px;
  padding: 8px 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul li button {
  background: none;
  border: none;
  width: 100%;
  padding: 10px 15px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

ul li button:hover {
  background-color: #f0f0f0;
}
</style>