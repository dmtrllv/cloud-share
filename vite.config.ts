import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => {
	return {
		plugins: [
			react({
				tsDecorators: true
			}),
		],
		build: {
			emptyOutDir: true,
			outDir: "./dist/public",
		},
		server: {
			proxy: {
				"/auth": {
					target: "http://127.0.0.1:3001",
					changeOrigin: true,
				},
				"/fs": {
					target: "http://127.0.0.1:3001",
					changeOrigin: true,
				},
				"/api": {
					target: "http://127.0.0.1:3001",
					changeOrigin: true,
				},
				"/executables": {
					target: "http://127.0.0.1:3001",
					changeOrigin: true,
				},
			}
		}
	};
})
