import { compare, hash } from "bcrypt";
import { User } from "../models/user.js";
import { Service } from "./service.js";
import { StorageService } from "./storage.js";

export class AccountService extends Service {
	public async createAccount(username: string, password: string): Promise<boolean | { error: string }> {
		const users = await User.find({
			where: { username }
		});

		if (users.length > 0) {
			return { error: "username or email is already used!" };
		}

		const hasedPassword = await hash(password, 10);

		const user = await User.insert({ username, password: hasedPassword });

		if (user.username !== username) {
			return { error: "Could not create account?!?!" };
		}

		await StorageService.get().initStorage(user);

		return true;
	}

	public async login(username: string, password: string): Promise<boolean> {
		const user = await User.findOne({ where: { username } });
		if(user) {
			return await compare(password, user.password);
		}
		return false;
	}
}