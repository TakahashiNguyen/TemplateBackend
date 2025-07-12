import ChangePasswordView from '@/views/ChangePassword.vue';
import EmployeeSignUpView from '@/views/EmployeeSignUpView.vue';
import EnterpriseAssignView from '@/views/EnterpriseAssignView.vue';
import EventAssignView from '@/views/EventAssignView.vue';
import EventUpdateView from '@/views/EventUpdateView.vue';
import FacultyAssignView from '@/views/FacultyAssignView.vue';
import FrontPageView from '@/views/FrontPageView.vue';
import GraphQLView from '@/views/GraphQLView.vue';
import LoginView from '@/views/LoginView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/login', component: LoginView },
		{ path: '/enterprise/assign', component: EnterpriseAssignView },
		{ path: '/employee/signup', component: EmployeeSignUpView },
		{ path: '/change-password/:signature', component: ChangePasswordView },
		{ path: '/faculty/assign', component: FacultyAssignView },
		{ path: '/event/assign', component: EventAssignView },
		{ path: '/event/update', component: EventUpdateView },
		{ path: '/', component: FrontPageView },
		{ path: '/graphql', component: GraphQLView },
		{ path: '/:pathMatch(.*)*', component: NotFoundView },
	],
});
export default router;
