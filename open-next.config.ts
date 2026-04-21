import cloudflare from "@opennextjs/cloudflare/adapter";

/** @type {import("@opennextjs/aws/types/open-next.js").OpenNextConfig} */
const config = {
  default: {
    adapter: cloudflare,
  },
};

export default config;
