#!/usr/bin/env node
import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin"
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import cp, { spawn } from "node:child_process";
import { platform } from "node:process";

const [, , cmd, ...args] = process.argv;

const cwd = process.cwd();

const exec = (command, args = [], dir = cwd) => new Promise((res, rej) => {
	const proc = cp.exec([command, ...args].join(" "), { stdio: "inherit", cwd: dir });
	proc.stdout.pipe(process.stdout);
	proc.on("close", res);
	proc.on("error", rej)
});

const packageJson = (name) => ({
	"name": name,
	"private": true,
	"version": "0.0.0",
	"type": "module",
	"scripts": {
		"build": "cs-app build"
	},
	"devDependencies": {
		"@tsconfig/strictest": "^2.0.8",
		"@types/react": "^19.2.15",
		"@types/react-dom": "^19.2.3",
		"cloud-share": "file:..",
		"esbuild": "^0.28.0",
		"esbuild-sass-plugin": "^3.7.0",
		"sass": "^1.100.0",
		"typescript": "~6.0.3"
	},
	"exports": {
		"import": "./dist/esm.js",
		"default": "./dist/esm.js"
	}
});

const tsJson = () => ({
	"compilerOptions": {
		"declaration": true,
		"target": "esnext",
		"lib": [
			"esnext",
			"dom"
		],
		"strict": true,
		"noImplicitAny": false,
		"esModuleInterop": true,
		"moduleResolution": "bundler",
		"rootDir": "./src",
		"outDir": "./dist",
		"jsx": "react",
		"jsxFactory": "globalThis.React.createElement",
		"experimentalDecorators": true
	}
});

const commands = {
	new: async () => {
		const name = args[0];
		if (!name)
			return console.log("Missing name!");
		const projectDir = path.resolve(cwd, name);
		await mkdir(projectDir, { recursive: true });
		await writeFile(path.resolve(projectDir, "package.json"), JSON.stringify(packageJson(name), null, 4), "utf-8");
		await writeFile(path.resolve(projectDir, "tsconfig.json"), JSON.stringify(tsJson(), null, 4), "utf-8");
		const npm = platform === "win32" ? "npm.cmd" : "npm";
		await exec(npm, ["i"], projectDir);

	},
	build: async () => {
		const pkg = JSON.parse(await readFile(path.resolve(cwd, "package.json"), "utf-8"));
		esbuild.build({
			outfile: "./dist/index.js",
			bundle: true,
			entryPoints: [pkg.main || "src/index.ts"],
			platform: "browser",
			format: "esm",
			external: ["react", "react-dom", "cloud-share"],
			plugins: [sassPlugin()]
		});
	},
};

if (cmd in commands) {
	commands[cmd]();
}