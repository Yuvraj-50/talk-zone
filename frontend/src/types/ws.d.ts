export interface WebSocketExt extends WebSocket {
  pingTimeOut: NodeJS.Timeout;
}
