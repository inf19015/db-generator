import React from 'react';
import Reactour, { ReactourStepPosition } from 'reactour';
import { getStrings } from '~utils/langUtils';
import store from '~core/store';
import * as actions from '~store/generator/generator.actions';
import * as selectors from '~store/generator/generator.selectors';
import { TourCompleteStep } from './Components.tour';
import { TourProps } from '~types/general';
import { GeneratorLayout } from '~core/generator/Generator.component';
import { nanoid } from "nanoid";

const Step1 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.theDependenciesTour}</h2>
			<p>
				{i18n.dependenciesTourIntroDesc1}
			</p>
			<p>
				{i18n.dependenciesTourIntroDesc2}
			</p>
		</>
	);
};

const Step2 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.depColumns}</h2>

			<p>
				{i18n.depColumnsDesc}
			</p>
		</>
	);
};

const Step3 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.depRowNumber}</h2>
			<p>
				{i18n.depRowNumDesc1}
			</p>
		</>
	);
};

const Step4 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.attribute}</h2>
			<p>
				{i18n.attributeDesc}
			</p>
		</>
	);
};

const Step5 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.dependencyTourTitle}</h2>
			<p>
				{i18n.dependencyDesc}
			</p>
		</>
	);
};



const Step6 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.deleteDepRow}</h2>
			<p>
				{i18n.deleteDepRowDesc}
			</p>
		</>
	);
};

const Step7 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.addDepRows}</h2>
			<p>
				{i18n.addDepRowsDesc}
			</p>
		</>
	);
};
const Step8 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.convert3nf}</h2>
			<p>
				{i18n.convert3nfDesc}
			</p>
		</>
	);
};

const Step9 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.convert3nf}</h2>
			<p>
				{i18n.convert3nfTables}
			</p>
		</>
	);
};

const Step10 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.convertAddPKS}</h2>
			<p>
				{i18n.convertAddPKSDesc}
			</p>
		</>
	);
};

const Step11 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.convertAddPKS}</h2>
			<p>
				{i18n.convertAddPKSNewDepsDesc}
			</p>
		</>
	);
};

const Step12 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.convert3nfshowPK}</h2>
			<p>
				{i18n.convert3nfshowPKDesc}
			</p>
		</>
	);
};

