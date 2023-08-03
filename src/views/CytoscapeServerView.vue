<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios'
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';
import cola from 'cytoscape-cola';
import euler from 'cytoscape-euler';
import spread from 'cytoscape-spread'
import coseBilkent from 'cytoscape-cose-bilkent';

/* 
cytoscape layouts import
*/
cytoscape.use( dagre )
cytoscape.use(klay)
cytoscape.use(cola)
cytoscape.use(euler)
cytoscape.use(spread)
cytoscape.use(coseBilkent)

cytoscape.warnings(false)

// /* 
// function which load the graph dependaing the layout selected
// */
const selectedLayout = ref('preset')
const changeLayout = () => {
  drawGraph()
}

// /* 
// function to change the network with the select
// */
const getNetwork = async () => {
  drawGraph();
};

// /* 
// Layout options
// */
const layoutOptions = {
  preset: {
    name: 'preset',
    animate: false,
    fit: true,
    animationDuration: 500,

  },
  null: {
    name: 'null',
    animate: false,
    fit: true,
  },
  random: {
    name: 'random',
    animate: false,
    fit: true,
  },
  grid: {
    name: 'grid',
    animate: false,
    fit: true,
    animationDuration: 500,    
    // uses all available space on false, uses minimal space on true
    condense: false,
    // force num of rows in the grid
    rows: 4, 
    // force num of columns in the grid 
    cols: 5, 
  },
  circle: {
    name: 'circle',
    animate: false,
    fit: true,
    // prevents node overlap, may overflow boundingBox and radius if not enough space
    avoidOverlap: true, 
    // Excludes the label when calculating node bounding boxes for the layout algorithm
    nodeDimensionsIncludeLabels: false,
    // the radius of the circle 
    radius: undefined,
    // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false) 
    clockwise: true, 
  },
  concentric: {
    name: 'concentric',
    animate: false,
    fit: true,
    // where nodes start in radians
    startAngle: 3 / 2 * Math.PI, 
    // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
    clockwise: true,
    // whether levels have an equal radial distance betwen them, may cause bounding box overflow 
    equidistant: false,
    // min spacing between outside of nodes (used for radius adjustment) 
    minNodeSpacing: 10, 
    // height of layout area (overrides container height)
    height: undefined, 
    // width of layout area (overrides container width)
    width: undefined, 
  },
  breadthfirst: {
    name: 'breadthfirst',
    animate: false,
    fit: true,
    // whether the tree is directed downwards (or edges can point in any direction if false)
    directed: false, 
    // put depths in concentric circles if true, put depths top down if false
    circle: false, 
    // whether to create an even grid into which the DAG is placed (circle:false only)
    grid: false, 
    // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
    spacingFactor: 1.75, 
    // prevents node overlap, may overflow boundingBox if not enough space
    avoidOverlap: true,
    animationDuration: 500
  },
  dagre: {
    name: 'dagre',
    animate: false,
    fit: true,
  },
  klay: {
    name: 'klay',
    animate: false,
    fit: true,
  },
  cose: {
    name: 'cose',
    animate: false,
    fit: true,
    animationDuration: undefined,
    // Number of iterations between consecutive screen positions update
    refresh: 20,
    // Excludes the label when calculating node bounding boxes for the layout algorithm
    nodeDimensionsIncludeLabels: false,
    // Randomize the initial positions of the nodes (true) or use existing positions (false)
    randomize: false,
    // Extra spacing between components in non-compound graphs
    componentSpacing: 40,
    // Node repulsion (overlapping) multiplier
    nodeOverlap: 4,
    // Maximum number of iterations to perform
    numIter: 1000,
  },
  'cose-bilkent': {
    name: 'cose-bilkent',
    animate: false,
    fit: true,
    padding: 10,
    // 'draft', 'default' or 'proof" 
    // - 'draft' fast cooling rate 
    // - 'default' moderate cooling rate 
    // - "proof" slow cooling rate
    quality: 'default',   
    // number of ticks per frame; higher is faster but more jerky
    refresh: 30,   
    // Whether to enable incremental mode
    randomize: true, 
    // Ideal (intra-graph) edge length
    idealEdgeLength: 50,
    // Divisor to compute edge forces
    edgeElasticity: 0.45,
    // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
    nestingFactor: 0.1,    
    // Maximum number of iterations to perform
    numIter: 2500,
    // Whether to tile disconnected nodes
    tile: true,
    // Type of layout animation. The option set is {'during', 'end', false}
    animate: 'end',
    // Duration for animate:end
    animationDuration: 500,    
  },
  cola: {
    name: 'cola',
    animate: false,
    fit: true,
  },
  euler: {
    name: 'euler',
    animate: true,
    fit: true, 
    // Friction / drag coefficient to make the system stabilise over time
    dragCoeff: 0.02,
    // Whether to randomize the initial positions of the nodes
    // true : Use random positions within the bounding box
    // false : Use the current node positions as the initial positions
    randomize: false,
    // The amount of time passed per tick
    // - Larger values result in faster runtimes but might spread things out too far
    // - Smaller values produce more accurate results
    timeStep: 10,
    // The number of ticks per frame for animate:true
    // - A larger value reduces rendering cost but can be jerky
    // - A smaller value increases rendering cost but is smoother
    refresh: 10,
    // Maximum iterations and time (in ms) before the layout will bail out
    // - A large value may allow for a better result
    // - A small value may make the layout end prematurely
    // - The layout may stop before this if it has settled
    maxIterations: 2000,
    maxSimulationTime: 7000,
    // Prevent the user grabbing nodes during the layout (usually with animate:true)
    ungrabifyWhileSimulating: false,
  },
  spread: {
    name: 'spread',
    animate: false,
    fit: true,
  } 
};


