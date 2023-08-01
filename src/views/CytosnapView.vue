<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios';

const getAllFiles = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/files/');
    const files = response.data; 
    // console.log(files);
  } catch (error) {
    console.error(error);
  }
};

const changeLayout = () => {
  loadGraphImage(selectedLayout);
};

const graphImage = ref('');

const zoomLevel = ref(100); 
const maxZoomLevel = 500; 
const minZoomLevel = 20;

const getNetwork = async () => {
  loadGraphImage();
};

const loadGraphImage = async () => {
  try {
    const selectElement = document.getElementById('selectNetwork');
    const selectedValue = selectElement.value;   
    const response = await axios.get(`http://localhost:3000/api/files_img/${selectedValue}`, { responseType: 'arraybuffer' });    
    const blob = new Blob([response.data], { type: 'image/png' });
    graphImage.value = URL.createObjectURL(blob);
    // console.log(graphImage.value);   
  } catch (error) {
    console.error('Erreur lors du chargement de l\'image du graphe :', error);
  }
};

const handleMouseWheel = (event) => { 
  event.preventDefault(); 
  
  const delta = event.deltaY; 
  zoomLevel.value += delta > 0 ? -10 : 10;

  if (zoomLevel.value > maxZoomLevel) zoomLevel.value = maxZoomLevel;
  if (zoomLevel.value < minZoomLevel) zoomLevel.value = minZoomLevel;
};

const zoomStyle = computed(() => ({
  transform: `scale(${zoomLevel.value / 100})`,
}));


onMounted(async ()=>{  
    loadGraphImage(); 
    getAllFiles()      
  }); 

</script>


<template>    
    <header class="header">
      <div>
          <router-link to="/">Go to Home</router-link> |        
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
  
      <!-- <label for="layout">Layout: </label>
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
      </select> -->
    </header> 
    
 <div @wheel="handleMouseWheel">
      <img :src="graphImage" alt="Graph" :style="zoomStyle" class="graphImage" />
      <div id="cy"></div>
    </div>

    
  </template>

<style scoped>
.header {  
  position: absolute;
  top: 0;
  right: 20px;
  padding: 10px; 
}

.graphImage {
  width: 60vw;
  height: 60vh; 
  /* width: 70%;
  height: 70%;
  position: absolute;
  top: 70px;
  left: 0; */
}

#cy {
  width: 100%;
  height: 90%;
  position: absolute;
  top: 70px;
  left: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 20px;
}
</style>