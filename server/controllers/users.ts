import { Controller } from "../framework/controller.js";
import { get } from "../framework/http.js";
import { User } from "../models/user.js";

export class Users extends Controller {
	@get("/users")
	public async getAll() {
		return User.find({ what: ["id", "username"] });
	}
}