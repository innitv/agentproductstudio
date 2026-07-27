import * as React from "react";
import { CardRequestShadcnRoute } from "./views/CardRequestShadcnRoute";
import { StudioIndexView } from "./views/StudioIndexView";

/** Экраны, доступные по хешу. Разметка каждого живёт в своём файле в views/. */
type HashView = "index" | "cardRequestShadcn";

function readHashView(): HashView {
  // Пилотный экран на штатной теме реестра. Три тематических хеша
  // (`-branded`, `-calm`, `-calm-typed`) удалены 2026-07-28 вместе с темами
  // эксперимента: верстак студии не держит постоянных тем, тема заводится под
  // конкретный проект и уезжает в его репозиторий.
  if (window.location.hash === "#card-request-shadcn") {
    return "cardRequestShadcn";
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
    return <CardRequestShadcnRoute />;
  }

  return <StudioIndexView />;
}
