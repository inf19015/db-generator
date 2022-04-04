import { AnyAction } from 'redux';
import { nanoid } from 'nanoid';
import produce from 'immer';
import * as actions from './generator.actions';
import * as mainActions from '../main/main.actions';
import * as accountActions from '../account/account.actions';
import * as packetActions from '../packets/packets.actions';
import { ExportSettingsTab } from '../../generator/exportSettings/ExportSettings.types';
import { DataTypeFolder, dataTypes, ExportTypeFolder, exportTypes } from '../../../../_plugins';
import { GeneratorLayout } from '../../generator/Generator.component';
import env from '../../../../_env';
import C from '../../constants';
import { GeneratorPanel } from '~types/general';
import { DTOptionsMetadata } from '~types/dataTypes';
import { GridContainerLayout } from "~core/generator/gridContainer/GridContainer.component";

export type DataRow = {
	id: string;
	title: string;
	// a title field can only contain a single error at a time. If it's empty, the UI will automatically show the error.
	// otherwise it's up to the current Export Type to provide a validateTitleField() method that returns the appropriate
	// (single) error
	titleError: string | null;
	dataType: DataTypeFolder | null;
	data: any;
	metadata?: DTOptionsMetadata;
};

export type Table = {
	id: string;
	title: string;
	sortedRows: string[];
};

export type Tables = {
	[id: string]: Table;
};

export type DataRows = {
	[id: string]: DataRow;
};

export type DependencyRow = {
	id: string;
	leftSide: string[];
	rightSide: string[];
	isMvd: boolean;
};

export type DependencyRows = {
	[id: string]: DependencyRow;
};

export type PreviewData = {
	[id: string]: any;
};

// we store all settings separately so in case a user switches from one to another, the previous settings aren't
// wiped out
export type ExportTypeSettings = {
	[exportType in ExportTypeFolder]: any;
};

// TODO remove the duplications for the types here
export type StashedGeneratorState = {
	exportType: ExportTypeFolder;
	rows: DataRows;
	dependencyRows: DependencyRows;
	tables: Tables;
	selectedTableTab: number;
	sortedTables: string[];
	sortedDependencyRows: string[];
	showGrid: boolean;
	showDependencyGrid: boolean;
	showPreview: boolean;
	smallScreenVisiblePanel: GeneratorPanel;
	generatorLayout: GeneratorLayout;
	gridContainerLayout: GeneratorLayout;
	showExportSettings: boolean;
	exportTypeSettings: Partial<ExportTypeSettings>;
	showGenerationSettingsPanel: boolean;
	showDataSetHistory: boolean;
	bulkActionPending: boolean;
	showHelpDialog: boolean;
	showClearPageDialog: boolean;
	helpDialogSection: DataTypeFolder | null;
	showChangeTableTitleDialog: boolean;
	showLineNumbers: boolean;
	enableLineWrapping: boolean;
	theme: string;
	previewTextSize: number;
	dataTypePreviewData: PreviewData;
	exportSettingsTab: ExportSettingsTab;
	numPreviewRows: number;
	stripWhitespace: boolean;
	numRowsToGenerate: number;
	currentDataSetId: number | null;
	currentDataSetName: string;
	selectedDataSetHistory: {
		historyId: number | null;
		isLatest: boolean;
	};
	isCountryNamesLoading: boolean;
	isCountryNamesLoaded: boolean;
};

const stashProps = [
	'exportType', 'rows', 'dependencyRows', 'sortedRows', 'tables', 'sortedTables', 'selectedTableTab', 'sortedDependencyRows', 'showGrid', 'showDependencyGrid', 'showPreview', 'smallScreenVisiblePanel',
	'generatorLayout', 'gridContainerLayout', 'showExportSettings', 'exportTypeSettings', 'showGenerationSettingsPanel', 'showHelpDialog',
	'helpDialogSection', 'showLineNumbers', 'enableLineWrapping', 'theme', 'previewTextSize', 'dataTypePreviewData',
	'exportSettingsTab', 'numPreviewRows', 'stripWhitespace', 'numPreviewRows', 'stripWhitespace', 'showChangeTableTitleDialog',
	'currentDataSetId', 'currentDataSetName'
];

