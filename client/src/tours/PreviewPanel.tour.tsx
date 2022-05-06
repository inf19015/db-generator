import React from 'react';
import Reactour, { ReactourStepPosition } from 'reactour';
import { getStrings } from '~utils/langUtils';
import store from '~core/store';
import * as actions from '~store/generator/generator.actions';
import * as selectors from '~store/generator/generator.selectors';
import { TourCompleteStep } from './Components.tour';
import { TourProps } from '~types/general';
import { nanoid } from "nanoid";

const Step1 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.thePreviewPanel}</h2>
			<p>
				{i18n.previewPanelTourDesc}
			</p>
		</>
	);
};

const Step2 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.panelContents}</h2>
			<p>
				{i18n.panelContentsDesc}
			</p>
		</>
	);
};

const Step3 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.panelControls}</h2>
			<p>
				{i18n.previewPanelControlsDesc}
			</p>
		</>
	);
};

const Step4 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.theExportTypeBtn}</h2>
			<p>
				{i18n.exportTypeBtnDesc}
			</p>
			<p>
				{i18n.clickExportTypeBtn}
			</p>
		</>
	);
};

const Step5 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.editingExportTypes}</h2>
			<p>
				{i18n.editExportTypePage}
			</p>
			<p>
				{i18n.editExportTypePageConfig}
			</p>
		</>
	);
};

const Step6 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.exportTypeSelection}</h2>
			<p>
				{i18n.exportTypeSelectionDesc}
			</p>
		</>
	);
};

const Step9 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.panelTabs}</h2>
			<p>
				{i18n.panelTabsDesc}
			</p>
		</>
	);
};

const commonStyles = {
	borderRadius: 6,
	margin: 12
};


const steps = [
	{
		content: Step1,
		style: {
			...commonStyles
		},
		position: 'center' as ReactourStepPosition,
		action: (): void => {
			setTimeout(async () => {
				await store.dispatch(actions.clearPage(false));
				const tableId = nanoid();
				await store.dispatch(actions.addTable(tableId, "Tour_Table"));
				await store.dispatch(actions.addRows(5, tableId));

				const state = store.getState();
				const rows = selectors.getSortedRowsArray(state);

				const layout = selectors.getGeneratorLayout(state);
				if (layout === 'horizontal') {
					store.dispatch(actions.toggleLayout());
				}
				if (!selectors.isGridVisible(state)) {
					store.dispatch(actions.toggleGrid());
				}
				if (!selectors.isPreviewVisible(state)) {
					store.dispatch(actions.togglePreview());
				}
				if (selectors.isDependencyGridVisible(state)) {
					store.dispatch(actions.toggleDependencyGrid());
				}

				const ids = rows.map(({ id }) => id);

				store.dispatch(actions.onSelectDataType('Country', ids[0]));
				store.dispatch(actions.onSelectDataType('Region', ids[1]));
				store.dispatch(actions.onSelectDataType('City', ids[2]));
				store.dispatch(actions.onSelectDataType('StreetAddress', ids[3]));
				await store.dispatch(actions.onSelectDataType('PostalZip', ids[4]));

				store.dispatch(actions.refreshPreview(ids));

				store.dispatch(actions.onSelectExportType('SQL'));
			}, 10);
		}
	},
	{
		content: Step2,
		selector: '.gdGridPanel>div:nth-child(3)',
		style: {
			...commonStyles,
			marginLeft: -20
		}
	},

	{
		content: Step3,
		selector: '.tour-previewPanelControls',
		style: {
			...commonStyles
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		content: Step4,
		selector: '.tour-exportTypeBtn',
		style: {
			...commonStyles
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		content: Step5,
		style: {
			...commonStyles
		},
		action: (): void => {
			store.dispatch(actions.toggleExportSettings('previewPanel'));
		}
	},
	{
		content: Step6,
		selector: '.tour-dbTypeDropdown',
		style: {
			...commonStyles,
			marginLeft: 20
		},
		position: 'right' as ReactourStepPosition
	},
	{
		content: Step9,
		selector: '.tour-exportTypePanelTabs',
		style: {
			...commonStyles,
			marginLeft: 20
		},
		position: 'left' as ReactourStepPosition
	},
	{
		content: TourCompleteStep,
		style: {
			...commonStyles
		}
	}
];

const Tour = ({ isOpen, onClose, maskClassName, closeWithMask, disableInteraction, accentColor, className }: TourProps): JSX.Element => (
	<Reactour
		steps={steps}
		isOpen={isOpen}
		onRequestClose={onClose}
		maskClassName={maskClassName}
		maskSpace={0}
		closeWithMask={closeWithMask}
		disableInteraction={disableInteraction}
		accentColor={accentColor}
		className={className}
		disableFocusLock={true}
	/>
);

export default Tour;
