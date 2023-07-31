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

cytosnap.use(['cytoscape-dagre', 'cytoscape-cose-bilkent', 'cytoscape-euler', 'cytoscape-klay', 'cytoscape-cola', 'cytoscape-spread' ]);

var options = {
  puppeteer: {
    // Additional options to pass to Puppeteer's launch method
    // For example, to disable the sandbox on certain environments
    headless: true, // true by default
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add any other Puppeteer arguments here as needed
  }
};
const snap = cytosnap(options);


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