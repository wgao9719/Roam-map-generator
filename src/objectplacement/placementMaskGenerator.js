/**
 * Placement Mask Generator
 * Generates object placement masks based on terrain data and object requirements
 */

const { objectDefinitions } = require('./objectDefinitions');

/**
 * Generate placement masks for each object type
 * @param {object} objectsData - Parsed object data from the prompt
 * @param {object} grid - Grid system with terrain data
 * @returns {Promise<object>} - Placement masks for each object type
 */
async function generatePlacementMasks(objectsData, grid) {
  console.log('Generating placement masks for objects');
  
  const placementMasks = {};
  
  // Sort objects by priority (higher priority objects get placed first)
  const sortedObjects = [...objectsData.objects].sort((a, b) => {
    const objDefA = objectDefinitions[a.type] || { priority: 999 };
    const objDefB = objectDefinitions[b.type] || { priority: 999 };
    return objDefA.priority - objDefB.priority;
  });
  
  // Process each object type
  for (const objectData of sortedObjects) {
    console.log(`Processing placement for object type: ${objectData.type}`);
    
    // Get object definition
    const objectDef = objectDefinitions[objectData.type];
    if (!objectDef) {
      console.warn(`No definition found for object type: ${objectData.type}`);
      continue;
    }
    
    // Initialize placement mask for this object type
    placementMasks[objectData.type] = {
      grid: grid.gridSize,
      width: grid.width,
      height: grid.height,
      cells: new Array(grid.cells.length).fill(0) // 0 = cannot place, 1 = can place
    };
    
    // Calculate suitability for each cell
    calculateObjectSuitability(objectData, objectDef, grid);
    
    // Create the placement mask
    createPlacementMask(objectData, placementMasks[objectData.type], grid);
    
    console.log(`Placement mask for ${objectData.type} generated`);
  }
  
  return placementMasks;
}

/**
 * Calculate object placement suitability for each cell
 * @param {object} objectData - Object data from the prompt
 * @param {object} objectDef - Object definition
 * @param {object} grid - Grid system with terrain data
 */
function calculateObjectSuitability(objectData, objectDef, grid) {
  const placementRules = objectDef.placementRules;
  const subTypeRules = objectDef.subtypes[objectData.subType]?.customRules || {};
  
  // Process each cell in the grid
  for (const cell of grid.cells) {
    // Initialize suitability score
    cell.suitability[objectData.type] = 0;
    
    // Check if cell meets basic requirements
    if (cell.properties.slope > placementRules.maxSlope) {
      continue; // Slope too steep
    }
    
    if (cell.properties.height < placementRules.minHeight || 
        cell.properties.height > placementRules.maxHeight) {
      continue; // Height out of range
    }
    
    // Start with base suitability score
    let suitability = 1.0;
    
    // Apply location-based suitability
    if (objectData.location) {
      // Check if we should use terrain association
      if (objectData.location.terrain) {
        // Check if cell has terrain features matching the required terrain
        const hasTerrain = cellHasTerrainFeature(cell, objectData.location.terrain);
        if (!hasTerrain) {
          suitability *= 0.1; // Greatly reduce suitability for non-matching terrain
        } else {
          suitability *= 1.5; // Boost suitability for matching terrain
        }
      } else {
        // Use location-based placement
        const distance = calculateDistance(
          cell.centerX / grid.width, 
          cell.centerY / grid.height,
          objectData.location.x, 
          objectData.location.y
        );
        
        // Apply distance-based suitability falloff
        if (distance <= objectData.location.radius) {
          // Falloff from center (1.0) to edge (0.5)
          suitability *= 1.0 - (0.5 * distance / objectData.location.radius);
        } else {
          suitability *= 0.2; // Outside the specified radius, low suitability
        }
      }
    }
    
    // Apply subtype-specific rules
    if (subTypeRules.preferHigherElevation) {
      suitability *= 0.5 + cell.properties.height * 0.5;
    }
    
    if (subTypeRules.preferLowerElevation) {
      suitability *= 1.0 - cell.properties.height * 0.5;
    }
    
    if (subTypeRules.preferSteepSlopes) {
      suitability *= 0.5 + (cell.properties.slope / placementRules.maxSlope) * 0.5;
    }
    
    if (subTypeRules.requireFlatArea && !cell.properties.terrainFeatures.isFlat) {
      suitability *= 0.1;
    }
    
    if (subTypeRules.requireWaterAccess) {
      // Check if any neighboring cells have water (simplified)
      const neighbors = grid.getNeighbors(cell);
      const hasWaterNeighbor = neighbors.some(n => 
        n.properties.height < 0.1 && n.properties.terrainFeatures.elevationClass === 'lowland'
      );
      
      if (!hasWaterNeighbor) {
        suitability *= 0.1;
      }
    }
    
    // Apply density factor
    suitability *= objectData.density;
    
    // Store the suitability score
    cell.suitability[objectData.type] = suitability;
  }
}

