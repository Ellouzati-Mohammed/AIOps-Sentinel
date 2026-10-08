import type { PredictionType } from ".";

export type RealtimeEventType =
  | "block_started"
  | "log_received"
  | "block_completed";

export interface RealtimeEvent {
  type: RealtimeEventType;

  block_id?: string;
  event_id?: string;
  level?: string;

  num_events?: number;
  duration?: number;
  num_info?: number;
  num_warn?: number;

  prediction?: PredictionType;
  score?: number;
  model?: string;

  active_blocks?: string[];
}