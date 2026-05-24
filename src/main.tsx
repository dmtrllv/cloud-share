import { App } from "./framework/app";
import { ExecutableManager } from "./services/exec-manager";
import { Auth } from "./services/auth";
import { AppUI } from "./ui/app";

export const app = new App();

app.registerService(Auth);
app.registerService(ExecutableManager);

app.render(AppUI);

const mod = await app.getService(ExecutableManager).load("test");

