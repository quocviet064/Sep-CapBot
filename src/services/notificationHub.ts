import * as signalR from "@microsoft/signalr";

let _connection: signalR.HubConnection | null = null;

function tokenProvider() {
  return localStorage.getItem("accessToken") ?? localStorage.getItem("access_token") ?? "";
}

export function createNotificationHubConnection(): signalR.HubConnection {
  if (_connection) return _connection;

  _connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/notifications", {
      accessTokenFactory: tokenProvider,
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return _connection;
}

/** start the connection if not started */
export async function connectNotificationHub(): Promise<signalR.HubConnection> {
  const conn = createNotificationHubConnection();
  if (conn.state === signalR.HubConnectionState.Connected) return conn;
  try {
    await conn.start();
    return conn;
  } catch (err) {
    throw err;
  }
}

export function getNotificationHubConnection(): signalR.HubConnection | null {
  return _connection;
}

export async function disconnectNotificationHub(): Promise<void> {
  try {
    if (_connection && _connection.state === signalR.HubConnectionState.Connected) {
      await _connection.stop();
    }
  } catch {
    // ignore
  } finally {
    _connection = null;
  }
}
