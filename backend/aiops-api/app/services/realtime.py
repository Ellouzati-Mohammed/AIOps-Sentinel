from typing import List
from fastapi import WebSocket


class RealtimeManager:

    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

        print(
            f"[Realtime] Client connecté "
            f"| clients={len(self.connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

        print(
            f"[Realtime] Client déconnecté "
            f"| clients={len(self.connections)}"
        )

    async def broadcast(self, data: dict):

        disconnected = []

        for websocket in self.connections:
            try:
                await websocket.send_json(data)

            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(websocket)


realtime_manager = RealtimeManager()