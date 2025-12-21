<?php
/**
 * Comprehensive Vehicle Models Data Generator
 * Based on industry-standard US vehicle makes and their popular models
 * This data represents the most common vehicles found in junkyards
 */

$models = [];
$modelID = 1;

// ACURA (makeID: 1)
$acuraModels = ['TL', 'TLX', 'MDX', 'RDX', 'ILX', 'TSX', 'Integra', 'Legend', 'CL', 'RL'];
foreach ($acuraModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 1, 'makeName' => 'Acura'];
}

// AUDI (makeID: 2)
$audiModels = ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'];
foreach ($audiModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 2, 'makeName' => 'Audi'];
}

// BMW (makeID: 3)
$bmwModels = ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6', 'X7', 'Z4', 'M3', 'M5'];
foreach ($bmwModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 3, 'makeName' => 'BMW'];
}

// BUICK (makeID: 4)
$buickModels = ['Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal', 'Century', 'LeSabre', 'Park Avenue'];
foreach ($buickModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 4, 'makeName' => 'Buick'];
}

// CADILLAC (makeID: 5)
$cadillacModels = ['Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5', 'CTS', 'SRX', 'DeVille', 'Eldorado'];
foreach ($cadillacModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 5, 'makeName' => 'Cadillac'];
}

// CHEVROLET (makeID: 6)
$chevroletModels = ['Silverado 1500', 'Silverado 2500', 'Malibu', 'Equinox', 'Tahoe', 'Suburban', 'Camaro', 'Traverse', 'Colorado', 'Blazer', 'Impala', 'Cruze', 'Trax', 'Corvette'];
foreach ($chevroletModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 6, 'makeName' => 'Chevrolet'];
}

// CHRYSLER (makeID: 7)
$chryslerModels = ['300', 'Pacifica', 'Town & Country', '200', 'Sebring', 'Voyager', 'Aspen', 'Concorde', 'PT Cruiser'];
foreach ($chryslerModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 7, 'makeName' => 'Chrysler'];
}

// DODGE (makeID: 8)
$dodgeModels = ['Charger', 'Challenger', 'Durango', 'Grand Caravan', 'Journey', 'Ram 1500', 'Ram 2500', 'Dakota', 'Nitro', 'Avenger', 'Caliber'];
foreach ($dodgeModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 8, 'makeName' => 'Dodge'];
}

// FORD (makeID: 9)
$fordModels = ['F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Focus', 'Fusion', 'Edge', 'Ranger', 'Expedition', 'Bronco', 'Taurus', 'Fiesta', 'Flex'];
foreach ($fordModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 9, 'makeName' => 'Ford'];
}

// GMC (makeID: 10)
$gmcModels = ['Sierra 1500', 'Sierra 2500', 'Terrain', 'Acadia', 'Yukon', 'Canyon', 'Savana', 'Envoy'];
foreach ($gmcModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 10, 'makeName' => 'GMC'];
}

// HONDA (makeID: 11)
$hondaModels = ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Fit', 'HR-V', 'Ridgeline', 'Passport', 'Element', 'Insight', 'Clarity'];
foreach ($hondaModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 11, 'makeName' => 'Honda'];
}

// HYUNDAI (makeID: 12)
$hyundaiModels = ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Palisade', 'Kona', 'Venue', 'Veloster'];
foreach ($hyundaiModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 12, 'makeName' => 'Hyundai'];
}

// INFINITI (makeID: 13)
$infinitiModels = ['Q50', 'Q60', 'QX50', 'QX60', 'QX80', 'G35', 'G37', 'FX35', 'FX45'];
foreach ($infinitiModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 13, 'makeName' => 'Infiniti'];
}

// JEEP (makeID: 14)
$jeepModels = ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Patriot', 'Liberty', 'Commander'];
foreach ($jeepModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 14, 'makeName' => 'Jeep'];
}

// KIA (makeID: 15)
$kiaModels = ['Optima', 'Sorento', 'Sportage', 'Soul', 'Forte', 'Telluride', 'Seltos', 'Rio', 'Stinger', 'Sedona'];
foreach ($kiaModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 15, 'makeName' => 'Kia'];
}

