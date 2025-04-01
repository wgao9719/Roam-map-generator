/**
 * Main entry point for the Map Generation Pipeline
 */

require('dotenv').config();

const HeightMapGenerator = require('./heightmap/heightMapGenerator');
const SplatMapGenerator = require('./splatmap/splatMapGenerator');
const ObjectPlacementGenerator = require('./objectplacement/objectPlacementGenerator');

/**
 * Main function to run the full map generation pipeline
 * @param {string} landscapePrompt - Text prompt describing the landscape
 * @param {string} worldPrompt - Text prompt describing the world objects
 * @param {object} options - Additional options for map generation
 */
async function generateMap(landscapePrompt, worldPrompt, options = {}) {
  try {
    console.log('Starting map generation pipeline...');
    
    // Step 1: Generate Height Map
    console.log('Generating height map...');
    const heightMap = await HeightMapGenerator.generate(landscapePrompt);
    
    // Step 2: Generate Splat Map (can be concurrent with object placement)
    console.log('Generating splat map...');
    const splatMap = await SplatMapGenerator.generate(landscapePrompt, heightMap);
    
    // Step 3: Generate Object Placement Maps
    console.log('Generating object placement maps...');
    const objectPlacementMaps = await ObjectPlacementGenerator.generate(worldPrompt, heightMap, options);
    
    return {
      heightMap,
      splatMap,
      objectPlacementMaps
    };
  } catch (error) {
    console.error('Error in map generation pipeline:', error);
    throw error;
  }
}

// Example usage
if (require.main === module) {
  const landscapePrompt = "A hilly region with mountains in the north, a river running east to west, and flatlands in the south";
  const worldPrompt = "A medieval village near the river, dense forests in the hills, scattered rocks in the mountains";
  
  generateMap(landscapePrompt, worldPrompt)
    .then(result => {
      console.log('Map generation completed successfully');
      console.log('Result files:');
      console.log('- Height Map:', result.heightMap);
      console.log('- Splat Map:', result.splatMap);
      console.log('- Object Placement Maps:', result.objectPlacementMaps);
    })
    .catch(err => {
      console.error('Failed to generate map:', err);
    });
}

module.exports = { generateMap }; 