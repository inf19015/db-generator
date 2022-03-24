import React from 'react';
import SplitPane from 'react-split-pane';
import Grid from '../grid/Grid.container';
import './GridContainer.scss';
import DependencyGrid from "~core/generator/dependencyGrid/DependencyGrid.container";
import Tables from "~core/generator/table/Tables.container";

export const enum GridContainerLayout {
	horizontal = 'horizontal',
	vertical = 'vertical'
}

export type GridContainerProps = {
	i18n: any;
	parentSize: {
		height: number;
		width: number;
	};
	isTablesVisible: boolean;
	isDependencyGridVisible: boolean;
	gridContainerLayout: GridContainerLayout;
	lastLayoutWidth: number | null;
	lastLayoutHeight: number | null;
	onResizePanels: (size: number) => void;
}

const Builder = ({
	isTablesVisible, isDependencyGridVisible, onResizePanels, parentSize, i18n, lastLayoutHeight, lastLayoutWidth, gridContainerLayout
}: GridContainerProps): JSX.Element => {

	const onResize = (size: number): void => onResizePanels(size);
	let minSize: number;
	let maxSize: number;
	let defaultSize: number | string = '50%';
	if (gridContainerLayout === GridContainerLayout.vertical) {
		minSize = 350;
		maxSize = parentSize.width - 350;
		if (lastLayoutWidth) {
			defaultSize = lastLayoutWidth < maxSize ? lastLayoutWidth : maxSize;
		}
	} else {
		minSize = 100;
		maxSize = parentSize.height - 100;
		if (lastLayoutHeight) {
			defaultSize = lastLayoutHeight < maxSize ? lastLayoutHeight : maxSize;
		}
	}


	const getContent = (): JSX.Element => {

		if (isTablesVisible && isDependencyGridVisible) {
			return (
				<SplitPane
					className="gdGridPanel"
					split={gridContainerLayout}
					minSize={minSize}
					maxSize={maxSize}
					defaultSize={defaultSize}
					size={defaultSize}
					onChange={onResize}>
					<Tables />
					<DependencyGrid />
				</SplitPane>
			);
		}
		if (isTablesVisible) {
			return <Tables />;
		}
		return <DependencyGrid />;
	};

	return (
		<>
			<div style={{ height: '100%', width: '100%' }}>
				<div style={{ height: '100%', position: 'relative' }}>
					{getContent()}
				</div>
			</div>
		</>
	);
};
export default Builder;
