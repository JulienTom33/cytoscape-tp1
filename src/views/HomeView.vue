<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
    <div style="font-size: 2em; display: flex; border: 1px dashed black; border-radius: 5px; background-color: antiquewhite; padding: 10px;">
      <router-link to="/">Go to Home</router-link> 
      <router-link to="/cytoscape">Go to Cytoscape</router-link>
      <router-link to="/cytosnap">Go to Cytosnap</router-link>  
      <router-link to="/cytoscape-server">Go to CytoscapeServer</router-link> 
    </div>
    
</template>