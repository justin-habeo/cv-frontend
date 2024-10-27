/**
 * s10-smartgrow-frontend License
 * 
 * Copyright © 2024, Justin Morris Albertyn
 * 
 * Use of this software is restricted to projects where the copyright holder or authorized developer is directly involved.
 * For more details, see the LICENSE file in the project root.
 */

import SoilDataWidget from './SoilDataWidget/SoilDataWidget';
import WeatherChartWidget from './WeatherChartWidget/WeatherChartWidget';
import ManualDataEntryWidget from './ManualDataEntryWidget/ManualDataEntryWidget';
import NDVIChartWidget from './NDVIWidgets/NDVIChartWidget';
import NDVIImageryWidget from './NDVIWidgets/NDVIImageryWidget';
import NDVISummaryWidget from './NDVIWidgets/NDVISummaryWidget';
import HybridChartWidget from './HybridChartWidget/HybridChartWidget';
import SensorMapWidget from './SensorMapWidget/SensorMapWidget';
import ManualSensorSimulatorWidget from './ManualSensorSimulatorWidget/ManualSensorSimulatorWidget';
import WaterReadingCaptureWidget from './WaterReadingCaptureWidget/WaterReadingCaptureWidget';
import SingleStatSensorWidget from './SingleStatWidgets/SingleStatSensorWidget';
import SingleStatSensorCompactWidget from './SingleStatWidgets/SingleStatSensorCompactWidget';
import SingleStatGradeGaugeWidget from './SingleStatWidgets/SingleStatGradeGaugeWidget';
import ImageDisplayWidget from './ImageDisplayWidget/ImageDisplayWidget';

import CameraStreamWidget from './YoloWidgets/CameraStreamWidget';
import PeopleCounterWidget from './YoloWidgets/PeopleCounterWidget';

const WidgetRegistry = {
  SoilDataWidget: {
    component: SoilDataWidget,
    helpFile: '/help/SoilDataWidget.md'
  },
  WeatherChartWidget: {
    component: WeatherChartWidget,
    helpFile: '/help/WeatherChartWidget.md'
  },
  ManualDataEntryWidget: {
    component: ManualDataEntryWidget,
    helpFile: '/help/ManualDataEntryWidget.md'
  },
  NDVIChartWidget: {
    component: NDVIChartWidget,
    helpFile: '/help/NDVIChartWidget.md'
  },
  NDVIImageryWidget: {
    component: NDVIImageryWidget,
    helpFile: '/help/NDVIImageryWidget.md'
  },
  NDVISummaryWidget: {
    component: NDVISummaryWidget,
    helpFile: '/help/NDVISummaryWidget.md'
  },
  HybridChartWidget: {
    component: HybridChartWidget,
    helpFile: '/help/HybridChartWidget.md'
  },
  SensorMapWidget: {
    component: SensorMapWidget,
    helpFile: '/help/SensorMapWidget.md'
  },
  ManualSensorSimulatorWidget: {
    component: ManualSensorSimulatorWidget,
    helpFile: '/help/ManualSensorSimulatorWidget.md'
  },
  WaterReadingCaptureWidget: {
    component: WaterReadingCaptureWidget,
    helpFile: '/help/WaterReadingCaptureWidget.md'
  },
  SingleStatSensorWidget: {
    component: SingleStatSensorWidget,
    helpFile: '/help/SingleStatSensorWidget.md'
  },
  SingleStatSensorCompactWidget: {
    component: SingleStatSensorCompactWidget,
    helpFile: '/help/SingleStatSensorCompactWidget.md'
  },
  SingleStatGradeGaugeWidget: {
    component: SingleStatGradeGaugeWidget,
    helpFile: '/help/SingleStatGradeGaugeWidget.md'
  },
  ImageDisplayWidget: {
    component: ImageDisplayWidget,
    helpFile: '/help/ImageDisplayWidget.md'
  },
  CameraStreamWidget: {
    component: CameraStreamWidget,
    helpFile: '/help/CameraStreamWidget.md'
  },
  PeopleCounterWidget: {
    component: PeopleCounterWidget,
    helpFile: '/help/PeopleCounterWidget.md'
  }
};

export default WidgetRegistry;