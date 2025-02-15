import { createRoot } from "react-dom/client";
import "./index.css";
import { MyRouter } from "./lib/route";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/themeprovider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <BrowserRouter>
      <MyRouter />
    </BrowserRouter>
  </ThemeProvider>
);