export type CurrentDataSet = {
	dataSetId: number | null;
	dataSetName: string;
	lastSaved: any;
};

export type SelectedDataSetHistoryItem = {
	historyId: number | null;
	isLatest: boolean;
};

export type GeneratorState = {


	loadedDataTypes: {
		[str in DataTypeFolder]: boolean;
	};
	loadedExportTypes: {
		[str in ExportTypeFolder]: boolean;
	};

	// this is set to true on load after all necessary export types, data types for whatever last config they
	// has have loaded, as well as re-generate a new batch of preview data. It's used to show a spinner in the
	// Preview panel until it's ready to show data
	initialDependenciesLoaded: boolean;
	exportType: ExportTypeFolder;
	rows: DataRows;
	dependencyRows: DependencyRows;
	tables: Tables;
	selectedTableTab: number;
	sortedTables: string[];
	sortedDependencyRows: string[];
	showGrid: boolean;
	showDependencyGrid: boolean;
	showPreview: boolean;
	smallScreenVisiblePanel: GeneratorPanel;
	generatorLayout: GeneratorLayout;
	gridContainerLayout: GridContainerLayout;
	showExportSettings: boolean;
	exportTypeSettings: Partial<ExportTypeSettings>;
	showGenerationSettingsPanel: boolean;
	showDataSetHistory: boolean;
	bulkActionPending: boolean;
	showHelpDialog: boolean;
	showClearPageDialog: boolean;
	showChangeTableTitleDialog: boolean;
	helpDialogSection: DataTypeFolder | null;
	showLineNumbers: boolean;
	enableLineWrapping: boolean;
	theme: string;
	previewTextSize: number;
	dataTypePreviewData: PreviewData;
	exportSettingsTab: ExportSettingsTab;
	numPreviewRows: number;
	stripWhitespace: boolean;
	lastLayoutWidth: number | null;
	lastLayoutHeight: number | null;
	lastGridContainerLayoutWidth: number | null;
	lastGridContainerLayoutHeight: number | null;
	numRowsToGenerate: number;
	currentDataSet: CurrentDataSet;
	selectedDataSetHistory: SelectedDataSetHistoryItem;
	isCountryNamesLoading: boolean;
	isCountryNamesLoaded: boolean;
	stashedState: StashedGeneratorState | null;
};

export const getInitialState = (): GeneratorState => ({
	// the extra check for existence on these vars is just to placate the tests (not sure why needed)
	loadedDataTypes: Object.keys(dataTypes).reduce((acc: any, name: DataTypeFolder) => ({ ...acc, [name]: false }), {}),
	loadedExportTypes: Object.keys(exportTypes).reduce((acc: any, name: ExportTypeFolder) => ({ ...acc, [name]: false }), {}),
	initialDependenciesLoaded: false,
	exportType: env.defaultExportType,
	rows: {},
	dependencyRows: {},
	tables: {},
	sortedTables: [],
	selectedTableTab: 0,
	sortedDependencyRows: [],
	showGrid: true,
	showDependencyGrid: true,
	showPreview: true,
	smallScreenVisiblePanel: GeneratorPanel.grid,
	generatorLayout: GeneratorLayout.horizontal,
	gridContainerLayout: GridContainerLayout.vertical,
	showExportSettings: false,
	exportTypeSettings: {},
	numPreviewRows: 5,
	showLineNumbers: true,
	enableLineWrapping: true,
	theme: 'lucario',
	previewTextSize: 12,
	dataTypePreviewData: {},
	exportSettingsTab: 'exportType', // TODO enum
	showGenerationSettingsPanel: false,
	showDataSetHistory: false,
	bulkActionPending: true, // for brand new page loads we assume there's a bulk action to re-load
	showHelpDialog: false,
	showClearPageDialog: false,
	showChangeTableTitleDialog: false,
	helpDialogSection: null,
	numRowsToGenerate: env.defaultNumRows,
	stripWhitespace: false,
	lastLayoutWidth: null,
	lastLayoutHeight: null,
	lastGridContainerLayoutWidth: null,
	lastGridContainerLayoutHeight: null,
	currentDataSet: {
		dataSetId: null,
		dataSetName: '',
		lastSaved: null
	},
	selectedDataSetHistory: {
		historyId: null,
		isLatest: false
	},
	isCountryNamesLoading: false,
	isCountryNamesLoaded: false,
	stashedState: null
});

