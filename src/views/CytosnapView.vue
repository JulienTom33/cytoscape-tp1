<script setup> 
</script>

<template> 
    <h1>Maybe later...</h1>
    <div class="links">
        <router-link to="/">Go to Home</router-link> |        
        <router-link to="/cytoscape">Go to Cytoscape</router-link>
    </div>
  </template>  

<style scoped>
.links {
    position: absolute;
    top: 50px;
    left: 50px;
    font-size: 3rem;
}
</style>