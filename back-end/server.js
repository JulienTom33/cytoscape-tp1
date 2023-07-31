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

cytosnap.use(['cytoscape-dagre', 'cytoscape-cose-bilkent', 'cytoscape-euler', 'cytoscape-klay', 'cytoscape-cola', 'cytoscape-spread', 'preset', 'grid', 'circle', 'concentric', 'cose']);
const snap = cytosnap();


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

app.get('/api/files/:fileName', async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(filesPath, `${fileName}.json`);

  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    const graphData = JSON.parse(data).elements;

    // Generate the image using cytosnap
    const snap = cytosnap();
    const img = await snap.shot({
      elements: graphData,
      layout: { name: 'grid' }, // Use any layout you want here
      style: [
        { selector: 'node', style: { 'background-color': 'red' } },
        { selector: 'edge', style: { 'line-color': 'red' } }
      ],
      resolvesTo: 'base64uri',
      format: 'png',
      width: 640,
      height: 480,
      background: 'transparent'
    });

    // Save the image to a file
    const imageFileName = `${fileName}.png`;
    const imagePath = path.join(filesImgPath, imageFileName);
    fs.writeFileSync(imagePath, img, 'base64');

    // Return the image URL to the frontend
    res.json({ image: `/api/images/${imageFileName}` });
  });
})

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