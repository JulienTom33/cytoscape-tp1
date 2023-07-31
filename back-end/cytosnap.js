import axios from 'axios';
var cytosnap = require('cytosnap');

// list of layout extensions to use
// NB you must `npm install` these yourself for your project
cytosnap.use([ 'cytoscape-dagre', 'cytoscape-cose-bilkent', 'cytoscape-euler', 'cytoscape-klay', 'cytoscape-cola', 'cytoscape-spread', 'preset', 'grid', 'circle', 'concentric', 'cose' ]);

var options = {
    puppeteer: {
      // Additional options to pass to Puppeteer's launch method
      // For example, to disable the sandbox on certain environments
      headless: true, // true by default
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add any other Puppeteer arguments here as needed
    }
  };

var snap = cytosnap(options);

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

  snap.start().then(function() {
    const response = axios.get(`http://localhost:3000/api/files/genemania`);
    const graphData = response.data.elements;
    console.log(graphData);
  
    const { nodes, edges } = graphElements(response);
    const img = snap.shot({
      elements: [nodes, edges],
      layout: {
        name: 'grid',
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'red',
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
      background: 'transparent',
    });
  
    // Save the image to a file
    const blob = Buffer.from(img, 'base64');
    const filename = 'genemania.png';
    const file = new File([blob], filename, {type: 'image/png'});
  
    // Save the file to disk
    const saveResult = file.save();
  
    if (saveResult) {
      console.log('Image saved successfully.');
    } else {
      console.log('Error saving image.');
    }
  });

// snap.start().then(function(){
//     const response = axios.get(`http://localhost:3000/api/files/genemania`)
//     const graphData = response.data.elements;
//     console.log(graphData)

//     const { nodes, edges } = graphElements(response);
//   return snap.shot({
//     elements: [ 
//     nodes = nodes,
//     edges = edges
//     ],
//     layout: { 
//       name: 'grid' 
//     },
//     style: [ 
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