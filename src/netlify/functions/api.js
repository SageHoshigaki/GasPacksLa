import { Hono } from "hono";

const app = new Hono();

app.get("/hello", (c) => {
  return c.text("Hello from Hono (JSX version)");
});

export const handler = app.fetch;
