/**
 * Terrain Analyzer
 * Analyzes heightmap data to calculate terrain properties
 */

/**
 * Calculate height and slope values for each grid cell
 * @param {object} heightMap - Height map data
 * @param {object} grid - Grid system
 * @returns {object} - Grid with updated terrain data
 */
function calculateHeightAndSlope(heightMap, grid) {
  console.log('Calculating height and slope for each grid cell');
  
  // Process each cell in the grid
  for (const cell of grid.cells) {
    // Sample multiple points within the cell to get more accurate height data
    const samples = [];
    const sampleCount = 5; // Number of samples per dimension
    
    for (let sy = 0; sy < sampleCount; sy++) {
      for (let sx = 0; sx < sampleCount; sx++) {
        const sampleX = cell.x + (sx + 0.5) * (cell.width / sampleCount);
        const sampleY = cell.y + (sy + 0.5) * (cell.height / sampleCount);
        
        // Get the height at this sample point
        const height = heightMap.getHeight(sampleX, sampleY);
        samples.push(height);
      }
    }
    
    // Calculate average height for this cell
    const avgHeight = samples.reduce((sum, h) => sum + h, 0) / samples.length;
    
    // Calculate min and max height for slope determination
    const minHeight = Math.min(...samples);
    const maxHeight = Math.max(...samples);
    
    // Calculate slope as the difference between max and min height
    // divided by the cell width (simplified approximation)
    const slope = (maxHeight - minHeight) / cell.width;
    
    // Calculate slope in different directions to detect ridges, valleys, etc.
    const slopes = calculateDirectionalSlopes(cell, grid, heightMap);
    
    // Store terrain data in the cell
    cell.properties.height = avgHeight;
    cell.properties.minHeight = minHeight;
    cell.properties.maxHeight = maxHeight;
    cell.properties.slope = slope;
    cell.properties.slopes = slopes;
    
    // Classify terrain features
    cell.properties.terrainFeatures = classifyTerrainFeatures(cell, grid);
  }
  
  console.log('Terrain analysis complete');
  return grid;
}

/**
 * Calculate slopes in different directions
 * @param {object} cell - Grid cell
 * @param {object} grid - Grid system
 * @param {object} heightMap - Height map data
 * @returns {object} - Slope data in different directions
 */
function calculateDirectionalSlopes(cell, grid, heightMap) {
  const slopes = {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
    northeast: 0,
    northwest: 0,
    southeast: 0,
    southwest: 0
  };
  
  // Get height at the center of this cell
  const centerHeight = heightMap.getHeight(cell.centerX, cell.centerY);
  
  // Calculate slopes in cardinal and ordinal directions
  const directions = {
    north: { dx: 0, dy: -1 },
    south: { dx: 0, dy: 1 },
    east: { dx: 1, dy: 0 },
    west: { dx: -1, dy: 0 },
    northeast: { dx: 1, dy: -1 },
    northwest: { dx: -1, dy: -1 },
    southeast: { dx: 1, dy: 1 },
    southwest: { dx: -1, dy: 1 }
  };
  
  for (const [direction, delta] of Object.entries(directions)) {
    const neighborX = cell.gridX + delta.dx;
    const neighborY = cell.gridY + delta.dy;
    
    const neighbor = grid.getCellByIndices(neighborX, neighborY);
    if (neighbor) {
      const neighborHeight = heightMap.getHeight(neighbor.centerX, neighbor.centerY);
      const distance = direction.includes('north') || direction.includes('south') || 
                       direction.includes('east') || direction.includes('west')
                       ? cell.width : Math.sqrt(2 * cell.width * cell.width);
      
      slopes[direction] = (neighborHeight - centerHeight) / distance;
    }
  }
  
  return slopes;
}

/**
 * Classify terrain features based on cell properties
 * @param {object} cell - Grid cell
 * @param {object} grid - Grid system
 * @returns {object} - Terrain feature classifications
 */
function classifyTerrainFeatures(cell, grid) {
  const features = {};
  
  // Get neighbors to detect local terrain features
  const neighbors = grid.getNeighbors(cell);
  
  // Basic terrain feature classification (simplified)
  // Is this a peak? (higher than all neighbors)
  features.isPeak = neighbors.every(neighbor => 
    neighbor.properties && neighbor.properties.height < cell.properties.height
  );
  
  // Is this a valley? (lower than all neighbors)
  features.isValley = neighbors.every(neighbor => 
    neighbor.properties && neighbor.properties.height > cell.properties.height
  );
  
  // Is this a ridge? (higher than neighbors in opposing directions)
  const ridgeDirections = [
    ['north', 'south'],
    ['east', 'west'],
    ['northeast', 'southwest'],
    ['northwest', 'southeast']
  ];
  
  features.isRidge = ridgeDirections.some(([dir1, dir2]) => {
    const slopes = cell.properties.slopes;
    return slopes && slopes[dir1] * slopes[dir2] < 0; // Opposite signs indicate a ridge
  });
  
  // Is this a flat area? (very low slope)
  features.isFlat = cell.properties.slope < 0.05; // 5% threshold for "flat"
  
  // Is this a steep area? (high slope)
  features.isSteep = cell.properties.slope > 0.3; // 30% threshold for "steep"
  
  // Elevation-based classification
  if (cell.properties.height < 0.2) {
    features.elevationClass = 'lowland';
  } else if (cell.properties.height < 0.6) {
    features.elevationClass = 'midland';
  } else {
    features.elevationClass = 'highland';
  }
  
  return features;
}

module.exports = {
  calculateHeightAndSlope
}; 