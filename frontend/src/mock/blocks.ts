import type { BlockRecord } from '../types';

export const blocks: BlockRecord[] = [
  { id: 'blk_-100001', events: 14, duration: 2.4, info: 13, warn: 1, prediction: 'NORMAL', score: 0.03, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E5', 'E13', 'E13', 'E17', 'E5'] },
  { id: 'blk_-100002', events: 21, duration: 5.7, info: 18, warn: 3, prediction: 'ANOMALY', score: 0.94, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E12', 'E13', 'E11', 'E12', 'E13', 'E14'] },
  { id: 'blk_-100003', events: 11, duration: 1.9, info: 10, warn: 1, prediction: 'NORMAL', score: 0.11, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E5', 'E7', 'E8', 'E9', 'E8', 'E10'] },
  { id: 'blk_-100004', events: 17, duration: 3.2, info: 15, warn: 2, prediction: 'NORMAL', score: 0.21, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E5', 'E12', 'E13', 'E13', 'E9', 'E18'] },
  { id: 'blk_-100005', events: 32, duration: 8.6, info: 24, warn: 8, prediction: 'ANOMALY', score: 0.89, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E7', 'E13', 'E13', 'E8', 'E17', 'E18'] },
  { id: 'blk_-100006', events: 9, duration: 1.4, info: 8, warn: 1, prediction: 'NORMAL', score: 0.08, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E5', 'E8', 'E9', 'E5', 'E10'] },
  { id: 'blk_-100007', events: 26, duration: 6.3, info: 19, warn: 7, prediction: 'ANOMALY', score: 0.96, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E13', 'E13', 'E11', 'E12', 'E13', 'E14'] },
  { id: 'blk_-100008', events: 9, duration: 1.8, info: 8, warn: 1, prediction: 'ANOMALY', score: 0.91, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E17', 'E5', 'E13', 'E13', 'E12', 'E14'] },
  { id: 'blk_-100009', events: 15, duration: 2.7, info: 12, warn: 3, prediction: 'NORMAL', score: 0.14, model: 'BiLSTM-HDFS', completed: true, eventSequence: ['E5', 'E10', 'E9', 'E8', 'E5'] },
];
