export type PredictionType = 'NORMAL' | 'ANOMALY';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type StatusState = 'Operational' | 'Detected' | 'Warning' | 'Normal' | 'Active';

export interface MetricCardData {
  title: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: string;
  sparkline?: number[];
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  blockId: string;
  message: string;
}

export interface BlockRecord {
  id: string;
  events: number;
  duration: number;
  info: number;
  warn: number;
  prediction: PredictionType;
  score: number;
  model: string;
  completed: boolean;
  eventSequence: string[];
}

export interface PredictionRecord {
  timestamp: string;
  blockId: string;
  prediction: PredictionType;
  score: number;
  model: string;
}

export interface AnomalyRecord {
  blockId: string;
  score: number;
  events: number;
  duration: number;
  detected: string;
  model: string;
  status: 'Detected';
}

export interface ModelInfo {
  name: string;
  version: string;
  framework: string;
  type: string;
  inputFeatures: string[];
  status: 'Active' | 'Inactive';
  threshold: number;
}

export interface TemplateRecord {
  eventId: string;
  template: string;
  created: string;
}

export interface SystemHealthItem {
  name: string;
  status: 'Operational';
  value?: string;
}

export interface ChartPoint {
  name: string;
  value: number;
  secondary?: number;
}

export interface DashboardMetric {
  title: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  sparkline?: number[];
}
