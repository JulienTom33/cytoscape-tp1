<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import euler from 'cytoscape-euler';

cytoscape.use(coseBilkent)
cytoscape.use(euler)

const selectedLayout = ref('preset')

const cyContainer = ref(null);

onMounted(async () => {
  try {
    const data = await fetchGraphData();
    console.log(data)
    initializeCytoscape(data);
  } catch (error) {
    console.error(error);
  }
});

async function fetchGraphData() {
  try {
    const response = await fetch('http://localhost:3000/api/graph');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    throw error;
  }
}

function initializeCytoscape(data) {
  cytoscape({
    container: cyContainer.value,
    elements: data,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#ff5733',
          label: 'data(label)',
        },
      },
    ],
    layout: {
      name: 'preset',
    },
  });
}

</script>

<template>
    <header class="header">
    <div>
        <router-link to="/">Go to Home</router-link> |        
        <router-link to="/cytosnap">Go to Cytosnap</router-link> |
        <router-link to="/cytoscape">Go to Cytoscape</router-link>
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
  <div ref="cyContainer" id="cy"></div>
  <!-- <div id="cy"></div> -->
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
