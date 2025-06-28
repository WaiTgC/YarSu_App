import { ReactNode } from "react";
import Home from "./home";

export default function Page({ children }: { children?: ReactNode }) {
  return <>{children ? children : <Home />}</>;
}
