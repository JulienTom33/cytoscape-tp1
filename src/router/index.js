import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Cytosnap from '../views/CytosnapView.vue'
import Cytoscape from '../views/CytoscapeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/cytosnap',
      name: 'cytosnap',
      component: Cytosnap
    },
    {
      path: '/cytoscape',
      name: 'cytoscape',
      component: Cytoscape
    }   
  ]
})

export default router
