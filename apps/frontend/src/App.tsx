import * as React from "react";
import { CardRequestShadcnRoute } from "./views/CardRequestShadcnRoute";
import { StudioIndexView } from "./views/StudioIndexView";

/** Экраны, доступные по хешу. Разметка каждого живёт в своём файле в views/. */
type HashView =
  | "index"
  | "cardRequestShadcn"
  | "cardRequestShadcnBranded"
  | "cardRequestShadcnCalm"
  | "cardRequestShadcnCalmTyped";

function readHashView(): HashView {
  // Пилотный экран в четырёх темах. Две последние — контрольные точки
  // эксперимента «геометрия против шрифта»: calm держит цвет branded при
  // штатной геометрии, calm-typed добавляет реально подгруженные гарнитуры.
  // Хеши нужны, чтобы сравнивать их в живом приложении, а не только по
  // скриншотам Storybook.
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

  return "index";
}

export function App() {
  const [view, setView] = React.useState<HashView>(readHashView);

  React.useEffect(() => {
    const handleHashChange = () => setView(readHashView());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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

  return <StudioIndexView />;
}
