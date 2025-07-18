import { createRouter, createWebHistory } from 'vue-router';

import GraphQL from './views/GraphQL.vue';
import Login from './views/Login.vue';
import NotFound from './views/NotFound.vue';
import Signup from './views/Signup.vue';

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/login', component: Login, name: 'login' },
		{ path: '/signup', component: Signup, name: 'signup' },
		{ path: '/graphql', component: GraphQL, name: 'graphQl' },
		{ path: '/:pathMatch(.*)*', component: NotFound },
	],
});
