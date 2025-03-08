import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/themeprovider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MyRouter } from "./lib/route";
import { useEffect } from "react";
import useWebSocketStore from "./zustand/socketStore";
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./zustand/authStore";
import { CLIENTID, WEBSOCKET_SERVER_URL } from "./lib/constant";

function App() {
  const { connect, disconnect } = useWebSocketStore();
  const authenticated = useAuthStore((state) => state.authenticated);

  useEffect(() => {
    if (authenticated) {
      connect(WEBSOCKET_SERVER_URL);
    } else {
      disconnect();
    }
  }, [authenticated]);

  return (
    <ThemeProvider defaultTheme="violet" storageKey="ui-theme">
      <BrowserRouter>
        <GoogleOAuthProvider clientId={CLIENTID}>
          <MyRouter />
          <Toaster />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
