import type { PredictionRecord } from '../types';

export const totalPredictions = 18492;
export const normalPredictions = 18165;
export const anomalyPredictions = 327;
export const averagePredictionScore = 0.21;

export const predictionDistribution = [
  { name: 'NORMAL', value: normalPredictions },
  { name: 'ANOMALY', value: anomalyPredictions },
];

export const scoreDistribution = [
  { name: '0.00-0.10', value: 4200 },
  { name: '0.10-0.20', value: 5100 },
  { name: '0.20-0.40', value: 4600 },
  { name: '0.40-0.60', value: 2400 },
  { name: '0.60-0.80', value: 1200 },
  { name: '0.80-1.00', value: 992 },
];

export const recentPredictions: PredictionRecord[] = [
  { timestamp: '21:44:15', blockId: 'blk_-100001', prediction: 'NORMAL', score: 0.03, model: 'BiLSTM-HDFS' },
  { timestamp: '21:43:58', blockId: 'blk_-100002', prediction: 'ANOMALY', score: 0.94, model: 'BiLSTM-HDFS' },
  { timestamp: '21:43:42', blockId: 'blk_-100006', prediction: 'NORMAL', score: 0.08, model: 'BiLSTM-HDFS' },
  { timestamp: '21:43:21', blockId: 'blk_-100008', prediction: 'ANOMALY', score: 0.91, model: 'BiLSTM-HDFS' },
  { timestamp: '21:43:03', blockId: 'blk_-100012', prediction: 'NORMAL', score: 0.17, model: 'BiLSTM-HDFS' },
  { timestamp: '21:42:48', blockId: 'blk_-100015', prediction: 'ANOMALY', score: 0.88, model: 'BiLSTM-HDFS' },
];
