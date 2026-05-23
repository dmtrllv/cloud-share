import { AsyncContext } from "./context";

export class AppManager extends AsyncContext<AppManagerState> {
	
}

export type AppManagerState = {
	apps: any[];
};