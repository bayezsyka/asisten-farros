import { MessageContext, ModuleRoute, RouteResult } from "../../infra/whatsapp/whatsappTypes.js";

const routes: ModuleRoute[] = [];

export function registerRoute(route: ModuleRoute) {
  routes.push(route);
  routes.sort((a, b) => a.priority - b.priority);
}

export function getRoutes(): ModuleRoute[] {
  return routes;
}
