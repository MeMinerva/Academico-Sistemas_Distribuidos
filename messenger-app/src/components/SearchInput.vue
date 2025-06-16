<style scoped>
.form {
  --border-color: #ff00d4;
  --border-height: 2px;
  --timing: 0.3s;

  position: relative;
  display: flex;
  align-items: center;
  height: 30px;
  padding-inline: 0.8em;
  background: #fff;
  border-radius: 5px;
  overflow: hidden; /* para garantir que a linha fique dentro do border-radius */
}

.form button {
  border: none;
  background: none;
  color: #8b8ba7;
  padding: 0;
}

.input {
  font-size: 0.9rem;
  background-color: transparent;
  width: 100%;
  height: 100%;
  padding-inline: 0.5em;
  border: none;
}

.input:focus {
  outline: none;
}

.form::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: var(--border-height);
  background: var(--border-color);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform var(--timing) ease;
}

.form:focus-within::after {
  transform: scaleX(1);
}

.input:not(:placeholder-shown) ~ .reset {
  opacity: 1;
  visibility: visible;
}

.form svg {
  width: 17px;
  height: 17px;
}
</style>



<template>
  <form class="form">
        <button>
            <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </button>
        <input class="input" placeholder="Type your text" type="text">

    </form>
</template>

