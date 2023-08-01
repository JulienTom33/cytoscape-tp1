const express = require('express');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const cors = require('cors');
const cytosnap = require('cytosnap');

const app = express();
app.use(cors());
const filesPath = path.join(__dirname, 'files');
const filesImgPath = path.join(__dirname, 'files_img');


cytosnap.use(['cytoscape-dagre', 'cytoscape-cose-bilkent', 'cytoscape-euler', 'cytoscape-klay', 'cytoscape-cola', 'cytoscape-spread']);

var options = {
  puppeteer: {
    // Additional options to pass to Puppeteer's launch method
    // For example, to disable the sandbox on certain environments
    headless: true, // true by default
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add any other Puppeteer arguments here as needed
  }
};

const readAndParseGraphJSON = async (filePath) => {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const graphData = JSON.parse(fileContent);
    // console.log(graphData)
    return graphData;
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier JSON :', error);
    throw error;
  }
};

const graphElements = (graphData) => {
  const data = graphData;
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


const generateGraphImage = async (graphData, zoomLevel) => {
  try {
    const snap = cytosnap(options);
    await snap.start();

    const { nodes, edges } = graphElements(graphData);

    const img = await snap.shot({
      elements: {
        // nodes: graphData.elements.nodes,
        // edges: graphData.elements.edges
        nodes: nodes,
        edges: edges
      },
      layout: {
                name: 'preset'                
              },
      style: [
                {
                  selector: 'node',
                  style: {
                    'background-color': 'blue',
                  },
                },
                {
                  selector: 'edge',
                  style: {
                    'line-color': 'red',
                  },
                },
      ],
      resolvesTo: 'base64uri',
      format: 'png',
      width: 640,
      height: 480,
      background: 'transparent'      
    });

    const buffer = Buffer.from(img.split(',')[1], 'base64');
    return buffer;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image du graphe :', error);
    throw error;
  }
};

app.get('/api/files_img/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(filesPath, `${fileName}.json`);    
    const graphData = await readAndParseGraphJSON(filePath);
    const buffer = await generateGraphImage(graphData);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image du graphe :', error);
    res.status(500).send('Erreur lors de la génération de l\'image du graphe');
  }
});

// app.get('/api/graph-image-from-json', async (req, res) => {
//   try {
//     const filePath = path.join(filesPath, 'nba-20.json'); // Chemin vers le fichier JSON dans le dossier 'files'
//     const graphData = await readAndParseGraphJSON(filePath);
//     const buffer = await generateGraphImage(graphData);
//     res.set('Content-Type', 'image/png');
//     res.send(buffer);
//   } catch (error) {
//     console.error('Erreur lors de la génération de l\'image du graphe :', error);
//     res.status(500).send('Erreur lors de la génération de l\'image du graphe');
//   }
// });

// ****************************************************************************************************************

// app.get('/api/graph-image', async (req, res) => {
//   try {
//     await snap.start(); // Utiliser l'instance snap déjà initialisée au lieu d'en créer une nouvelle

//     const img = await snap.shot({
//       elements: [
//         { data: { id: 'foo' } },
//         { data: { id: 'bar' } },
//         { data: { source: 'foo', target: 'bar' } }
//       ],
//       layout: {
//         name: 'grid' // you may reference a `cytoscape.use()`d extension name here
//       },
//       style: [
//         {
//           selector: 'node',
//           style: {
//             'background-color': 'red'
//           }
//         },
//         {
//           selector: 'edge',
//           style: {
//             'line-color': 'red'
//           }
//         }
//       ],
//       resolvesTo: 'base64uri',
//       format: 'png',
//       width: 640,
//       height: 480,
//       background: 'transparent'
//     });
//     res.set('Content-Type', 'image/png');
//     res.send(img)
//   } catch (error) {
//     console.error('Erreur lors de la génération de l\'image du graphe :', error);
//     res.status(500).send('Erreur lors de la génération de l\'image du graphe');
//   }
// });

// app.get('/api/graph-image', async (req, res) => {
//   try {
//     const buffer = await generateGraphImage();
//     res.set('Content-Type', 'image/png');
//     res.send(buffer);
//   } catch (error) {
//     console.error('Erreur lors de la génération de l\'image du graphe :', error);
//     res.status(500).send('Erreur lors de la génération de l\'image du graphe');
//   }
// });
// ****************************************************************************************************************




app.get('/api/files/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(filesPath, `${fileName}.json`);
  // console.log(filePath)

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(JSON.parse(data));
  });
});

function getAllFiles() {
  const jsonFiles = [];
  const files = fs.readdirSync(filesPath);

  files.forEach(file => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(filesPath, file);
      const fileData = fs.readFileSync(filePath, 'utf8');

      try {
        const jsonData = JSON.parse(fileData);
        jsonFiles.push(jsonData);
      } catch (err) {
        console.error(`Error parsing JSON file: ${file}`);
      }
    }
  });

  return jsonFiles;
}

app.get('/api/files', (req, res) => {
  const allFiles = getAllFiles();
  res.json(allFiles);
  // console.log(allFiles)
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});