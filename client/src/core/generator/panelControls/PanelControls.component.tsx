import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Delete from '@mui/icons-material/Delete';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import SwapHoriz from '@mui/icons-material/SwapHoriz';
import SwapVert from '@mui/icons-material/SwapVert';
import { toSentenceCase } from '~utils/stringUtils';
import { Tooltip } from '~components/tooltips';
import { GeneratorLayout } from '../Generator.component';
import * as styles from './PanelControls.scss';
import { GridContainerLayout } from "~core/generator/gridContainer/GridContainer.component";

export type PanelControlsProps = {
	className: string;
	toggleGrid: () => void;
	toggleDependencyGrid: () => void;
	togglePreview: () => void;
	toggleLayout: () => void;
	toggleGridContainerLayout: () => void;
	showClearPageDialog: () => void;
	isGridVisible: boolean;
	isDependencyGridVisible: boolean;
	isPreviewVisible: boolean;
	generatorLayout: GeneratorLayout;
	gridContainerLayout: GridContainerLayout;
	i18n: any;
};

export const PanelControls = ({
	className, toggleGrid, toggleDependencyGrid, togglePreview, toggleLayout, toggleGridContainerLayout,
								  showClearPageDialog, isGridVisible, isPreviewVisible, isDependencyGridVisible, generatorLayout, gridContainerLayout,i18n
}: PanelControlsProps): JSX.Element => {
	const toggleLayoutEnabled = (isGridVisible || isDependencyGridVisible) && isPreviewVisible;
	const toggleGridContainerLayoutEnabled = isGridVisible && isDependencyGridVisible;
	const GridIcon = isGridVisible ? CheckBox : CheckBoxOutlineBlank;
	const DependencyGridIcon = isDependencyGridVisible ? CheckBox : CheckBoxOutlineBlank;
	const PreviewIcon = isPreviewVisible ? CheckBox : CheckBoxOutlineBlank;
	const ToggleDirectionIcon = generatorLayout === 'horizontal' ? SwapHoriz : SwapVert;
	const ToggleGridContainerDirectionIcon = gridContainerLayout === 'horizontal' ? SwapHoriz : SwapVert;

	let gridBtnClasses = '';
	if (isGridVisible) {
		gridBtnClasses += ` ${styles.btnSelected}`;
	}

	let gridDepBtnClasses = '';
	if (isDependencyGridVisible) {
		gridDepBtnClasses += ` ${styles.btnSelected}`;
	}

	let previewBtnClasses = '';
	if (isPreviewVisible) {
		previewBtnClasses += ` ${styles.btnSelected}`;
	}

	// Material UI throws an error when it comes to having a tooltip on a disabled button, and within a ButtonGroup
	// context it messes up the styles wrapping <Button> in a <span> like we do elsewhere. So this just constructs
	// the JSX differently for the enabled/disabled state
	const getToggleLayoutBtn = (): JSX.Element => {
		if (toggleLayoutEnabled) {
			return (
				<Tooltip title={<span dangerouslySetInnerHTML={{ __html: i18n.togglePanelLayout }}/>}
					 arrow
					 disableHoverListener={!toggleLayoutEnabled}
					 disableFocusListener={!toggleLayoutEnabled}>
					<Button onClick={toggleLayout} disabled={!toggleLayoutEnabled} className={styles.toggleLayoutBtn}>
						<ToggleDirectionIcon />
					</Button>
				</Tooltip>
			);
		}

		return (
			<Button onClick={toggleLayout} disabled={!toggleLayoutEnabled} className={`${styles.toggleLayoutBtn} ${styles.toggleLayoutBtnDisabled}`}>
				<ToggleDirectionIcon />
			</Button>
		);
	};

	const getGridContainerToggleLayoutBtn = (): JSX.Element => {
		if (toggleGridContainerLayoutEnabled) {
			return (
				<Tooltip title={<span dangerouslySetInnerHTML={{ __html: i18n.toggleGridContainerPanelLayout }}/>}
					arrow
					disableHoverListener={!toggleGridContainerLayoutEnabled}
					disableFocusListener={!toggleGridContainerLayoutEnabled}>
					<Button onClick={toggleGridContainerLayout} disabled={!toggleGridContainerLayoutEnabled} className={styles.toggleLayoutBtn}>
						<ToggleGridContainerDirectionIcon />
					</Button>
				</Tooltip>
			);
		}

		return (
			<Button onClick={toggleGridContainerLayout} disabled={!toggleGridContainerLayoutEnabled} className={`${styles.toggleLayoutBtn} ${styles.toggleLayoutBtnDisabled}`}>
				<ToggleGridContainerDirectionIcon />
			</Button>
		);
	};

	return (
		<ButtonGroup aria-label="" size="small" className={`${className} ${styles.builderControls}`}>
			<Tooltip title={<span dangerouslySetInnerHTML={{ __html: i18n.hideShowGrid }} />} arrow>
				<Button className={gridBtnClasses} onClick={toggleGrid} startIcon={<GridIcon fontSize="small"/>}>
					{i18n.tables}
				</Button>
			</Tooltip>
			<Tooltip title={<span dangerouslySetInnerHTML={{ __html: i18n.hideShowDepGrid }} />} arrow>
				<Button className={gridDepBtnClasses} onClick={toggleDependencyGrid} startIcon={<DependencyGridIcon fontSize="small"/>}>
					{i18n.depGrid}
				</Button>
			</Tooltip>
			<Tooltip title={<span dangerouslySetInnerHTML={{ __html: i18n.hideShowPreviewPanel }} />} arrow>
				<Button className={previewBtnClasses} onClick={togglePreview} startIcon={<PreviewIcon/>}>
					{i18n.preview}
				</Button>
			</Tooltip>
			{getToggleLayoutBtn()}
			{getGridContainerToggleLayoutBtn()}
			<Tooltip title={<span dangerouslySetInnerHTML={{ __html: toSentenceCase(i18n.clearPage) }} />} arrow>
				<Button onClick={showClearPageDialog}>
					<Delete/>
				</Button>
			</Tooltip>
		</ButtonGroup>
	);
};

export default PanelControls;
