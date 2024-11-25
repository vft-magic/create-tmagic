import { createRouter, createWebHashHistory } from 'vue-router';

import Editor from './pages/Editor.vue';

const routes = [
  { path: '/', component: Editor },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
