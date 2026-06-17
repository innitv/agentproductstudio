import * as React from "react";
import { ComponentsPlayground } from "./components-playground";
import { LandingView } from "./views/LandingView";
import { ConsoleView } from "./views/ConsoleView";
import { PortfolioView } from "@siteportfolio/PortfolioView";

export function App() {
  if (window.location.pathname === "/components") {
    return <ComponentsPlayground />;
  }

  if (window.location.pathname.startsWith("/portfolio")) {
    return <PortfolioView />;
  }

  const [view, setView] = React.useState<"landing" | "console">(() => {
    if (window.location.hash === "#console" || window.location.pathname === "/console") {
      return "console";
    }
    return "landing";
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#console") {
        setView("console");
      } else {
        setView("landing");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSwitchToConsole = () => {
    window.location.hash = "console";
    setView("console");
  };

  const handleSwitchToLanding = () => {
    window.location.hash = "";
    setView("landing");
  };

  if (view === "console") {
    return <ConsoleView onBack={handleSwitchToLanding} />;
  }

  return <LandingView onConsole={handleSwitchToConsole} />;
}
