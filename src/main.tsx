import { App } from "./framework/app.js";
import { ExecutableManager } from "./services/exec-manager.js";
import { Auth } from "./services/auth.js";
import { AppUI } from "./ui/app.js";

export const app = new App();

app.registerService(Auth);
app.registerService(ExecutableManager);

const auth = app.getService(Auth);
await auth.login("admin", "admin");

app.render(AppUI);