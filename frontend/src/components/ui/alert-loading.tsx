import React from "react";
import { Alert } from "./alert";

function AlertLoading({ children }: { children: React.ReactNode }) {
  return (
    <Alert className="absolute top-20 z-20 right-4 flex gap-2 items-center w-36">
      {children}
    </Alert>
  );
}

export default AlertLoading;
