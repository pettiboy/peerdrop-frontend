import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/welcome.tsx"),
  route("/chats", "routes/chats.tsx"),
  route("/chat/:id", "routes/chat.tsx"),
  route("/qr", "routes/qr.tsx"),
] satisfies RouteConfig;
