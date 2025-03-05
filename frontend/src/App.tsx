import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/themeprovider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MyRouter } from "./lib/route";
import { useEffect } from "react";
import useWebSocketStore from "./zustand/socketStore";
import { Toaster } from "./components/ui/toaster";

const WEBSOCKET_SERVER_URL = import.meta.env.VITE_WEBSOCKET_SERVER_URL;

function App() {
  const { connect, disconnect } = useWebSocketStore();

  useEffect(() => {
    connect(WEBSOCKET_SERVER_URL);
    return () => {
      disconnect();
    };
  }, []);

  const cliendId = import.meta.env.VITE_CLIENTID;

  return (
    <ThemeProvider defaultTheme="violet" storageKey="ui-theme">
      <BrowserRouter>
        <GoogleOAuthProvider clientId={cliendId}>
          <MyRouter />
          <Toaster />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
