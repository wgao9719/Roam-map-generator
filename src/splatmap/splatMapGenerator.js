/**
 * Splat Map Generator
 * Generates texture/material splat maps based on heightmap and semantic mapping
 */

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const { processColorMapping } = require('./semanticColorMapper');

class SplatMapGenerator {
  /**
   * Generate a splat map from a text prompt and heightmap
   * @param {string} prompt - Text prompt describing the landscape
   * @param {string} heightMapPath - Path to the heightmap file
   * @param {object} options - Additional options for splatmap generation
   * @returns {Promise<string>} - Path to the generated splatmap file
   */
  static async generate(prompt, heightMapPath, options = {}) {
    try {
      console.log('Generating splat map from prompt and heightmap');
      
      // Step 1: Process the text prompt to extract semantic color/material data
      const colorData = await processColorMapping(prompt);
      
      // Step 2: Generate the splat map using World Machine
      // In a real implementation, this would call World Machine's Lua API
      const splatMapData = await this.callWorldMachineAPI(colorData, heightMapPath, options);
      
      // Step 3: Save the splat map to disk
      const outputPath = path.join(process.cwd(), 'output', 'splatmap.png');
      await this.saveSplatMap(splatMapData, outputPath);
      
      console.log(`Splat map generated successfully at: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error generating splat map:', error);
      throw error;
    }
  }
  
  /**
   * Call the World Machine API to generate a splat map
   * @param {object} colorData - Processed color/material data
   * @param {string} heightMapPath - Path to the heightmap file
   * @param {object} options - Additional options for the API
   * @returns {Promise<object>} - Color data for the splat map
   */
  static async callWorldMachineAPI(colorData, heightMapPath, options) {
    // This is a placeholder for the actual API call
    // In a real implementation, this would call the World Machine Lua API
    console.log('Calling World Machine API with color data:', JSON.stringify(colorData, null, 2));
    console.log('Using heightmap at:', heightMapPath);
    
    // Placeholder implementation
    // In a real implementation, we would:
    // 1. Start World Machine (or connect to a running instance)
    // 2. Load the heightmap
    // 3. Create a material splatmap generation device
    // 4. Configure it with our color/material data
    // 5. Build and export the splatmap
    
    // Mock implementation - return the color data to use for visualization
    console.log('Using mock splat map data (in a real implementation, this would call World Machine API)');
    return colorData;
  }
  
  /**
   * Save the splat map data to disk as an actual PNG file
   * @param {object} colorData - Material/color data for the splat map
   * @param {string} outputPath - Path to save the splat map
   * @returns {Promise<void>}
   */
  static async saveSplatMap(colorData, outputPath) {
    try {
      // Ensure the output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Create an actual color splat map using Jimp
      const width = 1024;
      const height = 1024;
      const image = new Jimp(width, height);
      
      // Load a heightmap to use as reference for height-based materials
      // For simplicity, we'll generate a simple grayscale heightmap
      const heightmap = new Array(width * height).fill(0);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Simple procedural heightmap for demonstration
          // In a real implementation, this would load the actual heightmap
          const nx = x / width;
          const ny = y / height;
          
          // Base height
          let h = 0.3;
          
          // Add some hills/mountains
          h += 0.4 * Math.pow(Math.sin(nx * 5) * Math.cos(ny * 5), 2);
          
          // Add a river
          const riverDist = Math.abs(ny - 0.5);
          if (riverDist < 0.05) {
            h -= 0.3 * (1 - riverDist / 0.05);
          }
          
          // Add some noise
          h += (Math.random() * 0.1) - 0.05;
          
          // Store in heightmap
          heightmap[y * width + x] = Math.max(0, Math.min(1, h));
        }
      }
      
      // For each pixel, determine which material to use based on height/slope
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const pixelHeight = heightmap[idx];
          
          // Calculate approximate slope using neighboring pixels
          let slope = 0;
          if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            const h1 = heightmap[(y - 1) * width + x]; // up
            const h2 = heightmap[(y + 1) * width + x]; // down
            const h3 = heightmap[y * width + (x - 1)]; // left
            const h4 = heightmap[y * width + (x + 1)]; // right
            
            const dy = Math.abs(h1 - h2);
            const dx = Math.abs(h3 - h4);
            slope = Math.sqrt(dx * dx + dy * dy);
          }
          
          // Find the best matching material for this height and slope
          let bestMaterial = null;
          let bestWeight = -1;
          
          for (const material of colorData.materials) {
            // Check if height is in range
            const heightInRange = 
              pixelHeight >= material.heightRange[0] && 
              pixelHeight <= material.heightRange[1];
            
            // Check if slope is in range
            const slopeInRange = 
              slope >= material.slopeRange[0] && 
              slope <= material.slopeRange[1];
            
            if (heightInRange && slopeInRange) {
              // Calculate weight based on how well it matches and material weight
              const heightMatch = 1 - Math.abs((pixelHeight - material.heightRange[0]) / (material.heightRange[1] - material.heightRange[0]) - 0.5) * 2;
              const slopeMatch = 1 - Math.abs((slope - material.slopeRange[0]) / (material.slopeRange[1] - material.slopeRange[0]) - 0.5) * 2;
              
              const weight = (heightMatch * slopeMatch) * material.weight;
              
              if (weight > bestWeight) {
                bestWeight = weight;
                bestMaterial = material;
              }
            }
          }
          
          // Default color if no material matches
          let r = 0, g = 0, b = 0;
          
          // Use the best material color
          if (bestMaterial) {
            [r, g, b] = bestMaterial.color;
          }
          
          // Set the pixel color
          const color = Jimp.rgbaToInt(r, g, b, 255);
          image.setPixelColor(color, x, y);
        }
      }
      
      // Save the image
      await image.writeAsync(outputPath);
      
      console.log(`Splat map saved to ${outputPath}`);
    } catch (error) {
      console.error('Error saving splat map:', error);
      throw error;
    }
  }
}

module.exports = SplatMapGenerator; 