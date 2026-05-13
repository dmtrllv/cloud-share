export abstract class Command {
	public abstract run(args: string[]): void | Promise<void>;
}