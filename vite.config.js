import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the site works from a GitHub Pages sub-path (/BB4S-Church/) and from a custom domain.
export default defineConfig({ base: "./", plugins: [react()] });
