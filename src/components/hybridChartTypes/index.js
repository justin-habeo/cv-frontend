// src/components/hybridChartTypes/index.js

import { getLineChartOptions } from './lineChart';
import { getBarChartOptions } from './barChart';
import { getScatterChartOptions } from './scatterChart';
import { getAreaChartOptions } from './areaChart';
import { getHybridChartOptions } from './hybridChart';
import { getStackedAreaChartOptions } from './stackedAreaChart';
import { getMultiAxisLineChartOptions } from './multiAxisLineChart';
import { getCumulativeLineChartOptions } from './cumulativeLineChart';
import { getLineWithZonesChartOptions } from './lineWithZonesChart';
import { getBarLineCombinationChartOptions } from './barLineCombinationChart';
import { getWindRoseChartOptions } from './windRoseChart';
import { getScatterWithVisualMappingOptions } from './scatterWithVisualMappingChart';
import { getHeatmapChartOptions } from './heatmapChart';
import { getStackedColumnChartOptions } from './stackedColumnChart';
import { getAreaWithLineChartOptions } from './areaWithLineChart';
import { getLineWithThresholdChartOptions } from './lineWithThresholdChart';
import { getScatterWithSizeOptions } from './scatterWithSizeChart';
import { getDroughtStressIndicatorOptions } from './droughtStressIndicator';
import { getIrrigationTimingOptimizerOptions } from './irrigationTimingOptimizer';
import { getGDDAccumulationOptions } from './gddAccumulation';
import { getFrostRiskAssessmentOptions } from './frostRiskAssessment';
import { getWaterRequirementForecastOptions } from './waterRequirementForecast';
import { getWindRoseSprinklerEfficiencyOptions } from './windRoseSprinklerEfficiency';
import { getSoilTemperatureTrendsOptions } from './soilTemperatureTrends';
import { getHumidityDiseasePressureOptions } from './humidityDiseasePressure';
import { getRainfallIntensityRunoffRiskOptions } from './rainfallIntensityRunoffRisk';
import { getTurfStressIndexOptions } from './turfStressIndex';
import { getGreenSpeedPredictorOptions } from './greenSpeedPredictor';
import { getDiseasePressureForecastOptions } from './diseasePressureForecast';

const hybridChartTypesObject = {
  line: getLineChartOptions,
  bar: getBarChartOptions,
  scatter: getScatterChartOptions,
  area: getAreaChartOptions,
  hybrid: getHybridChartOptions,
  'stacked-area': getStackedAreaChartOptions,
  'multi-axis-line': getMultiAxisLineChartOptions,
  'cumulative-line': getCumulativeLineChartOptions,
  'line-with-zones': getLineWithZonesChartOptions,
  'bar-line-combination': getBarLineCombinationChartOptions,
  'wind-rose': getWindRoseChartOptions,
  'scatter-with-visual-mapping': getScatterWithVisualMappingOptions,
  heatmap: getHeatmapChartOptions,
  'stacked-column': getStackedColumnChartOptions,
  'area-with-line': getAreaWithLineChartOptions,
  'line-with-threshold': getLineWithThresholdChartOptions,
  'scatter-with-size': getScatterWithSizeOptions,
  'drought-stress-indicator': getDroughtStressIndicatorOptions,
  'irrigation-timing-optimizer': getIrrigationTimingOptimizerOptions,
  'gdd-accumulation': getGDDAccumulationOptions,
  'frost-risk-assessment': getFrostRiskAssessmentOptions,
  'water-requirement-forecast': getWaterRequirementForecastOptions,
  'wind-rose-sprinkler-efficiency': getWindRoseSprinklerEfficiencyOptions,
  'soil-temperature-trends': getSoilTemperatureTrendsOptions,
  'humidity-disease-pressure': getHumidityDiseasePressureOptions,
  'rainfall-intensity-runoff-risk': getRainfallIntensityRunoffRiskOptions,
  'turf-stress-index': getTurfStressIndexOptions,
  'green-speed-predictor': getGreenSpeedPredictorOptions,
  'disease-pressure-forecast': getDiseasePressureForecastOptions,
};

export const hybridChartTypesArray = Object.keys(hybridChartTypesObject);

export default hybridChartTypesObject;

// If you need to export individual functions as well, you can do so like this:
export {
  getLineChartOptions,
  getBarChartOptions,
  getScatterChartOptions,
  getAreaChartOptions,
  getHybridChartOptions,
  getStackedAreaChartOptions,
  getMultiAxisLineChartOptions,
  getCumulativeLineChartOptions,
  getLineWithZonesChartOptions,
  getBarLineCombinationChartOptions,
  getWindRoseChartOptions,
  getScatterWithVisualMappingOptions,
  getHeatmapChartOptions,
  getStackedColumnChartOptions,
  getAreaWithLineChartOptions,
  getLineWithThresholdChartOptions,
  getScatterWithSizeOptions,
  getDroughtStressIndicatorOptions,
  getIrrigationTimingOptimizerOptions,
  getGDDAccumulationOptions,
  getFrostRiskAssessmentOptions,
  getWaterRequirementForecastOptions,
  getWindRoseSprinklerEfficiencyOptions,
  getSoilTemperatureTrendsOptions,
  getHumidityDiseasePressureOptions,
  getRainfallIntensityRunoffRiskOptions,
  getTurfStressIndexOptions,
  getGreenSpeedPredictorOptions,
  getDiseasePressureForecastOptions,
};
