<template>
  <button
    :disabled="disabled"
    :type="htmlType"
    :aria-label="ariaLabel"
    :title="title"
    @click="handleClick"
  >
    <!-- Ícone antes do texto -->
    <img v-if="icon && iconPosition === 'left'" :src="icon" alt="" aria-hidden="true" />
    
    <slot>Botão</slot>
    
    <!-- Ícone depois do texto -->
    <img v-if="icon && iconPosition === 'right'" :src="icon" alt="" aria-hidden="true" />
  </button>
</template>


<style scoped>
img {
  width: 17px;
  height: 17px;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>

<script>
export default {
  name: 'GenericButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    htmlType: {
      type: String,
      default: 'button',
      validator: value => ['button', 'submit', 'reset'].includes(value),
    },
    ariaLabel: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
      description: 'URL ou caminho do ícone/imagem que será exibido no botão',
    },
    iconPosition: {
      type: String,
      default: 'left',
      validator: value => ['left', 'right'].includes(value),
      description: 'Posição do ícone: "left" (antes do texto) ou "right" (depois do texto)',
    },
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event);
      }
    },
  },
};
</script>
