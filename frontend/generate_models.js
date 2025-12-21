// Generate realistic vehicle models for each make
const modelsData = [
    // Toyota models
    { modelID: 1, modelName: "Camry", makeID: 29, makeName: "Toyota" },
    { modelID: 2, modelName: "Corolla", makeID: 29, makeName: "Toyota" },
    { modelID: 3, modelName: "RAV4", makeID: 29, makeName: "Toyota" },
    { modelID: 4, modelName: "Tacoma", makeID: 29, makeName: "Toyota" },
    { modelID: 5, modelName: "Tundra", makeID: 29, makeName: "Toyota" },
    { modelID: 6, modelName: "Highlander", makeID: 29, makeName: "Toyota" },
    { modelID: 7, modelName: "4Runner", makeID: 29, makeName: "Toyota" },
    { modelID: 8, modelName: "Sienna", makeID: 29, makeName: "Toyota" },

    // Ford models
    { modelID: 9, modelName: "F-150", makeID: 9, makeName: "Ford" },
    { modelID: 10, modelName: "Mustang", makeID: 9, makeName: "Ford" },
    { modelID: 11, modelName: "Explorer", makeID: 9, makeName: "Ford" },
    { modelID: 12, modelName: "Escape", makeID: 9, makeName: "Ford" },
    { modelID: 13, modelName: "Focus", makeID: 9, makeName: "Ford" },
    { modelID: 14, modelName: "Fusion", makeID: 9, makeName: "Ford" },
    { modelID: 15, modelName: "Edge", makeID: 9, makeName: "Ford" },
    { modelID: 16, modelName: "Ranger", makeID: 9, makeName: "Ford" },

    // Chevrolet models
    { modelID: 17, modelName: "Silverado", makeID: 6, makeName: "Chevrolet" },
    { modelID: 18, modelName: "Malibu", makeID: 6, makeName: "Chevrolet" },
    { modelID: 19, modelName: "Equinox", makeID: 6, makeName: "Chevrolet" },
    { modelID: 20, modelName: "Tahoe", makeID: 6, makeName: "Chevrolet" },
    { modelID: 21, modelName: "Suburban", makeID: 6, makeName: "Chevrolet" },
    { modelID: 22, modelName: "Camaro", makeID: 6, makeName: "Chevrolet" },
    { modelID: 23, modelName: "Traverse", makeID: 6, makeName: "Chevrolet" },
    { modelID: 24, modelName: "Colorado", makeID: 6, makeName: "Chevrolet" },

    // Honda models
    { modelID: 25, modelName: "Civic", makeID: 11, makeName: "Honda" },
    { modelID: 26, modelName: "Accord", makeID: 11, makeName: "Honda" },
    { modelID: 27, modelName: "CR-V", makeID: 11, makeName: "Honda" },
    { modelID: 28, modelName: "Pilot", makeID: 11, makeName: "Honda" },
    { modelID: 29, modelName: "Odyssey", makeID: 11, makeName: "Honda" },
    { modelID: 30, modelName: "Fit", makeID: 11, makeName: "Honda" },
    { modelID: 31, modelName: "HR-V", makeID: 11, makeName: "Honda" },
    { modelID: 32, modelName: "Ridgeline", makeID: 11, makeName: "Honda" },

    // Nissan models
    { modelID: 33, modelName: "Altima", makeID: 22, makeName: "Nissan" },
    { modelID: 34, modelName: "Sentra", makeID: 22, makeName: "Nissan" },
    { modelID: 35, modelName: "Rogue", makeID: 22, makeName: "Nissan" },
    { modelID: 36, modelName: "Pathfinder", makeID: 22, makeName: "Nissan" },
    { modelID: 37, modelName: "Frontier", makeID: 22, makeName: "Nissan" },
    { modelID: 38, modelName: "Maxima", makeID: 22, makeName: "Nissan" },
    { modelID: 39, modelName: "Murano", makeID: 22, makeName: "Nissan" },
    { modelID: 40, modelName: "Titan", makeID: 22, makeName: "Nissan" },

    // Dodge models
    { modelID: 41, modelName: "Charger", makeID: 8, makeName: "Dodge" },
    { modelID: 42, modelName: "Challenger", makeID: 8, makeName: "Dodge" },
    { modelID: 43, modelName: "Durango", makeID: 8, makeName: "Dodge" },
    { modelID: 44, modelName: "Grand Caravan", makeID: 8, makeName: "Dodge" },
    { modelID: 45, modelName: "Journey", makeID: 8, makeName: "Dodge" },
    { modelID: 46, modelName: "Ram 1500", makeID: 8, makeName: "Dodge" },

    // GMC models
    { modelID: 47, modelName: "Sierra", makeID: 10, makeName: "GMC" },
    { modelID: 48, modelName: "Terrain", makeID: 10, makeName: "GMC" },
    { modelID: 49, modelName: "Acadia", makeID: 10, makeName: "GMC" },
    { modelID: 50, modelName: "Yukon", makeID: 10, makeName: "GMC" },
    { modelID: 51, modelName: "Canyon", makeID: 10, makeName: "GMC" },

    // Jeep models
    { modelID: 52, modelName: "Wrangler", makeID: 14, makeName: "Jeep" },
    { modelID: 53, modelName: "Grand Cherokee", makeID: 14, makeName: "Jeep" },
    { modelID: 54, modelName: "Cherokee", makeID: 14, makeName: "Jeep" },
    { modelID: 55, modelName: "Compass", makeID: 14, makeName: "Jeep" },
    { modelID: 56, modelName: "Renegade", makeID: 14, makeName: "Jeep" },
    { modelID: 57, modelName: "Gladiator", makeID: 14, makeName: "Jeep" },

    // BMW models
    { modelID: 58, modelName: "3 Series", makeID: 3, makeName: "BMW" },
    { modelID: 59, modelName: "5 Series", makeID: 3, makeName: "BMW" },
    { modelID: 60, modelName: "X3", makeID: 3, makeName: "BMW" },
    { modelID: 61, modelName: "X5", makeID: 3, makeName: "BMW" },
    { modelID: 62, modelName: "7 Series", makeID: 3, makeName: "BMW" },

    // Ram models
    { modelID: 63, modelName: "1500", makeID: 26, makeName: "Ram" },
    { modelID: 64, modelName: "2500", makeID: 26, makeName: "Ram" },
    { modelID: 65, modelName: "3500", makeID: 26, makeName: "Ram" },

    // Hyundai models
    { modelID: 66, modelName: "Elantra", makeID: 12, makeName: "Hyundai" },
    { modelID: 67, modelName: "Sonata", makeID: 12, makeName: "Hyundai" },
    { modelID: 68, modelName: "Tucson", makeID: 12, makeName: "Hyundai" },
    { modelID: 69, modelName: "Santa Fe", makeID: 12, makeName: "Hyundai" },
    { modelID: 70, modelName: "Accent", makeID: 12, makeName: "Hyundai" },

    // Kia models
    { modelID: 71, modelName: "Optima", makeID: 15, makeName: "Kia" },
    { modelID: 72, modelName: "Sorento", makeID: 15, makeName: "Kia" },
    { modelID: 73, modelName: "Sportage", makeID: 15, makeName: "Kia" },
    { modelID: 74, modelName: "Soul", makeID: 15, makeName: "Kia" },
    { modelID: 75, modelName: "Forte", makeID: 15, makeName: "Kia" },
];

console.log(JSON.stringify(modelsData, null, 2));
