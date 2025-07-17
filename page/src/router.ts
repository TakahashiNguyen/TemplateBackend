import { createRouter, createWebHistory } from 'vue-router';

import GraphQLView from './views/GraphQLView.vue';
import Login from './views/Login.vue';
import NotFound from './views/NotFound.vue';
import Signup from './views/Signup.vue';

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/login', component: Login },
		{ path: '/signup', component: Signup },
		{ path: '/graphql', component: GraphQLView },
		{ path: '/:pathMatch(.*)*', component: NotFound },
	],
});
