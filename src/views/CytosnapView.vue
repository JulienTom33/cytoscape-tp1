<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';

const cytosnapImage = ref('');

// Function to fetch the cytosnap image from the back-end
async function displayCytosnapImage() {
  try {
    // Make a GET request to the back-end API to generate the image
    const response = await axios.get('http://localhost:3000/generate-cytosnap-image');

    // The response should contain the base64-encoded image data
    const imgData = response.data;

    // Set the image data to the 'cytosnapImage' ref
    cytosnapImage.value = imgData;
  } catch (error) {
    console.error('Error fetching Cytosnap image:', error);
  }
}

// Call the function to display the image when the component is mounted
onMounted(displayCytosnapImage);
</script>


<template>
    <div>      
      <div class="links">
        <router-link to="/">Go to Home</router-link> |        
        <router-link to="/cytoscape">Go to Cytoscape</router-link>
      </div>
      <div class="cytosnap-image-container">
        <img :src="cytosnapImage" alt="Cytosnap Image" />
      </div>
    </div>
  </template> 

<style scoped>
.links {
  position: absolute;
  top: 50px;
  left: 50px;
  font-size: 3rem;
}

.cytosnap-image-container {
  margin-top: 30px;
}
</style>