import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/themeprovider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MyRouter } from "./lib/route";
import { useEffect } from "react";
import useWebSocketStore from "./zustand/socketStore";
import { Toaster } from "./components/ui/toaster";

function App() {
  const { connect, disconnect } = useWebSocketStore();

  useEffect(() => {
    connect("ws://localhost:3000");
    return () => {
      disconnect();
    };
  }, []);

  const cliendId = import.meta.env.VITE_CLIENTID;

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
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
