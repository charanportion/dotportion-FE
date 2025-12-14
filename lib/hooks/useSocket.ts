import { useEffect } from "react";
// import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "../socket";

export function useSocket() {
  useEffect(() => {
    // const socket = getSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  return getSocket();
}
