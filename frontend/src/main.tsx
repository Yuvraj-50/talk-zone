import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { MyRouter } from "./utils/route";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <BrowserRouter>
    <MyRouter />
  </BrowserRouter>
  // {/* </StrictMode>  */}
);
