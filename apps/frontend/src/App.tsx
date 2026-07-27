import * as React from "react";
import { ComponentsPlayground } from "./components-playground";
import { LandingView } from "./views/LandingView";
import { ConsoleView } from "./views/ConsoleView";
import { CardRequestRoute } from "./views/CardRequestRoute";
import { CardRequestShadcnRoute } from "./views/CardRequestShadcnRoute";

/** Экраны, доступные по хешу. Разметка каждого живёт в своём файле в views/. */
type HashView =
  | "landing"
  | "console"
  | "cardRequest"
  | "cardRequestShadcn"
  | "cardRequestShadcnBranded"
  | "cardRequestShadcnCalm"
  | "cardRequestShadcnCalmTyped";

function readHashView(): HashView {
  if (window.location.hash === "#console" || window.location.pathname === "/console") {
    return "console";
  }

  if (window.location.hash === "#card-request") {
    return "cardRequest";
  }

  // Тот же экран на альтернативной основе: shadcn/ui в четырёх темах.
  // Две последние — контрольные точки эксперимента «геометрия против шрифта»:
  // calm держит цвет branded при штатной геометрии, calm-typed добавляет
  // реально подгруженные гарнитуры. Хеши нужны, чтобы сравнивать их в живом
  // приложении, а не только по скриншотам Storybook.
  if (window.location.hash === "#card-request-shadcn") {
    return "cardRequestShadcn";
  }

  if (window.location.hash === "#card-request-shadcn-branded") {
    return "cardRequestShadcnBranded";
  }

  if (window.location.hash === "#card-request-shadcn-calm") {
    return "cardRequestShadcnCalm";
  }

  if (window.location.hash === "#card-request-shadcn-calm-typed") {
    return "cardRequestShadcnCalmTyped";
  }

  return "landing";
}

export function App() {
  if (window.location.pathname === "/components") {
    return <ComponentsPlayground />;
  }

  const [view, setView] = React.useState<HashView>(readHashView);

  React.useEffect(() => {
    const handleHashChange = () => setView(readHashView());
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

  if (view === "cardRequest") {
    return <CardRequestRoute />;
  }

  if (view === "cardRequestShadcn") {
    return <CardRequestShadcnRoute theme="default" />;
  }

  if (view === "cardRequestShadcnBranded") {
    return <CardRequestShadcnRoute theme="branded" />;
  }

  if (view === "cardRequestShadcnCalm") {
    return <CardRequestShadcnRoute theme="calm" />;
  }

  if (view === "cardRequestShadcnCalmTyped") {
    return <CardRequestShadcnRoute theme="calm-typed" />;
  }

  return <LandingView onConsole={handleSwitchToConsole} />;
}
