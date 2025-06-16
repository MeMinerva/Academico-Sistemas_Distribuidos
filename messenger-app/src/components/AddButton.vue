<template>
  <button class="icon-button" @click="$emit('click')">
    <img :src="icon" class="icon" />
    <span class="tooltip-text">{{ tooltip }}</span>
  </button>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  icon: String,
  tooltip: String
})
</script>

<style scoped>
.icon-button {
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
  padding: 0;
}

.icon-button:hover {
  background-color: rgba(0, 0, 0, 0.192);
}

.icon {
  height: 20px;
  width: 20px;
}

.tooltip-text {
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

.icon-button:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