/**
 * Create placement mask based on cell suitability
 * @param {object} objectData - Object data from the prompt
 * @param {object} mask - Placement mask data
 * @param {object} grid - Grid system with terrain data
 */
function createPlacementMask(objectData, mask, grid) {
  // Get distribution method
  const distribution = objectData.distribution || 'random';
  
  // Process cells based on distribution method
  switch (distribution) {
    case 'natural':
      createNaturalDistributionMask(objectData, mask, grid);
      break;
      
    case 'clustered':
      createClusteredDistributionMask(objectData, mask, grid);
      break;
      
    case 'water':
      createWaterDistributionMask(objectData, mask, grid);
      break;
      
    case 'random':
    default:
      createRandomDistributionMask(objectData, mask, grid);
      break;
  }
}

/**
 * Create a natural distribution mask (grouped but not uniform)
 * @param {object} objectData - Object data from the prompt
 * @param {object} mask - Placement mask data
 * @param {object} grid - Grid system with terrain data
 */
function createNaturalDistributionMask(objectData, mask, grid) {
  // Natural distribution uses suitability as a probability factor
  // and adds clustering through cellular automata rules
  
  // First, set initial mask values based on suitability thresholds
  const suitabilityThreshold = 0.3;
  
  for (let i = 0; i < grid.cells.length; i++) {
    const cell = grid.cells[i];
    const suitability = cell.suitability[objectData.type] || 0;
    
    // Apply suitability threshold with some randomness
    if (suitability > suitabilityThreshold && Math.random() < suitability) {
      mask.cells[i] = 1;
    }
  }
  
  // Apply cellular automata rules to create natural clustering
  const iterations = 2;
  for (let iter = 0; iter < iterations; iter++) {
    const newMask = [...mask.cells];
    
    for (let i = 0; i < grid.cells.length; i++) {
      const cell = grid.cells[i];
      
      // Get neighbors
      const neighbors = grid.getNeighbors(cell);
      
      // Count neighbors with mask value 1
      const activeNeighbors = neighbors.filter(n => {
        const idx = n.gridY * grid.gridSize + n.gridX;
        return mask.cells[idx] === 1;
      }).length;
      
      // Apply cellular automata rules
      const idx = cell.gridY * grid.gridSize + cell.gridX;
      if (mask.cells[idx] === 1) {
        // Survival rule: remain active if 2-6 active neighbors
        if (activeNeighbors < 2 || activeNeighbors > 6) {
          newMask[idx] = 0;
        }
      } else {
        // Birth rule: become active if 3-4 active neighbors
        if (activeNeighbors >= 3 && activeNeighbors <= 4 && 
            cell.suitability[objectData.type] > suitabilityThreshold * 0.7) {
          newMask[idx] = 1;
        }
      }
    }
    
    // Update the mask
    mask.cells = newMask;
  }
}

/**
 * Create a clustered distribution mask
 * @param {object} objectData - Object data from the prompt
 * @param {object} mask - Placement mask data
 * @param {object} grid - Grid system with terrain data
 */
