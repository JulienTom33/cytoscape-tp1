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
const snap = cytosnap(options); // Utiliser les options lors de l'initialisation de Cytosnap

// Fonction pour lire le contenu du fichier JSON et le convertir en un objet de graphe
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

const generateGraphImage = async (graphData) => {
  try {
    const snap = cytosnap();
    await snap.start();

    const img = await snap.shot({
      elements: {
        nodes: graphData.elements.nodes,
        edges: graphData.elements.edges
      },
      layout: {
                name: 'preset' // you may reference a `cytoscape.use()`d extension name here
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
      width: 1024,
      height: 768,
      background: 'transparent'
    });

    const buffer = Buffer.from(img.split(',')[1], 'base64');
    return buffer;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image du graphe :', error);
    throw error;
  }
};

app.get('/api/files/:fileName', async (req, res) => {
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




// app.get('/api/files/:fileName', (req, res) => {
//   const { fileName } = req.params;
//   const filePath = path.join(filesPath, `${fileName}.json`);
//   // console.log(filePath)

//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(404).json({ error: 'File not found' });
//     }
//     res.json(JSON.parse(data));
//   });
// });

// // Endpoint to get the JSON data
// app.get('/api/files/:fileName', async (req, res) => {
//   const { fileName } = req.params;
//   const filePath = path.join(filesPath, `${fileName}.json`);

//   try {
//     const fileData = fs.readFileSync(filePath, 'utf8');
//     const jsonData = JSON.parse(fileData);

//     // Use cytosnap to generate the image
//     const img = await snap.shot({
//       elements: jsonData.elements,
//       layout: { name: 'grid' },
//       style: [
//         { selector: 'node', style: { 'background-color': 'red' } },
//         { selector: 'edge', style: { 'line-color': 'red' } }
//       ],
//       resolvesTo: 'base64uri',
//       format: 'png',
//       width: 640,
//       height: 480,
//       background: 'transparent'
//     });

//     // Save the image to a file
//     const imgPath = path.join(filesImgPath, `${fileName}.png`);
//     fs.writeFileSync(imgPath, img.replace(/^data:image\/png;base64,/, ''), 'base64');

//     // Send the JSON data along with the image URL
//     res.json({ elements: jsonData.elements, imageUrl: `/api/files_img/${fileName}.png` });
//   } catch (err) {
//     console.error(err);
//     return res.status(404).json({ error: 'File not found' });
//   }
// });

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