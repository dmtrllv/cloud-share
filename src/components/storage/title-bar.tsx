export const Titlebar = ({ path, startDrag, closable, onClose }: TitlebarProps) => {
	return (
		<div className="top-bar" onMouseDown={startDrag}>
			<div className="title">
				File explorer - {path}
			</div>
			<div className="top-buttons">
				{closable && (
					<div className="close" onClick={onClose}><span>&#10006;</span></div>
				)}
			</div>
		</div>
	);
};

export type TitlebarProps = {
	path: string;
	startDrag: () => void;
	closable: boolean;
	onClose: () => void;
};