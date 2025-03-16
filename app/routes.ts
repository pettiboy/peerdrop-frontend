import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/chat/new", "routes/chat/new.tsx"),
  route("/chat/:code", "routes/chat/$code.tsx"),
] satisfies RouteConfig;
