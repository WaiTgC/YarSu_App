import { ReactNode } from "react";
import Home from "./home";

export default function Index({ children }: { children?: ReactNode }) {
  return <>{children ? children : <Home />}</>;
}
