import { useEffect, useMemo } from "react";

import { logDiagnostics } from "@demo/theme/build-theme";
import { loadTenant, TenantLoadError, type LoadFailure } from "@demo/theme/tenant-loader";
import type { TenantConfig } from "@demo/theme/tenant.schema";
import { ConfigErrorView } from "@demo/views/ConfigErrorView";
import { LauncherView } from "@demo/views/LauncherView";
import { ScreenHost } from "@demo/views/ScreenHost";
import { parseStage, type DemoStage } from "@demo/views/demo-flow";
import { FORCED_STATES, type ForcedState } from "@demo/views/screen-props";

/**
 * Лёгкий роутер. Никакой презентации: только разбор адреса, загрузка темы
 * и выбор одной из трёх поверхностей — лаунчер, экран, ошибка конфига.
 */
export function App() {
  const search = typeof window === "undefined" ? "" : window.location.search;

  const route = useMemo(() => resolveRoute(search), [search]);

  // Диагностика печатается вне рендера: каждая коррекция обязана быть
  // записана ровно один раз, а не по разу на проход рендера.
  useEffect(() => {
    if (route.kind === "screen") {
      logDiagnostics(route.theme.tenant.tenant_id, route.theme.diagnostics);
    } else if (route.kind === "error") {
      logDiagnostics(route.failure.slug ?? "unknown", route.failure.diagnostics);
    }
  }, [route]);

  if (route.kind === "launcher") return <LauncherView />;
  if (route.kind === "error") {
    return (
      <ConfigErrorView
        diagnostics={route.failure.diagnostics}
        source={route.failure.source}
        slug={route.failure.slug}
      />
    );
  }

  return (
    <ScreenHost
      theme={route.theme}
      forcedState={route.forcedState}
      showHandoff={route.showHandoff}
      initialStage={route.initialStage}
    />
  );
}

type Route =
  | { kind: "launcher" }
  | { kind: "error"; failure: LoadFailure }
  | {
      kind: "screen";
      theme: ReturnType<typeof loadTenant>["theme"];
      forcedState: ForcedState;
      showHandoff: boolean;
      initialStage: DemoStage | null;
    };

function resolveRoute(search: string): Route {
  const params = new URLSearchParams(search);

  const hasTenantIntent =
    params.has("t") ||
    params.has("tenant") ||
    params.has("archetype") ||
    params.has("stage");
  if (!hasTenantIntent) return { kind: "launcher" };

  const stateParam = params.get("state");
  const showHandoff = stateParam === "handoff";
  const forcedState = (FORCED_STATES as readonly string[]).includes(stateParam ?? "")
    ? (stateParam as ForcedState)
    : null;
  const initialStage = parseStage(params.get("stage"));

  try {
    const loaded = loadTenant(search, {
      archetype: parseArchetype(params.get("archetype")),
      a11yMode: parseA11yMode(params.get("a11y")),
    });
    return {
      kind: "screen",
      theme: loaded.theme,
      forcedState,
      showHandoff,
      initialStage,
    };
  } catch (error) {
    if (error instanceof TenantLoadError) {
      return { kind: "error", failure: error.failure };
    }
    throw error;
  }
}

function parseArchetype(value: string | null): TenantConfig["archetype"] | null {
  return value === "cart_checkout" || value === "subscription_payment" ? value : null;
}

function parseA11yMode(value: string | null): TenantConfig["a11y_mode"] | null {
  return value === "enforced" || value === "donor_faithful" ? value : null;
}
