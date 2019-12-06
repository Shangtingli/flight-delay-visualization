import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/map',
        name: 'map',
        component: () => import(/* webpackChunkName: "about" */ '../views/MapView.vue')

    },
    {
        path: '/summary',
        name: 'summary',
        component: () => import(/* webpackChunkName: "about" */ '../views/SummaryView.vue')

    },
    {
        path: '/suggestion',
        name: 'suggestion',
        component: () => import(/* webpackChunkName: "about" */ '../views/SuggestionView.vue')

    },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
