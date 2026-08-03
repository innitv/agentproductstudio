import * as React from "react";
import { CardRequestShadcnRoute } from "./views/CardRequestShadcnRoute";
import { StudioIndexView } from "./views/StudioIndexView";

/** Экраны, доступные по хешу. Разметка каждого живёт в своём файле в views/. */
type HashView = "cardRequestShadcn" | "index";

/**
 * Хеши маршрутов.
 *
 * Верстак студии держит ОДИН пилотный экран на штатной теме реестра. Продуктовые
 * экраны здесь не живут: собранный продукт уезжает в свой репозиторий вместе с
 * темой и приёмкой, иначе появляются две расходящиеся копии одного кода.
 *
 * Что уехало и когда:
 *   • три тематических хеша (`-branded`, `-calm`, `-calm-typed`) — 2026-07-28,
 *     вместе с темами эксперимента;
 *   • `#portfolio*` (три экрана сайта-портфолио) — 2026-08-03, в
 *     `C:/Project/siteportfolio`, где маршруты стали настоящими путями;
 *   • `#a3-finance` — 2026-08-03, решением владельца.
 */
const ROUTE_BY_HASH: Record<string, HashView> = {
  "#card-request-shadcn": "cardRequestShadcn",
  "": "index",
  "#": "index",
};

/**
 * Разрешение маршрута по хешу.
 *
 * НЕизвестный хеш не сбрасывает экран на указатель, а оставляет текущий: экраны
 * держат собственные якоря секций, и они тоже пишутся в `location.hash` —
 * иначе первый же переход по якорю выкидывал бы пользователя со страницы.
 */
function resolveView(previous: HashView): HashView {
  return ROUTE_BY_HASH[window.location.hash] ?? previous;
}

export function App() {
  const [view, setView] = React.useState<HashView>(() => resolveView("index"));

  React.useEffect(() => {
    const handleHashChange = () => setView((previous) => resolveView(previous));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (view === "cardRequestShadcn") {
    return <CardRequestShadcnRoute />;
  }

  return <StudioIndexView />;
}