// LEXUS (makeID: 16)
$lexusModels = ['ES', 'IS', 'GS', 'LS', 'RX', 'NX', 'GX', 'LX', 'UX'];
foreach ($lexusModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 16, 'makeName' => 'Lexus'];
}

// LINCOLN (makeID: 17)
$lincolnModels = ['Navigator', 'Aviator', 'Nautilus', 'Corsair', 'MKZ', 'MKX', 'MKC', 'Town Car'];
foreach ($lincolnModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 17, 'makeName' => 'Lincoln'];
}

// MAZDA (makeID: 18)
$mazdaModels = ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'CX-30', 'MX-5 Miata', 'RX-8'];
foreach ($mazdaModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 18, 'makeName' => 'Mazda'];
}

// MERCEDES-BENZ (makeID: 19)
$mercedesModels = ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA'];
foreach ($mercedesModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 19, 'makeName' => 'Mercedes-Benz'];
}

// MERCURY (makeID: 20)
$mercuryModels = ['Grand Marquis', 'Sable', 'Mountaineer', 'Mariner', 'Milan'];
foreach ($mercuryModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 20, 'makeName' => 'Mercury'];
}

// MITSUBISHI (makeID: 21)
$mitsubishiModels = ['Outlander', 'Eclipse Cross', 'Mirage', 'Lancer', 'Galant', 'Eclipse'];
foreach ($mitsubishiModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 21, 'makeName' => 'Mitsubishi'];
}

// NISSAN (makeID: 22)
$nissanModels = ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Frontier', 'Maxima', 'Murano', 'Titan', 'Versa', 'Armada', '370Z', 'Kicks'];
foreach ($nissanModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 22, 'makeName' => 'Nissan'];
}

// OLDSMOBILE (makeID: 23)
$oldsmobileModels = ['Alero', 'Aurora', 'Bravada', 'Cutlass', 'Intrigue', 'Silhouette'];
foreach ($oldsmobileModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 23, 'makeName' => 'Oldsmobile'];
}

// PLYMOUTH (makeID: 24)
$plymouthModels = ['Voyager', 'Grand Voyager', 'Neon', 'Breeze'];
foreach ($plymouthModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 24, 'makeName' => 'Plymouth'];
}

// PONTIAC (makeID: 25)
$pontiacModels = ['Grand Am', 'Grand Prix', 'Bonneville', 'G6', 'Vibe', 'Sunfire', 'Montana'];
foreach ($pontiacModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 25, 'makeName' => 'Pontiac'];
}

// RAM (makeID: 26)
$ramModels = ['1500', '2500', '3500', 'ProMaster'];
foreach ($ramModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 26, 'makeName' => 'Ram'];
}

// SATURN (makeID: 27)
$saturnModels = ['Vue', 'Ion', 'Outlook', 'Aura', 'Sky'];
foreach ($saturnModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 27, 'makeName' => 'Saturn'];
}

// SUBARU (makeID: 28)
$subaruModels = ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Legacy', 'Ascent', 'WRX', 'BRZ'];
foreach ($subaruModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 28, 'makeName' => 'Subaru'];
}

// TOYOTA (makeID: 29)
$toyotaModels = ['Camry', 'Corolla', 'RAV4', 'Tacoma', 'Tundra', 'Highlander', '4Runner', 'Sienna', 'Prius', 'Avalon', 'Sequoia', 'Land Cruiser', 'Yaris', 'C-HR'];
foreach ($toyotaModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 29, 'makeName' => 'Toyota'];
}

// VOLKSWAGEN (makeID: 30)
$volkswagenModels = ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Beetle', 'Touareg', 'Arteon'];
foreach ($volkswagenModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 30, 'makeName' => 'Volkswagen'];
}

// VOLVO (makeID: 31)
$volvoModels = ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'];
foreach ($volvoModels as $model) {
    $models[] = ['modelID' => $modelID++, 'modelName' => $model, 'makeID' => 31, 'makeName' => 'Volvo'];
}

// Output as JSON
echo json_encode($models, JSON_PRETTY_PRINT);
echo "\n\n// Total models: " . count($models) . "\n";
?>
