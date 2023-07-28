import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ForceGraph from '../views/ForceGraphView.vue'
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
      path: '/forcegraph',
      name: 'forcegraph',
      component: ForceGraph
    },
    {
      path: '/cytoscape',
      name: 'cytoscape',
      component: Cytoscape
    }   
  ]
})

export default router
