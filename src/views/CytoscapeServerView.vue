<script setup>
import { ref } from 'vue'

const selectedLayout = ref('preset')


</script>

<template>
    <header class="header">
    <div>
        <router-link to="/">Go to Home</router-link> |        
        <router-link to="/cytosnap">Go to Cytosnap</router-link> |
        <router-link to="/cytoscape-server">Go to Cytoscape Server</router-link>
    </div>
    <label for="network">Network: </label>
    <select name="Network" id="selectNetwork" @change="getNetwork">
      <option value="genemania">genemania (200)</option>
      <option value="genemania-default">genemania-default (600)</option>
      <option value="gal-filtered">gal-filtered (700)</option>
      <option value="affinity-purification">affinity purification (1400)</option>
      <option value="updated_affinity_purification_concentric_communities">affinity purification communities</option>
      <option value="wgcna-modules">wgcna-modules (6000)</option>
      <option value="tgca">tgca collorectal cancer (6400)</option>
      <option value="updated_tgca_2">tgca rebuild (6400)</option>
      <option value="updated_tgca_blocks">tgca blocks</option>
      <option value="updated_tgca_spheric_aggregates">tgca spheric</option>
      <option value="updated_tgca_concentric_communities">tgca communities</option>
      <option value="nba-10">nb-groups (10000)</option>
      <option value="nba-20">nb-groups (20000)</option>
    </select>

    <label for="layout">Layout: </label>
    <select v-model="selectedLayout" @change="changeLayout">
      <option value="preset">preset</option>
      <option value="null">null</option>
      <option value="random">random</option>
      <option value="grid">grid</option>
      <option value="circle">circle</option>
      <option value="concentric">concentric</option>
      <option value="breadthfirst">breadthfirst</option>
      <option value="dagre">dagre</option>
      <option value="klay">klay</option>
      <option value="cose">cose</option>
      <option value="cose-bilkent">cose-bilkent</option>
      <option value="cola">cola</option>
      <option value="euler">euler</option>
      <option value="spread">spread</option>           
    </select>
  </header>

  <div id="cy"></div>
</template>


<style scoped>
.header {  
  position: absolute;
  top: 0;
  right: 20px;
  padding: 10px; 
}


#cy {
  width: 100%;
  height: 90%;
  position: absolute;
  top: 70px;
  left: 0;
}</style>
