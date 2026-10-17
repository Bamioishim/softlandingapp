import { createServerFn } from "@tanstack/react-start";
import { agentInput } from "./qloo";

export const getQlooRecommendations = createServerFn({ method: "POST" })
  .inputValidator((input) => agentInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env['QLOO_API_KEY'];
    const { queryQloo } = await import("./qloo");
    return queryQloo(data, key);
  });