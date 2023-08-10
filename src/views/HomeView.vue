<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
    <div style="font-size: 2em; display: flex; border: 1px dashed black; border-radius: 5px; background-color: antiquewhite; padding: 10px;">
      <router-link to="/">Go to Home</router-link> 
      <router-link to="https://cytoscape-tp1.vercel.app/cytoscape">Go to Cytoscape</router-link>
      <router-link to="https://cytoscape-tp1.vercel.app/cytosnap">Go to Cytosnap</router-link>  
      <router-link to="https://cytoscape-tp1.vercel.app/cytoscape-server">Go to CytoscapeServer</router-link> 
    </div>
    
</template>