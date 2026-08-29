import type { ChartPoint, DashboardMetric, SystemHealthItem } from '../types';

export const dashboardMetrics: DashboardMetric[] = [
  { title: 'Logs Received', value: '1,284,392', delta: '+12.4%', deltaPositive: true, sparkline: [20, 30, 25, 40, 35, 52, 48, 70, 68, 88, 92, 104] },
  { title: 'Logs Processed', value: '1,281,904', delta: '+11.8%', deltaPositive: true, sparkline: [18, 26, 22, 35, 31, 44, 42, 58, 63, 82, 86, 100] },
  { title: 'Active Blocks', value: '24', delta: '+3', deltaPositive: true, sparkline: [5, 7, 9, 8, 12, 11, 14, 16, 18, 19, 22, 24] },
  { title: 'Completed Blocks', value: '18,492', delta: '+8.2%', deltaPositive: true, sparkline: [10, 12, 14, 19, 18, 25, 23, 28, 32, 37, 41, 45] },
  { title: 'Anomalies Detected', value: '327', delta: '+4.7%', deltaPositive: true, sparkline: [14, 18, 16, 22, 20, 26, 28, 30, 33, 35, 38, 42] },
  { title: 'Anomaly Rate', value: '2.56%', delta: '-0.32%', deltaPositive: false, sparkline: [2.8, 2.9, 2.7, 2.5, 2.6, 2.4, 2.3, 2.5, 2.8, 2.6, 2.4, 2.56] },
];

export const throughputData: ChartPoint[] = [
  { name: '00:00', value: 620 }, { name: '02:00', value: 780 }, { name: '04:00', value: 730 }, { name: '06:00', value: 860 }, { name: '08:00', value: 910 }, { name: '10:00', value: 870 }, { name: '12:00', value: 1020 }, { name: '14:00', value: 980 }, { name: '16:00', value: 1100 }, { name: '18:00', value: 1180 }, { name: '20:00', value: 1050 }, { name: '22:00', value: 960 },
];

export const predictionSeries: ChartPoint[] = [
  { name: '00:00', value: 220, secondary: 120 }, { name: '02:00', value: 240, secondary: 130 }, { name: '04:00', value: 260, secondary: 150 }, { name: '06:00', value: 280, secondary: 160 }, { name: '08:00', value: 310, secondary: 170 }, { name: '10:00', value: 330, secondary: 180 }, { name: '12:00', value: 320, secondary: 160 }, { name: '14:00', value: 290, secondary: 170 }, { name: '16:00', value: 310, secondary: 190 }, { name: '18:00', value: 330, secondary: 200 }, { name: '20:00', value: 350, secondary: 210 }, { name: '22:00', value: 340, secondary: 200 },
];

export const anomalyRateData: ChartPoint[] = [
  { name: '00:00', value: 1.1 }, { name: '02:00', value: 1.3 }, { name: '04:00', value: 1.5 }, { name: '06:00', value: 1.7 }, { name: '08:00', value: 2.1 }, { name: '10:00', value: 2.4 }, { name: '12:00', value: 2.0 }, { name: '14:00', value: 2.3 }, { name: '16:00', value: 2.7 }, { name: '18:00', value: 2.6 }, { name: '20:00', value: 2.3 }, { name: '22:00', value: 2.56 },
];

export const processingPerformanceData: ChartPoint[] = [
  { name: '00:00', value: 1.6 }, { name: '02:00', value: 1.8 }, { name: '04:00', value: 1.7 }, { name: '06:00', value: 1.9 }, { name: '08:00', value: 2.2 }, { name: '10:00', value: 2.1 }, { name: '12:00', value: 2.4 }, { name: '14:00', value: 2.2 }, { name: '16:00', value: 2.0 }, { name: '18:00', value: 2.3 }, { name: '20:00', value: 2.1 }, { name: '22:00', value: 1.9 },
];

export const recentAnomalies: Array<{
  blockId: string;
  prediction: 'ANOMALY';
  score: number;
  events: number;
  duration: string;
  model: string;
  detected: string;
  status: 'Detected' | 'Warning';
}> = [
  { blockId: 'blk_-100001', prediction: 'ANOMALY', score: 0.97, events: 14, duration: '2.4s', model: 'BiLSTM-HDFS', detected: '2 min ago', status: 'Detected' },
  { blockId: 'blk_-100008', prediction: 'ANOMALY', score: 0.91, events: 9, duration: '1.8s', model: 'BiLSTM-HDFS', detected: '7 min ago', status: 'Detected' },
  { blockId: 'blk_-100015', prediction: 'ANOMALY', score: 0.88, events: 16, duration: '3.1s', model: 'BiLSTM-HDFS', detected: '12 min ago', status: 'Detected' },
  { blockId: 'blk_-100021', prediction: 'ANOMALY', score: 0.84, events: 11, duration: '2.7s', model: 'BiLSTM-HDFS', detected: '21 min ago', status: 'Warning' },
];

export const systemHealth: SystemHealthItem[] = [
  { name: 'API', status: 'Operational', value: '99.98%' },
  { name: 'PostgreSQL', status: 'Operational' },
  { name: 'Elasticsearch', status: 'Operational' },
  { name: 'Logstash', status: 'Operational' },
  { name: 'Filebeat', status: 'Operational' },
  { name: 'ML Detection', status: 'Operational' },
];
