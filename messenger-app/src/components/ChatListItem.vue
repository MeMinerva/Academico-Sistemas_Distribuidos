<template>
  <div class="item-container">
    <div class="profile-icon"></div>
    <div class="item-info-container">
      <div class="item-info">
        <h1>{{ userName }}</h1>
        <p>{{ lastMessageTime }}</p>
      </div>
      <div class="last-message">
        <p>{{ lastMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  userName: {
    type: String,
    required: true
  },
  lastMessage: {
    type: String,
    required: true
  },
  lastMessageTime: {
    type: String,
    required: true
  }
})
</script>

<style>
.item-container {
  display: flex;
  height: 75px;
  background-color: brown;
  width: 100%;
}

.profile-icon {
  width: 75px;
  height: 75px; 
  background-color: aqua;
  flex-shrink: 0; 
}

.item-info-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.item-info {
  display: flex;
  justify-content: space-between;
  background-color: green;
}

.last-message {
  background-color: blueviolet;
}
</style>
