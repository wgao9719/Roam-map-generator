/**
 * Prompt Parser for Object Placement
 * Parses text prompts to extract object placement information
 */

const { objectDefinitions } = require('./objectDefinitions');

/**
 * Parse objects and their properties from a text prompt
 * @param {string} prompt - Text prompt describing the world objects
 * @returns {Promise<object>} - Structured object data
 */
async function parseObjectsFromPrompt(prompt) {
  try {
    console.log('Parsing objects from prompt:', prompt);
    
    // This is a placeholder implementation
    // In a real implementation, this would use NLP to extract object types, densities, and locations
    
    const objectsData = {
      objects: []
    };
    
    // Simple keyword matching for common object types
    // This would be much more sophisticated in a real implementation
    
    // Check for trees
    if (prompt.toLowerCase().includes('tree') || prompt.toLowerCase().includes('forest')) {
      objectsData.objects.push({
        type: 'tree',
        subType: prompt.toLowerCase().includes('pine') ? 'pine' : 'oak',
        density: estimateDensity(prompt, 'tree'),
        location: estimateLocation(prompt, 'tree'),
        distribution: 'natural'
      });
    }
    
    // Check for rocks
    if (prompt.toLowerCase().includes('rock') || prompt.toLowerCase().includes('boulder')) {
      objectsData.objects.push({
        type: 'rock',
        subType: prompt.toLowerCase().includes('large') ? 'boulder' : 'rock',
        density: estimateDensity(prompt, 'rock'),
        location: estimateLocation(prompt, 'rock'),
        distribution: 'random'
      });
    }
    
    // Check for buildings
    if (prompt.toLowerCase().includes('village') || 
        prompt.toLowerCase().includes('town') || 
        prompt.toLowerCase().includes('building') ||
        prompt.toLowerCase().includes('house')) {
      objectsData.objects.push({
        type: 'building',
        subType: determineSettlementType(prompt),
        density: estimateDensity(prompt, 'building'),
        location: estimateLocation(prompt, 'building'),
        distribution: 'clustered'
      });
    }
    
    // Add any additional objects that might be mentioned
    for (const [objectType, definition] of Object.entries(objectDefinitions)) {
      if (!objectsData.objects.some(obj => obj.type === objectType) && 
          prompt.toLowerCase().includes(objectType)) {
        objectsData.objects.push({
          type: objectType,
          subType: 'default',
          density: estimateDensity(prompt, objectType),
          location: estimateLocation(prompt, objectType),
          distribution: definition.defaultDistribution || 'random'
        });
      }
    }
    
    console.log('Extracted objects data:', objectsData);
    return objectsData;
  } catch (error) {
    console.error('Error parsing objects from prompt:', error);
    throw error;
  }
}

/**
 * Estimate object density from the prompt text
 * @param {string} prompt - Text prompt
 * @param {string} objectType - Type of object to look for
 * @returns {number} - Estimated density (0-1)
 */
function estimateDensity(prompt, objectType) {
  const promptLower = prompt.toLowerCase();
  
  // Look for density modifiers
  if (promptLower.includes(`dense ${objectType}`) || promptLower.includes(`thick ${objectType}`)) {
    return 0.8;
  } else if (promptLower.includes(`sparse ${objectType}`) || promptLower.includes(`scattered ${objectType}`)) {
    return 0.3;
  } else if (promptLower.includes(`few ${objectType}`)) {
    return 0.2;
  } else {
    return 0.5; // Default medium density
  }
}

/**
 * Estimate object location from the prompt text
 * @param {string} prompt - Text prompt
 * @param {string} objectType - Type of object to look for
 * @returns {object} - Estimated location data
 */
function estimateLocation(prompt, objectType) {
  const promptLower = prompt.toLowerCase();
  const locationMapping = {
    north: { x: 0.5, y: 0.1 },
    south: { x: 0.5, y: 0.9 },
    east: { x: 0.9, y: 0.5 },
    west: { x: 0.1, y: 0.5 },
    northeast: { x: 0.9, y: 0.1 },
    northwest: { x: 0.1, y: 0.1 },
    southeast: { x: 0.9, y: 0.9 },
    southwest: { x: 0.1, y: 0.9 },
    center: { x: 0.5, y: 0.5 },
  };
  
  // Terrain-based location matching
  const terrainAssociations = {
    'mountain': 'mountains',
    'hill': 'hills',
    'river': 'river',
    'lake': 'lake',
    'forest': 'forest',
    'flat': 'flatlands'
  };
  
  // Check for explicit location (e.g., "trees in the north")
  for (const [direction, position] of Object.entries(locationMapping)) {
    const pattern = new RegExp(`${objectType}.*\\b${direction}\\b|\\b${direction}\\b.*${objectType}`);
    if (pattern.test(promptLower)) {
      return {
        x: position.x,
        y: position.y,
        radius: 0.3, // Spread over 30% of the map
        terrain: null // No specific terrain association
      };
    }
  }
  
  // Check for terrain association (e.g., "trees in the mountains")
  for (const [terrainKeyword, terrainType] of Object.entries(terrainAssociations)) {
    const pattern = new RegExp(`${objectType}.*\\b${terrainKeyword}\\b|\\b${terrainKeyword}\\b.*${objectType}`);
    if (pattern.test(promptLower)) {
      return {
        terrain: terrainType,
        radius: 0.0, // No specific position, use the terrain mask
        x: 0.5, y: 0.5 // Default position if terrain mask not available
      };
    }
  }
  
  // Default to entire map
  return {
    x: 0.5,
    y: 0.5,
    radius: 0.5, // Cover the entire map
    terrain: null
  };
}

/**
 * Determine the type of settlement from the prompt
 * @param {string} prompt - Text prompt
 * @returns {string} - Settlement type
 */
function determineSettlementType(prompt) {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('city')) {
    return 'city';
  } else if (promptLower.includes('town')) {
    return 'town';
  } else if (promptLower.includes('village')) {
    return 'village';
  } else if (promptLower.includes('farm')) {
    return 'farm';
  } else {
    return 'house'; // Default to individual houses
  }
}

module.exports = {
  parseObjectsFromPrompt
}; 