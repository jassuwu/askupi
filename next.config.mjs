import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
const jiti = createJiti(fileURLToPath(import.meta.url));

jiti.import("./src/env.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
    experimental: {
        ppr: 'incremental',
    },
};

export default nextConfig;
