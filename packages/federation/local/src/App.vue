<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import RemoteApp from 'remote_app/App';
import { add } from 'remote_app/utils';
import { defineAsyncComponent } from 'vue';

const AsyncRemoteButton = defineAsyncComponent(
  () => import('remote_app/Button')
);
const data: number = add(1, 2);
</script>

<template>
  <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
  <HelloWorld msg="Vite + Vue" />
  <RemoteApp />
  <AsyncRemoteButton />
  <p>应用 2 工具函数计算结果: 1 + 2 = {{ data }}</p>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
