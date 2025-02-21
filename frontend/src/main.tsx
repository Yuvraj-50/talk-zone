import { createRoot } from "react-dom/client";
import "./index.css";
import { MyRouter } from "./lib/route";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/themeprovider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const cliendId = import.meta.env.VITE_CLIENTID;

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <BrowserRouter>
      <GoogleOAuthProvider clientId={cliendId}>
        <MyRouter />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);
