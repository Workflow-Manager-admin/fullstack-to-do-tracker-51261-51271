import { createRouter, createWebHistory } from 'vue-router'

const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const AboutView = () => import('../views/AboutView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { 
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/:catchAll(.*)', redirect: '/dashboard' }
  ],
})

// PUBLIC_INTERFACE
router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuth) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && isAuth) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
