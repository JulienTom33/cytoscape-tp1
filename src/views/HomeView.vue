<script setup>
import cytoscape from 'cytoscape';
import { onMounted, ref } from 'vue';
import axios from 'axios'
import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';
import cola from 'cytoscape-cola';
import euler from 'cytoscape-euler';
import spread from 'cytoscape-spread'
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use( dagre );
cytoscape.use(klay)
cytoscape.use(cola)
cytoscape.use(euler)
cytoscape.use(spread)
cytoscape.use( coseBilkent );

const getAllFiles = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/files/');
    const files = response.data; 
    // console.log(files);
  } catch (error) {
    console.error(error);
  }
};

const getNetwork = async () => {
  drawGraph();
};

const graphElements = (response) => {
  const data = response.data;
  let nodes = [];
  let edges = [];
  if (data.nodes && data.edges) {
    nodes = data.nodes;
    edges = data.edges;
  } else if (data.elements && Array.isArray(data.elements)) {  
    nodes = data.elements.filter((element) => element.group === 'nodes');
    edges = data.elements.filter((element) => element.group === 'edges');
  } else if (data.elements && data.elements.nodes && data.elements.edges) {
    nodes = data.elements.nodes;
    edges = data.elements.edges;
  }
  return { nodes, edges };
};

const drawGraph = async () => {
  try {

    const selectElement = document.getElementById('selectNetwork');
    const selectedValue = selectElement.value;

    const response = await axios.get(`http://localhost:3000/api/files/${selectedValue}`)
    const graphData = response.data.elements;
    console.log(graphData)  

    const { nodes, edges } = graphElements(response);
    const cy = cytoscape({
      container: document.getElementById('cy'),
      boxSelectionEnabled: false,
      autounselectify: true,
      style: cytoscape
        .stylesheet()
        .selector('node')
        .css({   
          label: 'data(label)',
          'background-color': 'gray',
          'background-image': [            
            'src/assets/Instagram_icon.png'           
          ],
          'background-fit': 'cover cover',
          'background-image-opacity': 0.8        
        })
        .selector('edge')
        .css({       
           'line-color': 'green',
           'curve-style' : 'haystack' 

        }),
        elements: {  
          nodes,
          edges,      

        },
        layout: {
          name: selectedLayout.value     
        },
      });
      
  } catch (error) {
    console.error(error);
  }
};

const selectedLayout = ref('preset')

const changeLayout = () => {
  drawGraph()
}

onMounted(()=>{
  drawGraph()
  getAllFiles()  
})

</script>

<template>
  <header class="header">
    <label for="network">Network: </label>
    <select name="Network" id="selectNetwork" @change="getNetwork">
      <option value="genemania">genemania (200)</option>
      <option value="genemania-default">genemania-default (600)</option>
      <option value="gal-filtered">gal-filtered (700)</option>
      <option value="affinity-purification">affinity purification (1400)</option>
      <option value="wgcna-modules">wgcna-modules (6000)</option>
      <option value="tgca">tgca collorectal cancer (6400)</option>
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
      <option value="springy">springy</option>
      <option value="arbor">arbor</option>
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
}
</style>
