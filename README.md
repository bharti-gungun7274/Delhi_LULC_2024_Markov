# Delhi 2024 LULC — Dynamic World & Markov Chain Preparation

## Project Overview

This project prepares a 2024 Land Use/Land Cover (LULC) dataset for Delhi for subsequent Markov Chain-based land-use change analysis.

The workflow combines Google Earth Engine (GEE), Google Dynamic World, QGIS, and independent point-based validation.

---

## Workflow

GEE
↓
Dynamic World 2024
↓
Delhi boundary
↓
10 m LULC raster
↓
GeoTIFF export
↓
QGIS processing
↓
NoData correction (255)
↓
240-point validation
↓
Confusion Matrix
↓
Accuracy Assessment
↓
Area Statistics
↓
Markov Chain Analysis

---

## Software and Tools

- Google Earth Engine (GEE)
- Google Dynamic World
- QGIS
- Python / VS Code
- Git / GitHub
- GDAL-based raster processing

---

## 1. Dynamic World LULC

The 2024 LULC dataset was derived from Google Dynamic World in Google Earth Engine.

Dynamic World provides 10 m land-cover predictions with the following class labels:

| Value | Class |
|---|---|
| 0 | Water |
| 1 | Trees |
| 2 | Grass |
| 3 | Flooded vegetation |
| 4 | Crops |
| 5 | Shrub & scrub |
| 6 | Built-up |
| 7 | Bare ground |
| 8 | Snow & ice |

The GEE script used for the workflow is stored in:

`01_GEE/Delhi_LULC_2024_DynamicWorld.js`

---

## 2. Final LULC Raster

The final raster was exported as GeoTIFF at 10 m spatial resolution.

CRS:

`EPSG:32643 — WGS 84 / UTM Zone 43N`

The raster contains Dynamic World classes 0–8.

A value of `255` was assigned as NoData for pixels outside the Delhi study boundary during QGIS raster processing.

Final raster:

`Delhi_LULC_2024_FINAL_NODATA.tif`

The TIFF is intentionally excluded from Git tracking because of its large file size.

---

## 3. QGIS Processing

QGIS was used for:

- inspecting the exported raster
- checking spatial resolution and CRS
- preparing the final raster
- assigning 255 as NoData
- creating validation points
- checking Dynamic World classes against reference classes
- preparing the final validation dataset
- calculating LULC area statistics

The QGIS project is stored in:

`02_QGIS/Delhi_LULC_2024_Markov.qgz`

---

## 4. Validation

A total of 240 validation points were assessed.

The Dynamic World class at each point was compared with a manually checked reference class.

The final validation dataset is:

`03_VALIDATION/markov_validation_csv.csv`

The validation report is:

`03_VALIDATION/Delhi_LULC_2024_Validation_Report_Final.pdf`

The final validation produced:

- Overall Accuracy: 99.17%
- Cohen's Kappa: 0.990
- Correct classifications: 238/240
- Misclassifications: 2/240

The two observed errors were:

1. Crops → Water
2. Built-up → Bare ground

These results indicate very strong agreement between Dynamic World labels and the independently checked reference points. The results should nevertheless be interpreted in the context of the stratified validation sample and its sample size.

---

## 5. Area Statistics

Area statistics were calculated from the final 10 m LULC raster.

The area statistics table is stored in:

`04_STATISTICS/Delhi_LULC_2024_Area_Statistics.xlsx`

Each pixel represents:

10 m × 10 m = 100 m²

The statistics provide pixel counts and corresponding areas for each LULC class.

---

## 6. Class Codebook

The Dynamic World class definitions used in this project are documented in:

`05_DOCUMENTATION/Delhi_LULC_2024_Class_Codebook1.txt`

---

## 7. Markov Chain Preparation

The validated 2024 LULC raster and area statistics form the baseline dataset for future Markov Chain analysis.

The `06_MARKOV` directory will contain:

- transition matrices
- transition probability matrices
- LULC change calculations
- Markov Chain outputs
- future LULC prediction results

Markov analysis will require additional historical LULC maps, such as 2018 or another earlier reference year.

---

## Repository Structure

```text
Delhi_LULC_2024_Markov_Input/
│
├── .gitignore
├── README.md
├── Delhi_LULC_2024_FINAL_NODATA.tif
│
├── 01_GEE/
│   └── Delhi_LULC_2024_DynamicWorld.js
│
├── 02_QGIS/
│   └── Delhi_LULC_2024_Markov.qgz
│
├── 03_VALIDATION/
│   ├── Delhi_LULC_2024_Validation_Report_Final.pdf
│   └── markov_validation_csv.csv
│
├── 04_STATISTICS/
│   └── Delhi_LULC_2024_Area_Statistics.xlsx
│
├── 05_DOCUMENTATION/
│   └── Delhi_LULC_2024_Class_Codebook1.txt
│
└── 06_MARKOV/