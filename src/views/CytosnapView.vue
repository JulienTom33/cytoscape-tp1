<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios';
let scale = 1;
let pointX = 0;
let pointY = 0;

const zoom = ref(null); // Référence à l'élément de zoom

const setTransform = () => {
  zoom.value.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
};

const handleMouseDown = (e) => {
  e.preventDefault();
  const start = { x: e.clientX - pointX, y: e.clientY - pointY };
  const handleMouseMove = (e) => {
    e.preventDefault();
    pointX = (e.clientX - start.x);
    pointY = (e.clientY - start.y);
    setTransform();
  };
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', handleMouseMove);
  }, { once: true });
};

const handleWheel = (e) => {
  e.preventDefault();
  const offsetX = e.clientX - pointX;
  const offsetY = e.clientY - pointY;
  const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
  const direction = delta > 0 ? 1 : -1;
  const factor = (direction === 1 ? 1.2 : 0.8);
  scale *= factor;
  pointX -= offsetX * (factor - 1);
  pointY -= offsetY * (factor - 1);
  setTransform();
  };





const getAllFiles = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/files/');
    const files = response.data; 
    // console.log(files);
  } catch (error) {
    console.error(error);
  }
};

const graphImage = ref(null);


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




onMounted(async ()=>{   
  await loadGraphImage(); 
  getAllFiles()      
  }); 

</script>

<template>    
    <header class="header">
      <div>
          <router-link to="/">Go to Home</router-link> |        
          <router-link to="/cytoscape">Go to Cytoscape</router-link> |
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
        <option value="updated_affinity_purification_communities_spheres">purif_diago</option>
      <option value="updated_affinity_purification_communities_spheres">purif_louvain_spheres</option>
      </select>      
    </header> 

    <div ref="zoom" @mousedown="handleMouseDown" @wheel="handleWheel">
  <img :src="graphImage" alt="Graph" class="graphImage" />
</div>


  </template>

<style scoped>
/* Styles pour l'élément zoomable */


/* Vos autres styles */
.header {  
  position: absolute;
  top: 0;
  right: 0px;
  padding: 10px; 
}

.graphImage {
  width: 100%;
  height: 100%;  
}

#cy {
  width: 100%;
  height: 100%;
  position: 50% 50%;
  top: 0px;
  left: 0;
}
* {
  padding: 0;
  margin: 0;
  outline: 0;
  overflow: hidden;
}
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#zoom {
  width: 100%;
  height: 100%;
  transform-origin: 0px 0px;
  transition: 0.25s;
  cursor: grab;
}
div#zoom > img {
  width: 100%;
  height: auto;
}

</style>
