import { useCallback, useEffect, useRef, useState } from "react";

import type { RealtimeEvent } from "../types/realtime";
import type { PredictionType } from "../types";
export interface RealtimeLog {
  id: string;
  timestamp: string;
  level: string;
  blockId: string;
  eventId: string;
  message: string;
}

export interface RealtimeActiveBlock {
  blockId: string;
  events: number;
  lastActivity: string;
  status: string;
}

export interface RealtimePrediction {
  id: string;
  timestamp: string;
  blockId: string;
  model: string;
  score: number;
  prediction: PredictionType;
}

export interface RealtimeAnomaly {
  id: string;
  timestamp: string;
  blockId: string;
  score: number;
}

export interface RealtimeActivity {
  time: string;
  info: number;
  warn: number;
}

export function useRealtime() {
  const [connected, setConnected] = useState(false);

  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const [logs, setLogs] = useState<RealtimeLog[]>([]);

  const [activeBlocks, setActiveBlocks] = useState<
    RealtimeActiveBlock[]
  >([]);

  const [predictions, setPredictions] = useState<
    RealtimePrediction[]
  >([]);

  const [anomalies, setAnomalies] = useState<
    RealtimeAnomaly[]
  >([]);

  const [logActivity, setLogActivity] = useState<
    RealtimeActivity[]
  >([]);

  const [lastUpdate, setLastUpdate] = useState<Date | null>(
    null
  );

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!shouldReconnectRef.current) {
      return;
    }

    const currentSocket = websocketRef.current;

    if (
      currentSocket &&
      (
        currentSocket.readyState === WebSocket.OPEN ||
        currentSocket.readyState === WebSocket.CONNECTING
      )
    ) {
      return;
    }

    const websocket = new WebSocket(
      "ws://localhost:8000/ws/realtime"
    );

    websocketRef.current = websocket;

    websocket.onopen = () => {
      console.log("[Realtime] Connected");
      setConnected(true);
    };

    websocket.onmessage = (message) => {
  console.log("========================================");
  console.log("[Realtime] 📩 RAW MESSAGE RECEIVED");
  console.log("[Realtime] Raw data:", message.data);

  try {
    const event: RealtimeEvent = JSON.parse(message.data);

    console.log("[Realtime] ✅ Parsed event:", event);
    console.log("[Realtime] Type:", event.type);
    console.log("[Realtime] Block ID:", event.block_id);
    console.log("[Realtime] Event ID:", event.event_id);
    console.log("[Realtime] Level:", event.level);
    console.log("[Realtime] Prediction:", event.prediction);
    console.log("[Realtime] Score:", event.score);
    console.log("[Realtime] Model:", event.model);
    console.log("[Realtime] Active blocks:", event.active_blocks);

    setEvents((previous) => [
      event,
      ...previous,
    ].slice(0, 100));

    setLastUpdate(new Date());

    /*
     * BLOCK STARTED
     */
    if (event.type === "block_started") {
      console.log(
        "[Realtime] 🟢 BLOCK STARTED:",
        event.block_id
      );

      updateActiveBlocks(event);
    }

    /*
     * LOG RECEIVED
     */
    if (event.type === "log_received") {
      console.log(
        "[Realtime] 📝 LOG RECEIVED:",
        {
          blockId: event.block_id,
          eventId: event.event_id,
          level: event.level,
        }
      );

      updateLogs(event);
      updateActivity(event);
      updateActiveBlocks(event);
    }

    /*
     * BLOCK COMPLETED
     */
    if (event.type === "block_completed") {
      console.log(
        "[Realtime] 🏁 BLOCK COMPLETED:",
        {
          blockId: event.block_id,
          prediction: event.prediction,
          score: event.score,
          model: event.model,
        }
      );

      updateActiveBlocks(event);
      updatePrediction(event);
    }

    console.log("========================================");

  } catch (error) {
    console.error(
      "[Realtime] ❌ Invalid JSON message:",
      error
    );

    console.error(
      "[Realtime] Raw message that caused error:",
      message.data
    );
  }
};

    websocket.onerror = (error) => {
      console.error(
        "[Realtime] WebSocket error:",
        error
      );

      setConnected(false);
    };

    websocket.onclose = () => {
      console.log(
        "[Realtime] WebSocket disconnected"
      );

      setConnected(false);

      websocketRef.current = null;

      if (!shouldReconnectRef.current) {
        return;
      }

      reconnectTimeoutRef.current =
        window.setTimeout(() => {
          connect();
        }, 3000);
    };
  }, []);

  /*
   * Active Blocks
   */
  const updateActiveBlocks = (
    event: RealtimeEvent
  ) => {
    if (!event.active_blocks) {
      return;
    }

    const currentTime =
      new Date().toLocaleTimeString();

    setActiveBlocks((previous) => {
      return event.active_blocks!.map(
        (blockId) => {
          const existing = previous.find(
            (block) =>
              block.blockId === blockId
          );

          return {
            blockId,
            events: existing?.events ?? 0,
            lastActivity: currentTime,
            status: "ACTIVE",
          };
        }
      );
    });

    /*
     * Update event count for current block
     */
    if (event.block_id) {
      setActiveBlocks((previous) =>
        previous.map((block) =>
          block.blockId === event.block_id
            ? {
                ...block,
                events:
                  event.type === "log_received"
                    ? block.events + 1
                    : block.events,
                lastActivity: currentTime,
              }
            : block
        )
      );
    }
  };

  /*
   * Live Event Feed
   */
  const updateLogs = (
    event: RealtimeEvent
  ) => {
    if (
      !event.block_id ||
      !event.event_id
    ) {
      return;
    }

    const timestamp =
      new Date().toLocaleTimeString();

    const log: RealtimeLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp,
      level: event.level ?? "INFO",
      blockId: event.block_id,
      eventId: event.event_id,
      message: `HDFS event ${event.event_id}`,
    };

    setLogs((previous) => [
      log,
      ...previous,
    ].slice(0, 50));
  };

  /*
   * Activity Chart
   */
  const updateActivity = (
    event: RealtimeEvent
  ) => {
    const time =
      new Date().toLocaleTimeString([], {
        minute: "2-digit",
        second: "2-digit",
      });

    setLogActivity((previous) => {
      const last = previous[previous.length - 1];

      if (last && last.time === time) {
        return previous.map((item, index) =>
          index === previous.length - 1
            ? {
                ...item,
                info:
                  item.info +
                  (event.level === "INFO" ? 1 : 0),
                warn:
                  item.warn +
                  (event.level === "WARN" ? 1 : 0),
              }
            : item
        );
      }

      return [
        ...previous,
        {
          time,
          info:
            event.level === "INFO" ? 1 : 0,
          warn:
            event.level === "WARN" ? 1 : 0,
        },
      ].slice(-20);
    });
  };

  /*
   * Prediction Activity
   */
  const updatePrediction = (
    event: RealtimeEvent
  ) => {
    if (
      !event.block_id ||
      event.prediction === undefined
    ) {
      return;
    }

    const prediction: RealtimePrediction = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp:
        new Date().toLocaleTimeString(),
      blockId: event.block_id,
      model: event.model ?? "BiLSTM",
      score: event.score ?? 0,
      prediction: event.prediction,
    };

    setPredictions((previous) => [
      prediction,
      ...previous,
    ].slice(0, 30));

    /*
     * Recent anomalies
     */
    const isAnomaly =
      event.prediction.toLowerCase() ===
      "anomaly";

    if (isAnomaly) {
      const anomaly: RealtimeAnomaly = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp:
          new Date().toLocaleTimeString(),
        blockId: event.block_id,
        score: event.score ?? 0,
      };

      setAnomalies((previous) => [
        anomaly,
        ...previous,
      ].slice(0, 20));
    }
  };

  useEffect(() => {
    shouldReconnectRef.current = true;

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (
        reconnectTimeoutRef.current !== null
      ) {
        window.clearTimeout(
          reconnectTimeoutRef.current
        );
      }

      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, [connect]);

  return {
    connected,
    events,

    logs,
    activeBlocks,
    predictions,
    anomalies,
    logActivity,

    lastUpdate,
  };
}