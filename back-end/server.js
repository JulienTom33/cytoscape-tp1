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
      width: 1920,
      height: 1080,
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


/* 
server port
*/
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});