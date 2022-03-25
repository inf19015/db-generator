import React from 'react';
import { useWindowSize } from 'react-hooks-window-size';
import SplitPane from 'react-split-pane';
import Preview from './previewPanel/PreviewPanel.container';
import { GeneratorPanel } from '~types/general';
import ExportSettings from './exportSettings/ExportSettings.container';
import ActivityPanel from '../generationPanel/ActivityPanel.container';
import GenerationSettings from '../generationPanel/GenerationSettings.container';
import DataSetHistory from './dataSetHistory/DataSetHistory.container';
import HelpDialog from '../dialogs/help/HelpDialog.container';
import ClearPageDialog from '../dialogs/clearPage/ClearPage.container';
import IncompatibleBrowser from './IncompatibleBrowser.component';
import * as generalUtils from '../../utils/generalUtils';
import C from '../constants';
import './Generator.scss';
import GridContainer from './gridContainer/GridContainer.container';
import RenameTableDialog from "~core/dialogs/renameTable/RenameTable.container";

export const enum GeneratorLayout {
	horizontal = 'horizontal',
	vertical = 'vertical'
}

export type GeneratorProps = {
	i18n: any;
	isGridVisible: boolean;
	isDependencyGridVisible: boolean;
	isPreviewVisible: boolean;
	generatorLayout: GeneratorLayout;
	onResizePanels: (size: number) => void;
	lastLayoutWidth: number | null;
	lastLayoutHeight: number | null;
	smallScreenVisiblePanel: GeneratorPanel;
	showDataSetHistory: boolean;
}

const Builder = ({
	isGridVisible, isPreviewVisible, isDependencyGridVisible, generatorLayout, onResizePanels, lastLayoutWidth, lastLayoutHeight,
	smallScreenVisiblePanel, showDataSetHistory, i18n
}: GeneratorProps): JSX.Element => {

	const windowSize = useWindowSize();
	const onResize = (size: number): void => onResizePanels(size);

	const isGridSectionVisible = isDependencyGridVisible || isGridVisible;
	let minSize: number;
	let maxSize: number;
	const gridSize = {
		height: windowSize.height,
		width: windowSize.width
	};
	let defaultSize: number;
	if (generatorLayout === GeneratorLayout.vertical) {
		minSize = 350;
		maxSize = windowSize.width - 350;
		if (lastLayoutWidth) {
			defaultSize = lastLayoutWidth < maxSize ? lastLayoutWidth : maxSize;
		}else {
			defaultSize = windowSize.width / 2;
		}
		gridSize.width = defaultSize;
	} else {
		minSize = 100;
		maxSize = (windowSize.height - (C.FOOTER_HEIGHT)) - 100;
		if (lastLayoutHeight) {
			defaultSize = lastLayoutHeight < maxSize ? lastLayoutHeight : maxSize;
		}else {
			defaultSize = windowSize.height / 2;
		}
		gridSize.height = defaultSize;
	}

	const getContent = (): JSX.Element => {
		if (generalUtils.isSafari) {
			return <IncompatibleBrowser i18n={i18n} />;
		}

		if (windowSize.width < C.SMALL_SCREEN_WIDTH) {
			return smallScreenVisiblePanel === 'grid' ? <GridContainer /> : <Preview />;
		}

		// data set history only available on desktop
		// if (showDataSetHistory) {
		// 	return <Preview />;
		// }

		if (isGridSectionVisible && isPreviewVisible) {
			return (
				<SplitPane
					className="gdGridPanel"
					split={generatorLayout}
					minSize={minSize}
					maxSize={maxSize}
					defaultSize={defaultSize}
					size={defaultSize}
					onChange={onResize}>
					<GridContainer parentSize = {gridSize}/>
					<Preview />
				</SplitPane>
			);
		}
		if (isGridSectionVisible) {
			return <GridContainer parentSize = {gridSize}/>;
		}
		return <Preview />;
	};

	return (
		<>
			<div style={{ height: '100%' }}>
				<div style={{ height: '100%', position: 'relative' }}>
					{getContent()}
				</div>
				<ExportSettings />
				<DataSetHistory />
				<GenerationSettings />
				<ActivityPanel />
				<ClearPageDialog />
				<HelpDialog />
				<RenameTableDialog />
			</div>
		</>
	);
};
export default Builder;
