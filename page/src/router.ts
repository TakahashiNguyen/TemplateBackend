import ChangePasswordView from '@/views/ChangePassword.vue';
import FrontPageView from '@/views/FrontPageView.vue';
import GraphQLView from '@/views/GraphQLView.vue';
import LoginView from '@/views/Login.vue';
import NotFoundView from '@/views/NotFound.vue';
import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/login', component: LoginView },
		{ path: '/change-password/:signature', component: ChangePasswordView },
		{ path: '/', component: FrontPageView },
		{ path: '/graphql', component: GraphQLView },
		{ path: '/:pathMatch(.*)*', component: NotFoundView },
	],
});
