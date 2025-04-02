# Roam Map Builder

A procedural map generation pipeline for game development that converts text prompts into height maps, splat maps, and object placement maps.

## Overview

Roam Map Builder is a tool that takes text descriptions of landscapes and worlds and converts them into game-ready map data. It consists of three main components:

1. **Height Map Generation**: Converts text descriptions into topographic height maps.
2. **Splat Map Generation**: Creates texture/material splat maps based on terrain features.
3. **Object Placement**: Generates object placement maps for various game objects.

## Pipeline

The map generation pipeline follows these steps:

### Height Map Generation
- Input: Text prompt for map landscaping
- Process: Semantic topography mapping → Topographic map
- Topographic features: flatlands, hills, mountains

### Splat Map Generation
- Input: Text prompt for map landscaping
- Process: Semantic color mapping → Splat map
- Uses World Machine for processing

### Object Placement
- Input: Text prompt for approximate world
- Process: Text prompt → Grid generation → Object placement bitmap
- Steps:
  1. Divide base height/splat map into grid cells
  2. Assign each grid cell height and slope features
  3. Create placement masks for each object type based on terrain suitability

### Prerequisites

- Node.js (v14+)
- NPM

### Installation

```bash
git clone https://github.com/yourusername/Roam-map-builder.git
cd Roam-map-builder
npm install
```

### Usage

```bash
npm start
```

By default, the tool will use example prompts. To customize, modify the prompts in `src/index.js`:

```javascript
const landscapePrompt = "A hilly region with mountains in the north, a river running east to west, and flatlands in the south";
const worldPrompt = "A medieval village near the river, dense forests in the hills, scattered rocks in the mountains";
```

## Integration with External Tools

### CivitAI Game Landscape Heightmap Generator
For height map generation, the system can integrate with:
- [CivitAI Game Landscape Heightmap Generator](https://civitai.com/models/16826/game-landscape-heightmap-genrator)

### World Machine
For splat map generation and terrain processing:
- [World Machine](https://www.world-machine.com/)

## Examples

Example input:
```
Landscape prompt: "A mountainous region with a large central valley and a winding river"
World prompt: "A small town in the valley, dense pine forests on the mountain slopes, and scattered mining outposts"
```

Output:
- Height map: `output/heightmap.png`
- Splat map: `output/splatmap.png`
- Object placement maps:
  - Trees: `output/objects/tree_mask.png`
  - Buildings: `output/objects/building_mask.png`
  - Rocks: `output/objects/rock_mask.png`

## Project Structure

```
src/
├── heightmap/            # Height map generation
│   ├── heightMapGenerator.js
│   └── semanticTopographyMapper.js
├── splatmap/             # Splat map generation
│   ├── splatMapGenerator.js
│   └── semanticColorMapper.js
├── objectplacement/      # Object placement (focus)
│   ├── objectPlacementGenerator.js
│   ├── promptParser.js
│   ├── objectDefinitions.js
│   ├── gridGenerator.js
│   ├── terrainAnalyzer.js
│   └── placementMaskGenerator.js
├── utils/                # Utility functions
└── index.js              # Main entry point
```
