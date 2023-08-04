const express = require('express');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const cors = require('cors');
const cytoscape = require('cytoscape');
const cytosnap = require('cytosnap');

const app = express();

app.use(cors());

const filesPath = path.join(__dirname, 'files');
const filesImgPath = path.join(__dirname, 'files_img');


// ****************************************************************************************************************************************
// CYTOSNAP 
/* 
Puppeteer options to display the graph image in the Web browser
*/
var options = {
  puppeteer: {
    // Additional options to pass to Puppeteer's launch method
    // For example, to disable the sandbox on certain environments
    headless: true, // true by default
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add any other Puppeteer arguments here as needed
  }
};

/* 
function to parse the json data
*/
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

/* 
function to get the nodes and the edges depending the json structure
*/
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

/* 
function to generate a graph image with cytosnap
*/
cytosnap.use(['cytoscape-dagre', 'cytoscape-cose-bilkent', 'cytoscape-euler', 'cytoscape-klay', 'cytoscape-cola', 'cytoscape-spread']);

const generateGraphImage = async (graphData) => {
  try {
    const snap = cytosnap(options);
    await snap.start();

    const { nodes, edges } = graphElements(graphData);

    const img = await snap.shot({
      elements: {        
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
                    'background-color': '#8ec8d4', 
                    'border-width': '2px',
                    'border-style': 'solid',
                    'border-color': '#148196',
                    'width': 30,
                    'height': 30,                  
                    'background-clip': 'none',
                  }                 
                },                
                {
                  selector: 'edge',
                  style: {
                    'line-color': '#636161',
                    'curve-style': 'unbundled-bezier',
                  },
                },
      ],
      resolvesTo: 'base64uri',
      format: 'png',
      width: 3840,
      height: 2160,
      background: 'transparent'      
    });

    const buffer = Buffer.from(img.split(',')[1], 'base64');
    return buffer;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image du graphe :', error);
    throw error;
  }
};

/* 
To get a file in the files_img directory
Is avalaible for cytosnap
*/
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

// ****************************************************************************************************************************************
// CYTOSCAPE SERVER TEST


/* 
route to create the graph data from the json selected in the front-end
*/
app.get('/api/graph/files/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(filesPath, `${fileName}.json`);
  try {
    const graphData = createGraphFromJSON(filePath);
    // console.log(graphData);
    res.json(graphData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du graphe à partir du fichier JSON' });
  }
});

/* 
Function to create the graph from the json with cytoscape
*/
function createGraphFromJSON(filePath) {
  const cy = cytoscape({ headless: true }); 

  try {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const { nodes, edges } = graphEl(jsonData);

    cy.add(nodes.concat(edges));

    // cy.layout({ name: 'preset' }).run();

    const graphData = cy.json().elements;

    return graphData;
  } catch (error) {
    console.error('Erreur lors de la création du graphe à partir du fichier JSON:', error);
    throw error;
  }
}

/* 
function to get the nodes and the edges depending the json structure
*/
function graphEl(data) {
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
  } else {
    throw new Error('Les données JSON doivent contenir les propriétés "nodes" et "edges" ou "elements".');
  }

  return { nodes, edges };
}

// Fonction pour créer le graphe avec Cytoscape à partir du fichier JSON
// function createGraphFromJSON(filePath) {
//   const cy = cytoscape({ headless: true }); 
  
//   try {
//     const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     let nodes = [];
//     let edges = [];

    
//     if (Array.isArray(jsonData)) {
//       nodes = jsonData.filter((element) => element.group === 'nodes');
//       edges = jsonData.filter((element) => element.group === 'edges');
//     } else {     
//       if (!jsonData.elements || !jsonData.elements.nodes || !jsonData.elements.edges) {
//         throw new Error('Le fichier JSON doit contenir les propriétés "elements", "nodes" et "edges".');
//       }

//       nodes = jsonData.elements.nodes;
//       edges = jsonData.elements.edges;
//     }
   
//     cy.add(nodes.concat(edges));
    
//     // cy.layout({ name: 'preset' }).run();
   
//     const graphData = cy.json().elements;

//     return graphData;
//   } catch (error) {
//     console.error('Erreur lors de la création du graphe à partir du fichier JSON:', error);
//     throw error;
//   }
// }

// ****************************************************************************************************************************************


/* 
To get a file in the files directory
*/
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

/* 
To get all the files in the files directory
*/
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

// ****************************************************************************************************************************************

/* 
server port
*/
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});