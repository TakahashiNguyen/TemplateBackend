import 'material-symbols';
import { createApp } from 'vue';

import App from './App.vue';
import { router } from './router';
// @ts-expect-error error-free expression
import './style.css';

createApp(App).use(router).mount('#app');
