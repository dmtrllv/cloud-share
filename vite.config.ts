import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => {
	return {
		resolve: {
			alias: {
				"@server": path.resolve(import.meta.dirname, "server"),
				"@shared": path.resolve(import.meta.dirname, "shared"),
			},
		},
		plugins: [
			react({
				tsDecorators: true
			}),
		],
		server: {
			cors: false,
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
