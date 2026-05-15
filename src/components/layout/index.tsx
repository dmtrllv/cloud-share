import React, { useEffect, useRef, useState, type CSSProperties } from "react";

import "./styles/layout.scss";

export const LayoutManager = (props: LayoutProps) => {
	return (
		<div className="layout-root">
			<Layout parentDir={null} {...props} />
		</div>
	);
};

const Layout = ({ children, dir, parentDir }: LayoutProps & { parentDir: Dir | null }) => {
	const [style, setStyle] = useState<CSSProperties>({ flex: "1" });

	const [isSliding, setIsSliding] = useState(false);

	const ref = useRef<HTMLDivElement>(null);

	const startSlideState = useRef({
		pos: 0,
		size: 0
	});

	const onStartSlide = (e: React.MouseEvent) => {
		if (!ref.current || !parentDir)
			return;

		if (parentDir === "horizontal") {
			startSlideState.current = {
				size: ref.current.clientWidth,
				pos: e.clientX
			};
		} else {
			startSlideState.current = {
				size: ref.current.clientHeight,
				pos: e.clientY
			};
		}

		setIsSliding(true);
	};

	const onSlide = (e: MouseEvent) => {
		if (!isSliding || !parentDir)
			return;

		const { pos, size } = startSlideState.current;

		const s: CSSProperties = {};

		if (parentDir === "horizontal") {
			const newSize = size + (e.clientX - pos);
			s.flexBasis = s.maxWidth = s.width = s.minWidth = newSize + "px";
		} else {
			const newSize = size + (e.clientY - pos);
			s.flexBasis = s.maxHeight = s.height = s.minHeight = newSize + "px";
		}

		setStyle(s);
	};

	const onStopSlide = () => {
		setIsSliding(false);
	};

	useEffect(() => {
		window.addEventListener("mousemove", onSlide);
		window.addEventListener("mouseup", onStopSlide);
		return () => {
			window.removeEventListener("mousemove", onSlide);
			window.removeEventListener("mouseup", onStopSlide);
		}
	}, [isSliding]);

	return (
		<>
			<div ref={ref} className={`layout ${dir}`} style={{ flexDirection: dir === "horizontal" ? "row" : "column", ...style }}>
				{children.map((c, i) => {
					if ("Component" in c)
						return <Panel key={i} {...c} dir={dir} />;
					return <Layout parentDir={dir} key={i} {...c} />;
				})}
			</div>
			<div className="slider" onMouseDown={onStartSlide} />
		</>
	);
};

const Panel = ({ Component, size, dir }: PanelProp & { dir: Dir }) => {
	const [style, setStyle] = useState<CSSProperties>(() => {
		if (size === "auto")
			return { flex: "1 1 auto" };
		return { flexBasis: size };
	});

	const [isSliding, setIsSliding] = useState(false);

	const ref = useRef<HTMLDivElement>(null);

	const startSlideState = useRef({
		pos: 0,
		size: 0
	});

	const onStartSlide = (e: React.MouseEvent) => {
		if (!ref.current)
			return;

		if (dir === "horizontal") {
			startSlideState.current = {
				size: ref.current.clientWidth,
				pos: e.clientX
			};
		} else {
			startSlideState.current = {
				size: ref.current.clientHeight,
				pos: e.clientY
			};
		}

		setIsSliding(true);
	};

	const onSlide = (e: MouseEvent) => {
		if (!isSliding)
			return;

		const { pos, size } = startSlideState.current;

		const s: CSSProperties = {};

		if (dir === "horizontal") {
			const newSize = size + (e.clientX - pos);
			s.flexBasis = s.maxWidth = s.width = s.minWidth = newSize + "px";
		} else {
			const newSize = size + (e.clientY - pos);
			s.flexBasis = s.maxHeight = s.height = s.minHeight = newSize + "px";
		}

		setStyle(s);
	};

	const onStopSlide = () => {
		setIsSliding(false);
	};

	useEffect(() => {
		window.addEventListener("mousemove", onSlide);
		window.addEventListener("mouseup", onStopSlide);
		return () => {
			window.removeEventListener("mousemove", onSlide);
			window.removeEventListener("mouseup", onStopSlide);
		}
	}, [isSliding]);

	return (
		<>
			<div ref={ref} className="panel" style={style}>
				<Component />
			</div>
			<div className="slider" onMouseDown={onStartSlide} />
		</>
	);
};

export const createPanel = (Component: React.FC, size: number | "auto" = "auto") => ({ Component, size });
export const createLayout = (dir: Dir, children: LayoutChild[] = []) => ({ dir, children });

type Dir = "horizontal" | "vertical";

type PanelProp = {
	Component: React.FC;
	size: number | "auto";
};

type LayoutChild = LayoutProps | PanelProp;

type LayoutProps = {
	dir: Dir;
	children: LayoutChild[];
};