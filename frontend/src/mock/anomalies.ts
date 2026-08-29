import type { AnomalyRecord } from '../types';

export const anomalies: AnomalyRecord[] = [
  { blockId: 'blk_-100002', score: 0.94, events: 21, duration: 5.7, detected: '2 min ago', model: 'BiLSTM-HDFS', status: 'Detected' },
  { blockId: 'blk_-100005', score: 0.89, events: 32, duration: 8.6, detected: '4 min ago', model: 'BiLSTM-HDFS', status: 'Detected' },
  { blockId: 'blk_-100007', score: 0.96, events: 26, duration: 6.3, detected: '6 min ago', model: 'BiLSTM-HDFS', status: 'Detected' },
  { blockId: 'blk_-100008', score: 0.91, events: 9, duration: 1.8, detected: '7 min ago', model: 'BiLSTM-HDFS', status: 'Detected' },
  { blockId: 'blk_-100015', score: 0.88, events: 16, duration: 3.1, detected: '12 min ago', model: 'BiLSTM-HDFS', status: 'Detected' },
  { blockId: 'blk_-100021', score: 0.84, events: 11, duration: 2.7, detected: '18 min ago', model: 'BiLSTM-HDFS', status: 'Detected' },
];

export const totalAnomalies = anomalies.length;
export const highConfidenceAnomalies = anomalies.filter((item) => item.score >= 0.85).length;
export const averageAnomalyScore = 0.91;
export const latestAnomaly = '2 min ago';
