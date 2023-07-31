import axios from 'axios';
const cytosnap = require('cytosnap');
const fs = require('fs');
const path = require('path');

// list of layout extensions to use
cytosnap.use([
  'cytoscape-dagre',
  'cytoscape-cose-bilkent',
  'cytoscape-euler',
  'cytoscape-klay',
  'cytoscape-cola',
  'cytoscape-spread',
  'preset',
  'grid',
  'circle',
  'concentric',
  'cose'
]);

// Function to generate the cytosnap image from JSON data and save it to a file
async function generateAndSaveImage(graphData, fileName) {
  try {
    const options = {
      puppeteer: {
        // Additional options to pass to Puppeteer's launch method
        // For example, to disable the sandbox on certain environments
        headless: true, // true by default
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add any other Puppeteer arguments here as needed
      }
    };

    const snap = cytosnap(options);

    const imgData = await snap.shot({
      elements: graphData,
      layout: { name: 'grid' },
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

    // Save the image to the back-end/files_img directory
    const imageFileName = `${fileName}.png`;
    const imagePath = path.join(__dirname, 'back-end', 'files_img', imageFileName);
    fs.writeFileSync(imagePath, Buffer.from(imgData, 'base64'));

    console.log(`Image saved as ${imageFileName}`);
  } catch (error) {
    console.error('Error generating and saving Cytosnap image:', error);
  }
}

// Fetch the JSON data from the API and generate/save the image
axios.get('http://localhost:3000/api/files/genemania').then(response => {
  const graphData = response.data.elements;
  generateAndSaveImage(graphData, 'genemania');
});



// import axios from 'axios';
// var cytosnap = require('cytosnap');

// // list of layout extensions to use
// // NB you must `npm install` these yourself for your project
// cytosnap.use([ 'cytoscape-dagre', 'cytoscape-cose-bilkent', 'cytoscape-euler', 'cytoscape-klay', 'cytoscape-cola', 'cytoscape-spread', 'preset', 'grid', 'circle', 'concentric', 'cose' ]);

// var options = {
//     puppeteer: {
//       // Additional options to pass to Puppeteer's launch method
//       // For example, to disable the sandbox on certain environments
//       headless: true, // true by default
//       args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add any other Puppeteer arguments here as needed
//     }
//   };

// var snap = cytosnap(options);

// snap.start().then(function(){
//     const response = axios.get(`http://localhost:3000/api/files/genemania`)
//     const graphData = response.data.elements;
//   return snap.shot({
//     elements: [ // http://js.cytoscape.org/#notation/elements-json
//     graphData
//     //   { data: { id: 'foo' } },
//     //   { data: { id: 'bar' } },
//     //   { data: { source: 'foo', target: 'bar' } }
//     ],
//     layout: { // http://js.cytoscape.org/#init-opts/layout
//       name: 'grid' // you may reference a `cytoscape.use()`d extension name here
//     },
//     style: [ // http://js.cytoscape.org/#style
//       {
//         selector: 'node',
//         style: {
//           'background-color': 'red'
//         }
//       },
//       {
//         selector: 'edge',
//         style: {
//           'line-color': 'red'
//         }
//       }
//     ],
//     resolvesTo: 'base64uri',
//     format: 'png',
//     width: 640,
//     height: 480,
//     background: 'transparent'
//   });
// }).then(function( img ){
//   // do whatever you want with img
//   console.log( img );
// });