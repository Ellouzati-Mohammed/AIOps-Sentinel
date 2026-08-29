import type { ModelInfo } from '../types';

export const models: ModelInfo[] = [
  {
    name: 'BiLSTM-HDFS',
    version: '1.0',
    framework: 'PyTorch',
    type: 'BiLSTM',
    inputFeatures: ['EventSequence', 'NumEvents', 'Duration', 'NumINFO', 'NumWARN'],
    status: 'Active',
    threshold: 0.5,
  },
  {
    name: 'IsolationForest-Logs',
    version: '2.3',
    framework: 'scikit-learn',
    type: 'Isolation Forest',
    inputFeatures: ['Latency', 'ErrorRate', 'ResourceBurst'],
    status: 'Active',
    threshold: 0.67,
  },
  {
    name: 'XGBoost-Diagnosis',
    version: '1.6',
    framework: 'XGBoost',
    type: 'Gradient Boosting',
    inputFeatures: ['CPU', 'Memory', 'Requests', 'QueueDepth'],
    status: 'Inactive',
    threshold: 0.74,
  },
];