const Step13 = (): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<>
			<h2>{i18n.convert3nfshowFK}</h2>
			<p>
				{i18n.convert3nfshowFKDesc}
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
			setTimeout(() => {
				store.dispatch(actions.clearPage(false));
				const tableId = nanoid();
				store.dispatch(actions.addTable(tableId, "Tour_Table"));
				store.dispatch(actions.addRows(8, tableId));

				const state = store.getState();
				const rows = selectors.getSortedRowsArray(state);

				if (!selectors.isGridVisible(state)) {
					store.dispatch(actions.toggleGrid());
				}
				if (selectors.isPreviewVisible(state)) {
					store.dispatch(actions.togglePreview());
				}
				if (!selectors.isDependencyGridVisible(state)) {
					store.dispatch(actions.toggleDependencyGrid());
				}

				const layout = selectors.getGeneratorLayout(state);
				if (layout === GeneratorLayout.horizontal) {
					store.dispatch(actions.toggleLayout());
				}

				const ids = rows.map(({ id }) => id);

				store.dispatch(actions.onSelectDataType('Names', ids[0], false));
				store.dispatch(actions.onSelectDataType('Names', ids[1], false));
				store.dispatch(actions.onSelectDataType('Email', ids[2], false));
				store.dispatch(actions.onSelectDataType('StreetAddress', ids[3], false));
				store.dispatch(actions.onSelectDataType('TextFixed', ids[4], false));
				store.dispatch(actions.onSelectDataType('NumberRange', ids[5], false));
				store.dispatch(actions.onSelectDataType('NumberRange', ids[6], false));
				store.dispatch(actions.onSelectDataType('Date', ids[7], false));

				setTimeout(() => {
					store.dispatch(actions.onChangeTitle(ids[0], "Firstname"));
					store.dispatch(actions.onConfigureDataType(ids[0], { example: "Name", options: ["Name"] }));

					store.dispatch(actions.onChangeTitle(ids[1], "Lastname"));
					store.dispatch(actions.onConfigureDataType(ids[1], { example: "Surname", options: ["Surname"] }));

					store.dispatch(actions.onChangeTitle(ids[2], "Email"));
					store.dispatch(actions.onConfigureDataType(ids[2], { source: "fields", fieldId1: ids[0], fieldId2: ids[1],
						domains: "google,gmail,lehre.dhbw-stuttgart,protonmail", domainSuffixes: "com,de" }));

					store.dispatch(actions.onChangeTitle(ids[3], "Address"));

					store.dispatch(actions.onChangeTitle(ids[4], "Article"));
					store.dispatch(actions.onConfigureDataType(ids[4], { numWords: 1, textSource: "lipsum", customText: "" }));

					store.dispatch(actions.onChangeTitle(ids[5], "Price"));
					store.dispatch(actions.onConfigureDataType(ids[5], { min: 0, max: 200 }));

					store.dispatch(actions.onChangeTitle(ids[6], "Amount"));
					store.dispatch(actions.onConfigureDataType(ids[6], { min: 1, max: 10 }));

					store.dispatch(actions.onChangeTitle(ids[7], "PurchaseTimestamp"));
					store.dispatch(actions.onConfigureDataType(ids[7], { fromDate: 1620238075, toDate: 1683310075,
						example: "y-LL-dd HH:mm:ss", format: "y-LL-dd HH:mm:ss" }));

					store.dispatch(actions.addDepRow(nanoid(), [ids[0], ids[1]], [ids[2], ids[3]]));
					store.dispatch(actions.addDepRow(nanoid(), [ids[4]], [ids[5]]));
					store.dispatch(actions.addDepRow(nanoid(), [ids[7]], [ids[0], ids[1], ids[4], ids[6]]));

					store.dispatch(actions.refreshPreview(ids));
				}, 10);

				document.querySelector('.tour-scrollableGridRows')!.scrollTop = 0;
			}, 10);
		}
	},
	{
		content: Step2,
		selector: '.tour-gridDepHeader',
		style: {
			...commonStyles
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		content: Step3,
		selector: '.tour-gridDepRow div:nth-child(1)',
		style: {
			...commonStyles
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		content: Step4,
		selector: '.tour-gridDepRow>div:nth-child(2)>div:nth-child(1) div',
		style: {
			...commonStyles
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		content: Step5,
		selector: '.tour-gridDepRow>div:nth-child(3)>div:nth-child(1) div',
		style: {
			...commonStyles
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		content: Step6,
		selector: '.tour-gridDepRow div:nth-child(4) svg',
		style: {
			...commonStyles
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		content: Step7,
		selector: '.tour-addDepRows',
		style: {
			...commonStyles,
			marginTop: 20
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		// 3nf
		content: Step8,
		selector: '.tour-convert3nf',
		action: (): void => {
			setTimeout(() => store.dispatch(actions.convertTo3NF()), 10);
		},
		style: {
			...commonStyles,
			marginTop: -20
		},
		position: 'top' as ReactourStepPosition
	},
	{
		// show that new Tables exist
		content: Step9,
		selector: '.tour-table-tabs',
		style: {
			...commonStyles,
			marginTop: 20
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		// show add PK
		content: Step10,
		action: (): void => {
			setTimeout(() => {
				store.dispatch(actions.convertAddPKS());
				setTimeout(() => store.dispatch(actions.onSelectTableTab(2)), 10);
			}, 100);
		},
		selector: '.tour-convertAddPks',
		style: {
			...commonStyles,
			marginTop: -20
		},
		position: 'top' as ReactourStepPosition
	},
	{
		// show new deps
		content: Step11,
		selector: '.tour-gridDepRows>div:nth-child(1)>div:nth-child(6)',
		style: {
			...commonStyles,
			marginTop: 20
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		// show primary key
		content: Step12,
		selector: '#simple-tabpanel-2>div:nth-child(1)>div:nth-child(2)>div:nth-child(1)>div:nth-child(1)>div:nth-child(1)',
		style: {
			...commonStyles,
			marginTop: 20
		},
		position: 'bottom' as ReactourStepPosition
	},
	{
		// show foreignkey
		content: Step13,
		selector: '#simple-tabpanel-2>div:nth-child(1)>div:nth-child(2)>div:nth-child(1)>div:nth-child(1)>div:nth-child(5)',
		style: {
			...commonStyles,
			marginTop: 20
		},
		position: 'bottom' as ReactourStepPosition
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
