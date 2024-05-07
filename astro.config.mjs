import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";

// import partytown from "@astrojs/partytown";

// https://astro.build/config

// partytown({
//   config: {
//     forward: ["dataLayer.push"],
//   },
// }),

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  adapter: vercel(),
});
