import readline from "node:readline";
import { isKeyOf } from "../../shared/utils/obj.js";

import * as commands from "./commands/index.js";
import type { Command } from "./commands/command.js";

export class Cli {
	private static readonly _instance: Cli = new this();

	public static readonly get = (): Cli => this._instance;

	private readonly rl: readline.Interface;
	private readonly commands: Record<string, typeof Command>;

	private isRunning: boolean = false;

	private constructor() {
		this.rl = readline.createInterface(process.stdin, process.stdout);
		this.commands = {};

		for (const k in commands) {
			this.commands[k.toLowerCase()] = (commands as any)[k] as typeof Command;
		}
	}

	public readonly start = () => {
		if(this.isRunning)
			return;

		this.isRunning = true;

		this.rl.on("line", (str) => {
			let [cmd, ...args] = str.split(" ").map(s => s.trim());
			cmd = cmd?.toLowerCase();
			if (cmd && isKeyOf(cmd, this.commands)) {
				const Command = this.commands[cmd] as new () => Command;
				const command = new Command();
				command.run(args);
			} else {
				console.log(`Could not find Command ${cmd}!`);
			}
		});
	}
}