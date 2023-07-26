const express = require('express');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

const app = express();
const filesPath = path.join(__dirname, 'files');

app.get('/api/files/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(filesPath, `${fileName}.json`);
  console.log(filePath)

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