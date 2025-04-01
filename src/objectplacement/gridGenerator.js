/**
 * Grid Generator
 * Creates a grid system for object placement
 */

/**
 * Create a grid system for the map
 * @param {number} mapWidth - Width of the map in pixels
 * @param {number} mapHeight - Height of the map in pixels
 * @param {number} gridSize - Number of grid cells (e.g., 1024 for a 1024x1024 grid)
 * @returns {object} - Grid data structure
 */
function createGrid(mapWidth, mapHeight, gridSize) {
  console.log(`Creating grid system: ${mapWidth}x${mapHeight} map with ${gridSize}x${gridSize} grid`);
  
  // Calculate cell dimensions
  const cellWidth = mapWidth / gridSize;
  const cellHeight = mapHeight / gridSize;
  
  // Initialize the grid data structure
  const grid = {
    width: mapWidth,
    height: mapHeight,
    gridSize: gridSize,
    cellWidth: cellWidth,
    cellHeight: cellHeight,
    cells: [],
    
    // Helper method to get cell at specific coordinates
    getCellAt: function(x, y) {
      const gridX = Math.floor(x / this.cellWidth);
      const gridY = Math.floor(y / this.cellHeight);
      
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        return this.cells[gridY * gridSize + gridX];
      }
      
      return null;
    },
    
    // Helper method to get cell at grid indices
    getCellByIndices: function(gridX, gridY) {
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        return this.cells[gridY * gridSize + gridX];
      }
      
      return null;
    },
    
    // Helper method to get neighboring cells
    getNeighbors: function(cell) {
      const neighbors = [];
      const directions = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0],           [1, 0],
        [-1, 1],  [0, 1],  [1, 1]
      ];
      
      for (const [dx, dy] of directions) {
        const neighborX = cell.gridX + dx;
        const neighborY = cell.gridY + dy;
        const neighbor = this.getCellByIndices(neighborX, neighborY);
        
        if (neighbor) {
          neighbors.push(neighbor);
        }
      }
      
      return neighbors;
    },
    
    // Helper method to get cells within a radius
    getCellsInRadius: function(centerX, centerY, radius) {
      const cells = [];
      const centerGridX = Math.floor(centerX / this.cellWidth);
      const centerGridY = Math.floor(centerY / this.cellHeight);
      const radiusInCells = Math.ceil(radius / Math.min(this.cellWidth, this.cellHeight));
      
      for (let dy = -radiusInCells; dy <= radiusInCells; dy++) {
        for (let dx = -radiusInCells; dx <= radiusInCells; dx++) {
          const gridX = centerGridX + dx;
          const gridY = centerGridY + dy;
          
          if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            const cell = this.getCellByIndices(gridX, gridY);
            
            // Check if the cell is within the radius
            const cellCenterX = (gridX + 0.5) * this.cellWidth;
            const cellCenterY = (gridY + 0.5) * this.cellHeight;
            const distance = Math.sqrt(
              Math.pow(cellCenterX - centerX, 2) + 
              Math.pow(cellCenterY - centerY, 2)
            );
            
            if (distance <= radius) {
              cells.push(cell);
            }
          }
        }
      }
      
      return cells;
    }
  };
  
  // Initialize all cells
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = {
        gridX: x,
        gridY: y,
        x: x * cellWidth,
        y: y * cellHeight,
        width: cellWidth,
        height: cellHeight,
        centerX: (x + 0.5) * cellWidth,
        centerY: (y + 0.5) * cellHeight,
        objects: [], // Objects placed in this cell
        properties: {}, // Properties of this cell (height, slope, etc.)
        suitability: {} // Suitability scores for different object types
      };
      
      grid.cells.push(cell);
    }
  }
  
  console.log(`Grid created with ${grid.cells.length} cells`);
  return grid;
}

module.exports = {
  createGrid
}; 