// Fonction pour récupérer le graphe en fonction du nom de fichier sélectionné
const drawGraph = async () => {
  try {

    const selectElement = document.getElementById('selectNetwork');
    const selectedValue = selectElement.value;
  
    const response = await axios.get(`http://localhost:3000/api/graph/files/${selectedValue}`)
  
    const graphData = response.data;    

    // Initialisez Cytoscape avec les données du graphe  
    const cy = cytoscape({
      container: document.getElementById('cy'),
      boxSelectionEnabled: false,
      autounselectify: true,
      wheelSensitivity: 0.5,
      hideEdgesOnViewport: false,
      textureOnViewport: false,
      motionBlur: false,
      elements: graphData,
      style: [        
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': '#8ec8d4', 
            'border-width': '2px',
            'border-style': 'solid',
            'border-color': '#148196',
            'width': 20,
            'height': 20,                  
            'background-clip': 'none',
            'min-zoomed-font-size': 8,
            'font-size': 3,     
                                
          }
        },
        {
          selector: 'edge',
          style: {
            label: 'data(name)',
            'line-color': '#636161',
            'curve-style': 'haystack',
            'min-zoomed-font-size': 8,
            'font-size': 3,
      
            'width': 1, 
            'line-style': 'solid', 
            'overlay-padding': 2, 
            'opacity' : 0.3  
          }
        }
      ],
        layout: layoutOptions[selectedLayout.value]            
    });

  // on zoom-in, the edge's width changed
  cy.on('zoom', (event) => {
    const currentZoom = event.cy.zoom();
    const edgeWidth = Math.max(1, 1 / currentZoom);

  cy.style().selector('edge').style({
    'width': edgeWidth + 'px'
  }).update();
  }); 

  } catch (error) {
    console.error('Erreur lors de la récupération du graphe:', error);
  } 
};

onMounted(() => {
  drawGraph()
});
    
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
      <option value="updated_affinity_purification_communities_spheres">purif_diago</option>
      <option value="updated_affinity_purification_communities_spheres">purif_louvain_spheres</option>
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
