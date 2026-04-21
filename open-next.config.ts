import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";
import cloudflare from "@opennextjs/cloudflare/adapter";

const config: OpenNextConfig = {
  default: {
    adapter: cloudflare,
  },
};

export default config;