function createClusteredDistributionMask(objectData, mask, grid) {
  // Clustered distribution creates concentrated groups of objects
  
  // Find cells with high suitability to use as cluster centers
  const clusterCenters = [];
  const suitabilityThreshold = 0.6;
  
  for (let i = 0; i < grid.cells.length; i++) {
    const cell = grid.cells[i];
    const suitability = cell.suitability[objectData.type] || 0;
    
    if (suitability > suitabilityThreshold) {
      clusterCenters.push(cell);
    }
  }
  
  // Sort centers by suitability (highest first)
  clusterCenters.sort((a, b) => 
    (b.suitability[objectData.type] || 0) - (a.suitability[objectData.type] || 0)
  );
  
  // Limit to a reasonable number of clusters
  const maxClusters = 5;
  const finalCenters = clusterCenters.slice(0, maxClusters);
  
  // Create clusters around the centers
  const clusterRadius = grid.width * 0.1; // 10% of map width
  
  for (const center of finalCenters) {
    // Get cells within cluster radius
    const clusterCells = grid.getCellsInRadius(center.centerX, center.centerY, clusterRadius);
    
    // Activate cells with probability based on:
    // 1. Distance from center (closer = higher probability)
    // 2. Suitability (higher = higher probability)
    for (const cell of clusterCells) {
      const distance = Math.sqrt(
        Math.pow(cell.centerX - center.centerX, 2) + 
        Math.pow(cell.centerY - center.centerY, 2)
      );
      
      const distanceFactor = 1.0 - (distance / clusterRadius);
      const suitability = cell.suitability[objectData.type] || 0;
      
      // Calculate placement probability
      const probability = distanceFactor * suitability;
      
      if (Math.random() < probability) {
        const idx = cell.gridY * grid.gridSize + cell.gridX;
        mask.cells[idx] = 1;
      }
    }
  }
}

/**
 * Create a random distribution mask
 * @param {object} objectData - Object data from the prompt
 * @param {object} mask - Placement mask data
 * @param {object} grid - Grid system with terrain data
 */
function createRandomDistributionMask(objectData, mask, grid) {
  // Random distribution places objects based purely on suitability
  // with no additional patterns
  
  for (let i = 0; i < grid.cells.length; i++) {
    const cell = grid.cells[i];
    const suitability = cell.suitability[objectData.type] || 0;
    
    // Use suitability as probability
    if (Math.random() < suitability) {
      mask.cells[i] = 1;
    }
  }
}

/**
 * Create a water distribution mask (objects in or near water)
 * @param {object} objectData - Object data from the prompt
 * @param {object} mask - Placement mask data
 * @param {object} grid - Grid system with terrain data
 */
function createWaterDistributionMask(objectData, mask, grid) {
  // Water distribution places objects in water or along shorelines
  
  for (let i = 0; i < grid.cells.length; i++) {
    const cell = grid.cells[i];
    const suitability = cell.suitability[objectData.type] || 0;
    
    // Check if cell is water or near water
    const isWater = cell.properties.height < 0.1;
    
    // For objects that require deep water
    const isDeepWater = cell.properties.height < 0.05;
    
    // For objects that require water edges
    const isWaterEdge = !isWater && grid.getNeighbors(cell).some(n => 
      n.properties.height < 0.1
    );
    
    let waterSuitability = 0;
    
    // Get object definition and subtype rules
    const objectDef = objectDefinitions[objectData.type];
    const subTypeRules = objectDef?.subtypes[objectData.subType]?.customRules || {};
    
    // Adjust suitability based on water requirements
    if (subTypeRules.requireDeepWater && isDeepWater) {
      waterSuitability = suitability;
    } else if (subTypeRules.requireWaterEdge && isWaterEdge) {
      waterSuitability = suitability;
    } else if (!subTypeRules.requireDeepWater && !subTypeRules.requireWaterEdge && isWater) {
      waterSuitability = suitability;
    } else {
      waterSuitability = 0; // Not suitable for this water object
    }
    
    // Apply water suitability as probability
    if (Math.random() < waterSuitability) {
      mask.cells[i] = 1;
    }
  }
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} - Distance between the points
 */
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Check if a cell has a specific terrain feature
 * @param {object} cell - Grid cell
 * @param {string} terrainType - Required terrain type
 * @returns {boolean} - True if the cell has the terrain feature
 */
function cellHasTerrainFeature(cell, terrainType) {
  const features = cell.properties.terrainFeatures;
  
  switch (terrainType) {
    case 'mountains':
      return features.elevationClass === 'highland' && features.slope > 0.2;
      
    case 'hills':
      return features.elevationClass === 'midland' && features.slope > 0.1;
      
    case 'flatlands':
      return features.isFlat;
      
    case 'river':
    case 'lake':
      return cell.properties.height < 0.1;
      
    case 'forest':
      // In a real implementation, this would check for existing forest cover
      // For now, just use suitable areas for trees
      return cell.properties.slope < 0.15 && 
             cell.properties.height > 0.05 && 
             cell.properties.height < 0.8;
      
    default:
      return false;
  }
}

module.exports = {
  generatePlacementMasks
}; 