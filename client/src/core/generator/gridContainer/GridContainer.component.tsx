import React from 'react';
import { useWindowSize } from 'react-hooks-window-size';
import SplitPane from 'react-split-pane';
import Grid from '../grid/Grid.container';
import './GridContainer.scss';
import DependencyGrid from "~core/generator/dependency/DependencyGrid.container";
import C from "~core/constants";

export const enum GridContainerLayout {
	horizontal = 'horizontal',
	vertical = 'vertical'
}

export type GridContainerProps = {
	i18n: any;
	isGridVisible: boolean;
	isDependencyGridVisible: boolean;
	gridContainerLayout: GridContainerLayout;
	lastLayoutWidth: number | null;
	lastLayoutHeight: number | null;
	onResizePanels: (size: number) => void;
}

const Builder = ({
	isGridVisible, isDependencyGridVisible, onResizePanels, i18n, lastLayoutHeight, lastLayoutWidth, gridContainerLayout
}: GridContainerProps): JSX.Element => {

	const windowSize = useWindowSize();
	const onResize = (size: number): void => onResizePanels(size);

	let minSize: number;
	let maxSize: number;
	let defaultSize: number | string = '50%';
	if (gridContainerLayout === GridContainerLayout.vertical) {
		minSize = 350;
		maxSize = windowSize.width - 350;
		if (lastLayoutWidth) {
			defaultSize = lastLayoutWidth < maxSize ? lastLayoutWidth : maxSize;
		}
	} else {
		minSize = 100;
		maxSize = (windowSize.height - (C.FOOTER_HEIGHT)) - 100;
		if (lastLayoutHeight) {
			defaultSize = lastLayoutHeight < maxSize ? lastLayoutHeight : maxSize;
		}
	}


	const getContent = (): JSX.Element => {

		if (isGridVisible && isDependencyGridVisible) {
			return (
				<SplitPane
					className="gdGridPanel"
					split={gridContainerLayout}
					minSize={minSize}
					maxSize={maxSize}
					defaultSize={defaultSize}
					size={defaultSize}
					onChange={onResize}>
					<Grid />
					<DependencyGrid />
				</SplitPane>
			);
		}
		if (isGridVisible) {
			return <Grid />;
		}
		return <DependencyGrid />;
	};

	return (
		<>
			<div style={{ height: '100%' }}>
				<div style={{ height: '100%', position: 'relative' }}>
					{getContent()}
				</div>
			</div>
		</>
	);
};
export default Builder;
