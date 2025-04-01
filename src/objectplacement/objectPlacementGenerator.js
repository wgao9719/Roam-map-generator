/**
 * Object Placement Generator
 * Generates object placement maps for various object types based on heightmap and text prompt
 */

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const { parseObjectsFromPrompt } = require('./promptParser');
const { createGrid } = require('./gridGenerator');
const { calculateHeightAndSlope } = require('./terrainAnalyzer');
const { generatePlacementMasks } = require('./placementMaskGenerator');
const { objectDefinitions } = require('./objectDefinitions');

class ObjectPlacementGenerator {
  /**
   * Generate object placement maps from a text prompt and heightmap
   * @param {string} prompt - Text prompt describing the world objects
   * @param {string} heightMapPath - Path to the heightmap file
   * @param {object} options - Additional options for object placement
   * @returns {Promise<object>} - Paths to the generated object placement maps
   */
  static async generate(prompt, heightMapPath, options = {}) {
    try {
      console.log('Generating object placement maps from prompt and heightmap');
      
      // Step 1: Parse objects from the prompt
      const objectsData = await parseObjectsFromPrompt(prompt);
      
      // Step 2: Load the heightmap
      const heightMap = await this.loadHeightMap(heightMapPath);
      
      // Step 3: Create a grid system for the map
      const gridSize = options.gridSize || 1024; // Default 1024x1024 grid
      const grid = createGrid(heightMap.width, heightMap.height, gridSize);
      
      // Step 4: Calculate height and slope for each grid cell
      const terrainData = calculateHeightAndSlope(heightMap, grid);
      
      // Step 5: Generate placement masks for each object type
      const placementMasks = await generatePlacementMasks(objectsData, terrainData, grid);
      
      // Step 6: Save the placement masks to disk
      const outputPaths = await this.savePlacementMasks(placementMasks);
      
      console.log('Object placement maps generated successfully');
      return outputPaths;
    } catch (error) {
      console.error('Error generating object placement maps:', error);
      throw error;
    }
  }
  
  /**
   * Load the heightmap from disk
   * @param {string} heightMapPath - Path to the heightmap file
   * @returns {Promise<object>} - Heightmap data
   */
  static async loadHeightMap(heightMapPath) {
    try {
      // In a real implementation, this would load the actual heightmap image
      // For now, we'll create a mock heightmap
      console.log(`Loading heightmap from ${heightMapPath}`);
      
      // Mock heightmap (for development - would use actual heightmap in production)
      const mockHeight = {
        width: 1024,
        height: 1024,
        data: new Array(1024 * 1024).fill(0).map(() => Math.random()), // Random height values
        getHeight: function(x, y) {
          const idx = Math.floor(y) * this.width + Math.floor(x);
          return this.data[idx] || 0;
        }
      };
      
      return mockHeight;
    } catch (error) {
      console.error('Error loading heightmap:', error);
      throw error;
    }
  }
  
  /**
   * Save the placement masks to disk as actual PNG files
   * @param {object} placementMasks - Generated placement masks for each object type
   * @returns {Promise<object>} - Paths to the saved placement mask files
   */
  static async savePlacementMasks(placementMasks) {
    try {
      const outputDir = path.join(process.cwd(), 'output', 'objects');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPaths = {};
      
      // Save each placement mask as a separate image
      for (const [objectType, maskData] of Object.entries(placementMasks)) {
        const outputPath = path.join(outputDir, `${objectType}_mask.png`);
        
        // Create an actual bitmap image using Jimp
        const width = maskData.width || 1024;
        const height = maskData.height || 1024;
        const gridSize = maskData.grid || 1024;
        
        // Create a new Jimp image
        const image = new Jimp(width, height);
        
        // Fill the image with data from the mask
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const idx = y * gridSize + x;
            // Create a visible pattern: white for placement, black for no placement
            const color = maskData.cells[idx] === 1 ? 0xFFFFFFFF : 0x000000FF;
            image.setPixelColor(color, x, y);
          }
        }
        
        // Save the image
        await image.writeAsync(outputPath);
        
        outputPaths[objectType] = outputPath;
        console.log(`${objectType} placement mask saved to ${outputPath}`);
      }
      
      return outputPaths;
    } catch (error) {
      console.error('Error saving placement masks:', error);
      throw error;
    }
  }
}

module.exports = ObjectPlacementGenerator; 