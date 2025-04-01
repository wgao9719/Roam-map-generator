/**
 * Height Map Generator
 * Uses CivitAI heightmap generator API to convert text prompt into height maps
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const { processTopographyMapping } = require('./semanticTopographyMapper');

class HeightMapGenerator {
  /**
   * Generate a heightmap from a text prompt
   * @param {string} prompt - Text prompt describing the landscape
   * @param {object} options - Additional options for heightmap generation
   * @returns {Promise<string>} - Path to the generated heightmap file
   */
  static async generate(prompt, options = {}) {
    try {
      // Step 1: Process the text prompt to extract semantic topography data
      const topographyData = await processTopographyMapping(prompt);
      
      // Step 2: Call the heightmap generation API
      const heightmapData = await this.callHeightmapAPI(topographyData, options);
      
      // Step 3: Save the heightmap to disk
      const outputPath = path.join(process.cwd(), 'output', 'heightmap.png');
      await this.saveHeightmap(heightmapData, outputPath);
      
      console.log(`Height map generated successfully at: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error generating height map:', error);
      throw error;
    }
  }
  
  /**
   * Call the CivitAI heightmap generator API
   * @param {object} topographyData - Processed topography data
   * @param {object} options - Additional options for the API
   * @returns {Promise<Buffer>} - Binary image data of the heightmap
   */
  static async callHeightmapAPI(topographyData, options) {
    // This is a placeholder for the actual API call
    // In a real implementation, this would call the CivitAI API
    console.log('Calling heightmap API with topography data:', JSON.stringify(topographyData, null, 2));
    
    // Placeholder implementation that would be replaced with actual API call
    // For example: using the CivitAI GameLandscape Heightmap Generator
    try {
      // const response = await fetch('https://api.civitai.com/heightmapGenerator', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     prompt: topographyData.description,
      //     features: topographyData.features,
      //     ...options
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error(`API responded with status: ${response.status}`);
      // }
      
      // return await response.buffer();
      
      // Instead of returning a mock buffer, we'll return the topography data
      // that can be used to generate a real heightmap
      console.log('Using mock heightmap data (in a real implementation, this would call the CivitAI API)');
      return topographyData;
    } catch (error) {
      console.error('Error calling heightmap API:', error);
      throw error;
    }
  }
  
  /**
   * Save the heightmap data to disk as an actual PNG file
   * @param {object} heightmapData - Processed topography data
   * @param {string} outputPath - Path to save the heightmap
   * @returns {Promise<void>}
   */
  static async saveHeightmap(heightmapData, outputPath) {
    try {
      // Ensure the output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Create an actual greyscale heightmap using Jimp
      const width = 1024;
      const height = 1024;
      const image = new Jimp(width, height);
      
      // Fill the image with height data based on the topography features
      // This is a simplified visualization of the heightmap
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Normalized coordinates between 0 and 1
          const nx = x / width;
          const ny = y / height;
          
          // Default base height (based on the baseType)
          let pixelHeight = 0.1; // Default low height for 'flat' baseType
          
          // Apply height based on features
          for (const feature of heightmapData.features) {
            // Calculate influence based on distance to feature location
            const dx = nx - feature.location.x;
            const dy = ny - feature.location.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Falloff radius - how far the feature extends
            const radius = feature.type === 'river' ? 0.02 : 0.3;
            
            if (distance < radius) {
              // Calculate influence factor (1 at center, 0 at radius)
              const influence = 1 - Math.pow(distance / radius, 2);
              
              // Apply different height depending on feature type
              if (feature.type === 'mountains') {
                pixelHeight = Math.max(pixelHeight, feature.height * influence);
              } else if (feature.type === 'hills') {
                pixelHeight = Math.max(pixelHeight, feature.height * influence);
              } else if (feature.type === 'flatlands') {
                pixelHeight = feature.height;
              } else if (feature.type === 'river') {
                // Rivers should be lower than surroundings
                pixelHeight = Math.min(pixelHeight, 0.05);
              }
            }
          }
          
          // Add some random noise for texture
          pixelHeight += (Math.random() * 0.05) - 0.025;
          
          // Clamp height to 0-1 range
          pixelHeight = Math.max(0, Math.min(1, pixelHeight));
          
          // Convert to grayscale value (0-255)
          const gray = Math.floor(pixelHeight * 255);
          const color = Jimp.rgbaToInt(gray, gray, gray, 255);
          
          image.setPixelColor(color, x, y);
        }
      }
      
      // Save the image
      await image.writeAsync(outputPath);
      
      console.log(`Heightmap saved to ${outputPath}`);
    } catch (error) {
      console.error('Error saving heightmap:', error);
      throw error;
    }
  }
}

module.exports = HeightMapGenerator; 