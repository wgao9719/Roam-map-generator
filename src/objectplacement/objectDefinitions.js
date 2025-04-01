/**
 * Object Definitions
 * Defines various game objects and their placement requirements
 */

const objectDefinitions = {
  // Tree-related objects
  tree: {
    name: 'Tree',
    category: 'vegetation',
    placementRules: {
      maxSlope: 0.15, // Maximum slope (15%)
      minHeight: 0.05, // Minimum normalized height (5%)
      maxHeight: 0.8, // Maximum normalized height (80%)
      avoidWater: true,
      minDistanceToSameType: 2, // Minimum distance to other trees in grid units
      canOverlap: false
    },
    defaultDistribution: 'natural',
    priority: 2, // Medium priority
    subtypes: {
      oak: {
        name: 'Oak Tree',
        scaling: { min: 0.8, max: 1.2 },
        customRules: {}
      },
      pine: {
        name: 'Pine Tree',
        scaling: { min: 0.9, max: 1.5 },
        customRules: {
          preferHigherElevation: true
        }
      },
      palm: {
        name: 'Palm Tree',
        scaling: { min: 0.9, max: 1.1 },
        customRules: {
          preferLowerElevation: true,
          preferBeaches: true
        }
      }
    }
  },
  
  // Rock/boulder objects
  rock: {
    name: 'Rock',
    category: 'terrain',
    placementRules: {
      maxSlope: 0.3, // Maximum slope (30%)
      minHeight: 0.0, // No minimum height
      maxHeight: 1.0, // Can be placed at any height
      avoidWater: true,
      minDistanceToSameType: 1,
      canOverlap: false
    },
    defaultDistribution: 'random',
    priority: 3, // Medium-high priority
    subtypes: {
      rock: {
        name: 'Small Rock',
        scaling: { min: 0.5, max: 1.0 },
        customRules: {}
      },
      boulder: {
        name: 'Boulder',
        scaling: { min: 1.0, max: 2.0 },
        customRules: {
          preferHigherElevation: true,
          preferSteepSlopes: true
        }
      }
    }
  },
  
  // Building/structure objects
  building: {
    name: 'Building',
    category: 'structure',
    placementRules: {
      maxSlope: 0.05, // Maximum slope (5%)
      minHeight: 0.1, // Minimum normalized height (10%)
      maxHeight: 0.5, // Maximum normalized height (50%)
      avoidWater: true,
      minDistanceToSameType: 2,
      canOverlap: false
    },
    defaultDistribution: 'clustered',
    priority: 1, // Highest priority (placed first)
    subtypes: {
      house: {
        name: 'House',
        scaling: { min: 0.8, max: 1.2 },
        customRules: {}
      },
      village: {
        name: 'Village',
        scaling: { min: 1.0, max: 1.0 }, // Village is a collection of houses
        customRules: {
          requireFlatArea: true,
          requireCluster: true,
          preferLowElevation: true
        }
      },
      town: {
        name: 'Town',
        scaling: { min: 1.0, max: 1.0 },
        customRules: {
          requireFlatArea: true,
          requireCluster: true,
          preferLowElevation: true,
          requireLargerArea: true
        }
      },
      city: {
        name: 'City',
        scaling: { min: 1.0, max: 1.0 },
        customRules: {
          requireFlatArea: true,
          requireCluster: true,
          preferLowElevation: true,
          requireLargerArea: true,
          requireWaterAccess: true
        }
      },
      farm: {
        name: 'Farm',
        scaling: { min: 0.9, max: 1.1 },
        customRules: {
          requireVeryFlatArea: true,
          preferLowElevation: true
        }
      }
    }
  },
  
  // Water-related objects
  waterObject: {
    name: 'Water Object',
    category: 'water',
    placementRules: {
      requireWater: true,
      minHeight: 0.0,
      maxHeight: 0.2,
      minDistanceToSameType: 3,
      canOverlap: true
    },
    defaultDistribution: 'water',
    priority: 2,
    subtypes: {
      boat: {
        name: 'Boat',
        scaling: { min: 0.8, max: 1.2 },
        customRules: {
          requireDeepWater: true
        }
      },
      dock: {
        name: 'Dock',
        scaling: { min: 0.9, max: 1.1 },
        customRules: {
          requireWaterEdge: true,
          requireProximityToBuildings: true
        }
      }
    }
  },
  
  // Vegetation objects (non-tree)
  vegetation: {
    name: 'Vegetation',
    category: 'vegetation',
    placementRules: {
      maxSlope: 0.2,
      minHeight: 0.05,
      maxHeight: 0.7,
      avoidWater: true,
      minDistanceToSameType: 0.5, // Can be placed closer together than trees
      canOverlap: true
    },
    defaultDistribution: 'natural',
    priority: 4, // Lower priority (placed after major elements)
    subtypes: {
      bush: {
        name: 'Bush',
        scaling: { min: 0.7, max: 1.3 },
        customRules: {}
      },
      grass: {
        name: 'Tall Grass',
        scaling: { min: 0.8, max: 1.2 },
        customRules: {
          canPlaceInLargeGroups: true
        }
      },
      flower: {
        name: 'Flower',
        scaling: { min: 0.9, max: 1.1 },
        customRules: {
          canPlaceInLargeGroups: true,
          preferSpecificElevationRange: { min: 0.2, max: 0.6 }
        }
      }
    }
  }
};

module.exports = {
  objectDefinitions
}; 