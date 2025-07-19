import { toast } from "sonner";

export const clientLogger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log("CLIENT LOG:", ...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error("CLIENT ERROR:", ...args);
      toast.error("Client-side error occurred. Check console for details.");
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("CLIENT WARN:", ...args);
    }
  },
};

