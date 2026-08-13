// ============================================================
// DELHI LULC 2024 — FINAL CLEAN VERSION
// 0 = Water
// 1–8 = Other Dynamic World classes
// 255 = Outside Delhi
// ============================================================

// 1. Delhi boundary
var admin2 = ee.FeatureCollection('FAO/GAUL/2015/level2');

var delhi = admin2.filter(
  ee.Filter.eq('ADM1_NAME', 'Delhi')
);

var delhiGeom = delhi.geometry();


// ============================================================
// 2. Dynamic World 2024
// ============================================================

var dw2024 = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
  .filterBounds(delhiGeom)
  .filterDate('2024-01-01', '2025-01-01')
  .select('label')
  .mode();


// ============================================================
// 3. Create explicit background
// ============================================================

// First create water/LULC image
var lulc = dw2024.toByte();

// Keep LULC only inside Delhi
var delhiLulc = lulc.updateMask(
  ee.Image.constant(1).clip(delhiGeom)
);

// Fill everything else in the export rectangle with 255
var finalLulc = delhiLulc.unmask(255).toByte();


// ============================================================
// 4. Export rectangle = Delhi bounding box
// ============================================================

var exportRegion = delhiGeom.bounds();


// ============================================================
// 5. Display
// ============================================================

Map.centerObject(delhiGeom, 10);

var palette = [
  '419BDF', // 0 Water
  '397D49', // 1 Trees
  '88B053', // 2 Grass
  '7A87C6', // 3 Flooded vegetation
  'E49635', // 4 Crops
  'DFC35A', // 5 Shrub & scrub
  'C4281B', // 6 Built-up
  'A59B8F', // 7 Bare ground
  'B39FE1', // 8 Snow & ice
  'FFFFFF'  // 255 Outside Delhi
];

Map.addLayer(
  finalLulc,
  {
    min: 0,
    max: 255,
    palette: palette
  },
  'Delhi LULC 2024 FINAL'
);

Map.addLayer(
  delhi.style({
    color: '000000',
    fillColor: '00000000',
    width: 2
  }),
  {},
  'Delhi Boundary'
);


// ============================================================
// 6. EXPORT
// ============================================================

Export.image.toDrive({
  image: finalLulc,

  description: 'Delhi_LULC_2024_FINAL',

  folder: 'Delhi_LULC_for_Markov',

  fileNamePrefix: 'delhi_lulc_2024_FINAL',

  region: exportRegion,

  scale: 10,

  crs: 'EPSG:32643',

  maxPixels: 1e10,

  fileFormat: 'GeoTIFF'
});
// ============================================================
// CHECK DELHI BOUNDARY AREA
// ============================================================

var delhiAreaKm2 = delhiGeom.area().divide(1e6);

print('Delhi GAUL area (km²):', delhiAreaKm2);
print('Delhi boundary:', delhi);
// ============================================================
// 2024 LULC AREA BY CLASS
// ============================================================

var lulc2024 = dw2024.toByte();

var pixelArea = ee.Image.pixelArea();

var areaImage = pixelArea.addBands(lulc2024);

var areaStats = areaImage.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'class'
  }),
  geometry: delhiGeom,
  scale: 10,
  maxPixels: 1e10
});

print('2024 LULC area statistics:', areaStats);


// Convert m² → km²
var groups = ee.List(areaStats.get('groups'));

var areaTable = ee.FeatureCollection(
  groups.map(function(item) {

    item = ee.Dictionary(item);

    var classValue = item.get('class');

    var areaKm2 = ee.Number(item.get('sum'))
      .divide(1e6);

    return ee.Feature(null, {
      'Class': classValue,
      'Area_km2': areaKm2
    });
  })
);

print('2024 LULC Area (km²):', areaTable);
areaTable.evaluate(function(fc) {
  print('===== 2024 LULC AREA =====');

  fc.features.forEach(function(f) {
    print(
      'Class ' + f.properties.Class +
      ' : ' + f.properties.Area_km2 + ' km²'
    );
  });
});
// ============================================================
// 2024 LULC VALIDATION POINTS — CLEAN VERSION
// ============================================================

// Keep ONLY Dynamic World classes 0–7.
// This removes class 8 (snow/ice) and 99 (outside/background).
var lulc2024 = dw2024
  .updateMask(
    dw2024.gte(0).and(dw2024.lte(7))
  )
  .toByte();


// ------------------------------------------------------------
// Create 30 validation points for each class
// ------------------------------------------------------------

var validationPoints = lulc2024.stratifiedSample({
  numPoints: 30,
  classBand: 'label',

  classValues: [0, 1, 2, 3, 4, 5, 6, 7],

  classPoints: [30, 30, 30, 30, 30, 30, 30, 30],

  region: delhiGeom,

  scale: 10,

  seed: 2024,

  dropNulls: true,

  geometries: true
});


// ------------------------------------------------------------
// Add useful information to every point
// ------------------------------------------------------------

var validationPointsWithCoords =
  validationPoints.map(function(feature) {

    var coords = feature.geometry().coordinates();

    return feature.set({

      'Point_ID': feature.id(),

      'Longitude': coords.get(0),

      'Latitude': coords.get(1),

      'DW_Class': feature.get('label'),

      'Reference_Class': -1,

      'Confidence': 'Not checked'

    });

  });


// ------------------------------------------------------------
// Check total number of points
// ------------------------------------------------------------

print(
  'TOTAL 2024 VALIDATION POINTS:',
  validationPointsWithCoords.size()
);


// ------------------------------------------------------------
// Check points per class
// ------------------------------------------------------------

print(
  'POINTS PER CLASS:',
  validationPointsWithCoords
    .aggregate_histogram('DW_Class')
);


// ------------------------------------------------------------
// Display validation points
// ------------------------------------------------------------

Map.addLayer(
  validationPointsWithCoords,
  {color: 'FF00FF'},
  '2024 Validation Points'
);


// ------------------------------------------------------------
// Export validation points
// ------------------------------------------------------------

Export.table.toDrive({

  collection: validationPointsWithCoords,

  description:
    'Delhi_LULC_2024_Validation_Points_FINAL',

  folder:
    'Delhi_LULC_Validation',

  fileNamePrefix:
    'Delhi_LULC_2024_Validation_Points_FINAL',

  fileFormat:
    'CSV'

});