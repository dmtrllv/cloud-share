import { createContext, useContext, useState, type PropsWithChildren } from "react";
import { useWindowEvent } from "../../hooks/window-event";

const StorageDragDropContext = createContext<{
	dragState: any,
	startDrag: (state: any) => void,
}>({  
	dragState: null,
	startDrag: () => {}
});

export const StorageDragDropManager = ({ children }: PropsWithChildren) => {
	const [state, setState] = useState(null);

	useWindowEvent("mouseup", () => {
		setState(null);
	}, []);

	return (
		<StorageDragDropContext.Provider value={{ dragState: state, startDrag: setState }}>
			{children}
		</StorageDragDropContext.Provider>
	);
}

export const useStorageDragDropContext = () => useContext(StorageDragDropContext);