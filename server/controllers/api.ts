import { Controller } from "../framework/controller.js";
import { createApi, get } from "../framework/http.js";
import { Auth } from "./auth.js";
import { Users } from "./users.js";
import { Fs } from "./fs.js";

const api = createApi({
	Users,
	Auth,
	Fs
});

export type Api = typeof api;

export class ApiController extends Controller {
	@get("/api")
	public schema() {
		return api.schema;
	}
}