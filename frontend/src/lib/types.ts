

export type connectionStatus = "connected" | "disconnected" | "pending";

export type ConnectionInfo = {
    label: string;
    status: connectionStatus;
}