export const reducer = produce((draft: GeneratorState, action: AnyAction) => {
	switch (action.type) {
		case mainActions.RESET_STORE:
			const initialState = getInitialState();
			Object.keys(initialState).forEach((key) => {
				// @ts-ignore-line
				draft[key] = initialState[key];
			});
			break;

		// TODO needs to be cleaned up. Combine with LOGOUT action?
		case mainActions.AUTHENTICATED:
			if (!action.payload.authenticated) {
				draft.currentDataSet = {
					dataSetId: null,
					dataSetName: '',
					lastSaved: null
				};
			}
			break;

		case mainActions.LOGOUT:
			draft.currentDataSet = {
				dataSetId: null,
				dataSetName: '',
				lastSaved: null
			};
			break;

		case actions.CLEAR_GRID:
			draft.rows = {};
			draft.dataTypePreviewData = {};
			draft.showClearPageDialog = false;
			draft.currentDataSet = {
				dataSetId: null,
				dataSetName: '',
				lastSaved: null
			};
			break;

		case actions.RESET_GENERATOR: {
			draft.rows = {};
			draft.dependencyRows = {};
			draft.sortedDependencyRows = [];
			draft.sortedTables = [];
			draft.tables = {};
			draft.showClearPageDialog = false;

			const initialState = getInitialState();
			const settingsToReset = [
				'exportType', 'showGrid', 'showPreview' ,'showDependencyGrid', 'showExportSettings', 'numPreviewRows', 'showLineNumbers', 'rows',
				'sortedRows', 'dependencyRows', 'sortedDependencyRows', 'sortedTables', 'tables', 'selectedTableTab',
				'enableLineWrapping', 'theme', 'previewTextSize', 'exportSettingsTab', 'numRowsToGenerate',
				'stripWhitespace', 'currentDataSetId', 'currentDataSetName'
			];
			settingsToReset.forEach((setting: any) => {
				// @ts-ignore-line
				draft[setting] = initialState[setting];
			});

			Object.keys(action.payload.exportTypeInitialStates).forEach((et: ExportTypeFolder) => {
				draft.exportTypeSettings[et] = action.payload.exportTypeInitialStates[et];
			});
			break;
		}

		case actions.DATA_TYPE_LOADED:
			draft.loadedDataTypes[action.payload.dataType as DataTypeFolder] = true;
			break;

		case actions.EXPORT_TYPE_LOADED:
			draft.loadedExportTypes[action.payload.exportType as ExportTypeFolder] = true;

			// we only ever initialize the export settings to the initial state when the export type hasn't been
			// loaded yet. Note: this'll be an interesting upgrade problem
			if (!draft.exportTypeSettings[action.payload.exportType as ExportTypeFolder]) {
				draft.exportTypeSettings[action.payload.exportType as ExportTypeFolder] = action.payload.initialState;
			}
			break;

		case actions.SELECT_TABLE_TAB: {
			draft.selectedTableTab = action.payload.value;
			break;
		}

		case actions.ADD_TABLE: {
			const tableId = nanoid();
			draft.tables[tableId] = {
				id: tableId,
				title: 'Table',
				sortedRows: [],
			};
			draft.sortedTables = [
				...draft.sortedTables,
				tableId
			];
			break;
		}

		case actions.ADD_ROWS: {
			const newRowIDs: string[] = [];
			const tableId = action.payload.tableId;
			for (let i = 0; i < action.payload.numRows; i++) {
				const rowId = nanoid();
				draft.rows[rowId] = {
					id: rowId,
					title: '',
					titleError: null,
					dataType: null,
					data: null
				};
				newRowIDs.push(rowId);
			}
			draft.tables[tableId].sortedRows = [
				...draft.tables[tableId].sortedRows,
				...newRowIDs
			];
			break;
		}

		case actions.ADD_DEP_ROWS: {
			const newDepRowIDs: string[] = [];
			for (let i = 0; i < action.payload.numRows; i++) {
				const rowId = nanoid();
				draft.dependencyRows[rowId] = {
					id: rowId,
					leftSide: [],
					rightSide: [],
					isMvd: false
				};
				newDepRowIDs.push(rowId);}
			draft.sortedDependencyRows = [
				...draft.sortedDependencyRows,
				...newDepRowIDs
			];
			break;
		}

		case actions.REMOVE_TABLE: {
			const trimmedTableIds = draft.sortedTables.filter((i) => i !== action.payload.id);
			const updatedTables: Tables = {};
			trimmedTableIds.forEach((id) => {
				updatedTables[id] = draft.tables[id];
			});
			draft.tables = updatedTables;
			draft.sortedTables = trimmedTableIds;
			break;
		}

		case actions.REMOVE_ROW: {
			const tables = draft.sortedTables.map((id)=>draft.tables[id]);
			const table = tables.find((t) => t.sortedRows.some((rowId) => rowId === action.payload.rowId));
			if(table) {
				table.sortedRows = table.sortedRows.filter((id) => id !== action.payload.rowId);
				const allRowIds = tables.flatMap(t => t.sortedRows);
				const remainingRowIds = allRowIds.filter((id) => id !== action.payload.rowId);
				const updatedRows: DataRows = {};
				remainingRowIds.forEach((id) => {
					updatedRows[id] = draft.rows[id];
				});
				draft.rows = updatedRows;
			}
			break;
		}

		case actions.REMOVE_DEP_ROW: {
			const trimmedDepRowIds = draft.sortedDependencyRows.filter((i) => i !== action.payload.id);
			const updatedRows: DependencyRows = {};
			trimmedDepRowIds.forEach((id) => {
				updatedRows[id] = draft.dependencyRows[id];
			});
			draft.dependencyRows = updatedRows;
			draft.sortedDependencyRows = trimmedDepRowIds;
			break;
		}

		case actions.CHANGE_TABLE_TITLE: {
			draft.tables[action.payload.id].title = action.payload.value;
			break;
		}

		case actions.OPEN_CHANGE_TABLE_TITLE_DIALOG: {
			draft.showChangeTableTitleDialog = true;
			break;
		}

		case actions.CLOSE_CHANGE_TABLE_TITLE_DIALOG: {
			draft.showChangeTableTitleDialog = false;
			break;
		}

		case actions.SELECT_DEP_LEFT_SIDE: {
			draft.dependencyRows[action.payload.id].leftSide = action.payload.selected ?? [];
			break;
		}
		case actions.SELECT_DEP_RIGHT_SIDE: {
			draft.dependencyRows[action.payload.id].rightSide = action.payload.selected ?? [];
			break;
		}

		case actions.TOGGLE_DEP_MVD: {
			draft.dependencyRows[action.payload.id].isMvd = !draft.dependencyRows[action.payload.id].isMvd;
			break;
		}

		case actions.CHANGE_TITLE:
			draft.rows[action.payload.id].title = action.payload.value;
			draft.rows[action.payload.id].titleError = action.payload.titleError;
			break;

		case actions.SELECT_DATA_TYPE: {
			const { id, value, data, defaultTitle } = action.payload;
			const title = (draft.rows[id].title) ? draft.rows[id].title : defaultTitle;

			draft.rows[id] = {
				...draft.rows[id],
				dataType: value,
				data,
				title
			};
			break;
		}

		case actions.SELECT_EXPORT_TYPE:
			draft.exportType = action.payload.exportType;
			break;

		case actions.REFRESH_PREVIEW_DATA:
			draft.dataTypePreviewData = {
				...action.payload.dataTypePreviewData
			};
			break;

		case actions.CONFIGURE_DATA_TYPE:
			draft.rows[action.payload.id].data = action.payload.data;
			if (action.payload.metadata) {
				draft.rows[action.payload.id].metadata = action.payload.metadata;
			}
			break;

		case actions.CONFIGURE_EXPORT_TYPE:
			draft.exportTypeSettings[draft.exportType] = action.payload.data;
			break;

		case actions.REPOSITION_ROW:
			const tables = draft.sortedTables.map((id)=>draft.tables[id]);
			const oldTable = tables.find((t) => t.sortedRows.some((rowId) => rowId === action.payload.id));
			const newTable = draft.tables[action.payload.tableId];
			// @ts-ignore
			oldTable.sortedRows = oldTable.sortedRows.filter((i) => i !== action.payload.id);
			newTable.sortedRows.splice(action.payload.newIndex, 0, action.payload.id);
			break;

		case actions.REPOSITION_DEP_ROW:
			const newDepArray = draft.sortedDependencyRows.filter((i) => i !== action.payload.id);
			newDepArray.splice(action.payload.newIndex, 0, action.payload.id);
			draft.sortedDependencyRows = newDepArray;
			break;

		case actions.TOGGLE_GRID:
			draft.showGrid = !draft.showGrid;
			if (!draft.showPreview && !draft.showDependencyGrid) {
				draft.showPreview = true;
			}
			break;

		case actions.TOGGLE_DEPENDENCY_GRID:
			draft.showDependencyGrid = !draft.showDependencyGrid;
			if (!draft.showPreview && !draft.showGrid) {
				draft.showPreview = true;
			}
			break;

		case actions.TOGGLE_PREVIEW:
			draft.showPreview = !draft.showPreview;
			if (!draft.showGrid && !draft.showDependencyGrid) {
				draft.showGrid = true;
			}
			break;

		case actions.TOGGLE_LAYOUT:
			draft.generatorLayout = draft.generatorLayout === GeneratorLayout.horizontal ? GeneratorLayout.vertical : GeneratorLayout.horizontal;
			break;

		case actions.TOGGLE_GRID_CONTAINER_LAYOUT:
			draft.gridContainerLayout = draft.gridContainerLayout === GridContainerLayout.horizontal ? GridContainerLayout.vertical : GridContainerLayout.horizontal;
			break;

		case actions.TOGGLE_LINE_WRAPPING:
			draft.enableLineWrapping = !draft.enableLineWrapping;
			break;

		case actions.UPDATE_NUM_PREVIEW_ROWS:
			draft.numPreviewRows = action.payload.numRows;
			break;

		case actions.CHANGE_THEME:
			draft.theme = action.payload.theme;
			break;

		case actions.TOGGLE_SHOW_LINE_NUMBERS:
			draft.showLineNumbers = !draft.showLineNumbers;
			break;

		case actions.SET_PREVIEW_TEXT_SIZE:
			draft.previewTextSize = action.payload.previewTextSize;
			break;

		case actions.TOGGLE_EXPORT_SETTINGS:
			draft.showExportSettings = !draft.showExportSettings;
			if (action.payload?.tab) {
				draft.exportSettingsTab = action.payload.tab;
			}
			break;

		case actions.HIDE_EXPORT_SETTINGS:
			draft.showExportSettings = false;
			break;

		case actions.SHOW_GENERATION_SETTINGS_PANEL:
			draft.showGenerationSettingsPanel = true;
			break;

		case actions.HIDE_START_GENERATION_PANEL:
			draft.showGenerationSettingsPanel = false;
			break;

		case actions.UPDATE_NUM_ROWS_TO_GENERATE:
			draft.numRowsToGenerate = parseInt(action.payload.numRowsToGenerate, 10);
			break;

		case actions.TOGGLE_STRIP_WHITESPACE:
			draft.stripWhitespace = !draft.stripWhitespace;
			break;

		case actions.SET_PANEL_SIZE:
			const setting = draft.generatorLayout === 'horizontal' ? 'lastLayoutHeight' : 'lastLayoutWidth';
			draft[setting] = action.payload.size;
			break;

		case actions.SET_GRID_PANEL_SIZE:
			const setting2 = draft.gridContainerLayout === 'horizontal' ? 'lastGridContainerLayoutHeight' : 'lastGridContainerLayoutWidth';
			draft[setting2] = action.payload.size;
			break;

		case actions.CHANGE_SMALL_SCREEN_VISIBLE_PANEL:
			draft.smallScreenVisiblePanel = draft.smallScreenVisiblePanel === GeneratorPanel.grid ? GeneratorPanel.preview : GeneratorPanel.grid;
			break;

		case actions.SET_BULK_ACTION:
			draft.bulkActionPending = !action.payload.isComplete;
			break;

		case actions.SET_INITIAL_DEPENDENCIES_LOADED:
			draft.initialDependenciesLoaded = true;
			break;

		// only hide the generation settings panel for larger packet sizes. For smaller sizes, just show the spinner
		// overlay
		case packetActions.START_GENERATION:
			if (action.payload.numRowsToGenerate > C.SMALL_GENERATION_COUNT) {
				draft.showGenerationSettingsPanel = false;
			}
			break;

		case accountActions.SET_CURRENT_DATA_SET:
			draft.currentDataSet = {
				dataSetId: action.payload.dataSetId,
				dataSetName: action.payload.dataSetName,
				lastSaved: null
			};
			break;

		case accountActions.UPDATE_CURRENT_DATA_SET_LAST_SAVED:
			draft.currentDataSet.lastSaved = action.payload.lastSaved;
			break;

		case actions.LOAD_DATA_SET: {
			const { exportType, exportTypeSettings, rows, sortedRows, dataSetId, dataSetName } = action.payload;
			draft.exportType = exportType;
			draft.exportTypeSettings[exportType as ExportTypeFolder] = exportTypeSettings;
			draft.rows = rows;
			draft.currentDataSet = {
				dataSetId,
				dataSetName,
				lastSaved: null
			};
			break;
		}

		case accountActions.UPDATE_CURRENT_DATA_SET_NAME:
			draft.currentDataSet.dataSetName = action.payload.dataSetName;
			break;

		case actions.STASH_GENERATOR_STATE: {
			const lastStashedState: any = {};
			stashProps.map((prop: string) => {
				// @ts-ignore-line
				lastStashedState[prop] = draft[prop];
			});
			draft.stashedState = lastStashedState;
			break;
		}

		case actions.POP_STASHED_STATE: {
			if (draft.stashedState) {
				stashProps.map((prop: string) => {
					// @ts-ignore-line
					draft[prop] = draft.stashedState[prop];
				});
			}
			draft.stashedState = null;
			break;
		}

		// loads the last stashed state, but doesn't pop it
		case actions.LOAD_STASHED_STATE:
			stashProps.map((prop: string) => {
				// @ts-ignore-line
				draft[prop] = draft.stashedState[prop];
			});
			draft.selectedDataSetHistory = {
				historyId: null,
				isLatest: true
			};
			break;

		case actions.SHOW_HELP_DIALOG:
			draft.showHelpDialog = true;
			draft.helpDialogSection = action.payload.dataType;
			break;

		case actions.HIDE_HELP_DIALOG:
			draft.showHelpDialog = false;
			break;

		case actions.SHOW_DATA_SET_HISTORY:
			draft.showDataSetHistory = true;
			break;

		case actions.HIDE_DATA_SET_HISTORY:
			draft.showDataSetHistory = false;
			draft.selectedDataSetHistory = {
				historyId: null,
				isLatest: false
			};
			break;

		case actions.SHOW_CLEAR_PAGE_DIALOG:
			draft.showClearPageDialog = true;
			break;

		case actions.HIDE_CLEAR_GRID_DIALOG:
			draft.showClearPageDialog = false;
			break;

		case actions.SELECT_DATA_SET_HISTORY_ITEM:
			draft.selectedDataSetHistory = {
				historyId: action.payload.historyId,
				isLatest: action.payload.isLatest
			};
			break;

		case actions.REQUEST_COUNTRY_NAMES:
			draft.isCountryNamesLoading = true;
			break;

		case actions.COUNTRY_NAMES_LOADED:
			draft.isCountryNamesLoading = false;
			draft.isCountryNamesLoaded = true;
			break;
	}
}, getInitialState());

export default reducer;

