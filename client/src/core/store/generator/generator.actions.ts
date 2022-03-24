import { Dispatch } from 'redux';
import * as selectors from './generator.selectors';
import { getCurrentDataSet, isCountryNamesLoaded, isCountryNamesLoading } from './generator.selectors';
import { ExportSettingsTab } from '../../generator/exportSettings/ExportSettings.types';
import { DataTypeFolder, ExportTypeFolder } from '../../../../_plugins';
import { registerInterceptors } from '../../actionInterceptor';
import { requestDataTypeBundle } from '~utils/dataTypeUtils';
import * as coreUtils from '~utils/coreUtils';
import { getStrings } from '~utils/langUtils';
import { getUniqueString } from '~utils/stringUtils';
import { getExportTypeInitialState, loadExportTypeBundle } from '~utils/exportTypeUtils';
import { addToast } from '~utils/generalUtils';
import { DTBundle, DTOptionsMetadata } from '~types/dataTypes';
import { GDAction } from '~types/general';
import C from '../../constants';
import { getUnchangedData } from '../../generationPanel/generation.helpers';
import * as accountActions from '~store/account/account.actions';
import { DataSetListItem } from '~types/dataSets';
import { getUnique } from '~utils/arrayUtils';
import { getCountryNamesBundle } from '~utils/coreUtils';
import { getCountryData } from '~utils/countryUtils';
import { nanoid } from 'nanoid';



export const ADD_ROWS = 'ADD_ROWS';
export const addRows = (numRows: number, tableId?: string): GDAction => ({
	type: ADD_ROWS,
	payload: {
		numRows,
		tableId
	}
});
export const ADD_DEP_ROWS = 'ADD_DEP_ROWS';
export const addDepRows = (numRows: number): GDAction => ({
	type: ADD_DEP_ROWS,
	payload: {
		numRows
	}
});

export const ADD_TABLE = 'ADD_TABLE';
export const addTable = (): GDAction => ({ type: ADD_TABLE });

export const REMOVE_TABLE = 'REMOVE_TABLE';
export const removeTable = (id: string): any => async (dispatch: Dispatch, getState: any): Promise<any> => {
	const state = getState();
	const rows = selectors.getRowsOfTableArray(state, id);
	rows.forEach((row) => {
		dispatch(removeRow(row.id));
	});
	const tableIds = selectors.getSortedTables(state);
	const tabIndex = tableIds.length -1;
	const lastTable = tableIds[tabIndex];

	dispatch({ type: REMOVE_TABLE, payload: { id } });
	if(lastTable === id){
		dispatch({ type: SELECT_TABLE_TAB, payload: { value: tabIndex-1 } });
	}
};

export const REMOVE_ROW = 'REMOVE_ROW';
export const removeRow = (rowId: string): any => async (dispatch: Dispatch, getState: any): Promise<any> => {
	const state = getState();
	const dependencyRows = selectors.getDependencyRows(state);
	dispatch({ type: REMOVE_ROW, payload: { rowId } });
	for(const depRowId in dependencyRows) {
		const row = dependencyRows[depRowId];
		let selected = row.leftSide.filter((id) => rowId !== id);
		if(selected !== row.leftSide){
			dispatch({ type: SELECT_DEP_LEFT_SIDE, payload: { id: depRowId, selected: selected } });
		}
		selected = row.rightSide.filter((id) => rowId !== id);
		if(selected !== row.rightSide){
			dispatch({ type: SELECT_DEP_RIGHT_SIDE, payload: { id: depRowId, selected: selected } });
		}

	}
};

export const REMOVE_DEP_ROW = 'REMOVE_DEP_ROW';
export const removeDepRow = (id: string): GDAction => ({ type: REMOVE_DEP_ROW, payload: { id } });

export const CHANGE_TABLE_TITLE = 'CHANGE_TABLE_TITLE';
export const onChangeTableTitle = (id: string, value: string): GDAction => ({ type: CHANGE_TABLE_TITLE, payload: { id, value } });

export const SELECT_TABLE_TAB = 'SELECT_TABLE_TAB';
export const onSelectTableTab = (value: number): GDAction => ({ type: SELECT_TABLE_TAB, payload: { value } });

export const CHANGE_TITLE = 'CHANGE_TITLE';
export const onChangeTitle = (id: string, value: string): any => async (dispatch: Dispatch, getState: any): Promise<any> => {
	const state = getState();
	const validateTitle = selectors.getExportTypeTitleValidationFunction(state);

	let titleError = null;
	if (validateTitle) {
		const i18n = selectors.getExportTypeI18n(state);
		const settings = selectors.getCurrentExportTypeSettings(state);
		titleError = validateTitle(value, i18n, settings);
	}

	dispatch({
		type: CHANGE_TITLE,
		payload: {
			id, value, titleError
		}
	});
};

export const SELECT_DATA_TYPE = 'SELECT_DATA_TYPE';
export const onSelectDataType = (dataType: DataTypeFolder, gridRowId?: string): any => (
	(dispatch: any, getState: any): any => loadDataTypeBundle(dispatch, getState, dataType, { gridRowId })
);

export const SELECT_DEP_LEFT_SIDE = 'SELECT_DEP_LEFT_SIDE';
export const onSelectDepLeftSide = (selected: string[], dependencyId: string): GDAction => ({ type: SELECT_DEP_LEFT_SIDE, payload: { id: dependencyId, selected: selected } });


export const SELECT_DEP_RIGHT_SIDE = 'SELECT_DEP_RIGHT_SIDE';
export const onSelectDepRightsSide = (selected: string[], dependencyId: string): GDAction => ({ type: SELECT_DEP_RIGHT_SIDE, payload: { id: dependencyId, selected: selected } });

export const TOGGLE_DEP_MVD = 'TOGGLE_DEP_MVD';
export const toggleDepMvd = (dependencyId: string): GDAction => ({ type: TOGGLE_DEP_MVD, payload: { id: dependencyId } } );

export type LoadDataTypeBundleOptions = {
	gridRowId?: string;
	shouldRefreshPreviewPanel?: boolean;
};

export const loadDataTypeBundle = (dispatch: Dispatch, getState: any, dataType: DataTypeFolder, opts: LoadDataTypeBundleOptions = {}): void => {
	const options = {
		gridRowId: null,
		shouldRefreshPreviewPanel: true,
		...opts
	};

	const dataTypeI18n = selectors.getDataTypeI18n(getState());

	let defaultTitle: string | null = null;
	if (dataTypeI18n && dataTypeI18n[dataType]) {
		defaultTitle = dataTypeI18n[dataType].DEFAULT_TITLE ? dataTypeI18n[dataType].DEFAULT_TITLE : dataType.toLowerCase();
		const titles = selectors.getTitles(getState());
		defaultTitle = getUniqueString(defaultTitle as string, titles);
	}

	requestDataTypeBundle(dataType)
		.then((bundle: DTBundle) => {
			dispatch(dataTypeLoaded(dataType));
			if (bundle.actionInterceptors) {
				registerInterceptors(dataType, bundle.actionInterceptors);
			}

			// if it's been selected within the grid, select the row and update the preview panel
			const ids = [];
			if (options.gridRowId) {
				ids.push(options.gridRowId);
				dispatch({
					type: SELECT_DATA_TYPE,
					payload: {
						id: options.gridRowId,
						value: dataType,
						data: bundle.initialState,
						defaultTitle
					}
				});
			}

			if (options.shouldRefreshPreviewPanel) {
				dispatch(refreshPreview(ids));
			}
		});
};

export const REQUEST_COUNTRY_NAMES = 'REQUEST_COUNTRY_NAMES';
export const COUNTRY_NAMES_LOADED = 'COUNTRY_NAMES_LOADED';
export const requestCountryNames = (): any => (dispatch: any): any => {
	dispatch({ type: REQUEST_COUNTRY_NAMES });

	getCountryNamesBundle()
		.then(() => {
			dispatch({ type: COUNTRY_NAMES_LOADED });
		});
};

export const CONFIGURE_DATA_TYPE = 'CONFIGURE_DATA_TYPE';
export const onConfigureDataType = (id: string, data: any, metadata?: DTOptionsMetadata, triggeredByInterceptor = false): any => {
	return (dispatch: any, getState: any): any => {
		if (metadata && metadata.useCountryNames) {
			const state = getState();
			if (!isCountryNamesLoaded(state) && !isCountryNamesLoading(state)) {
				dispatch(requestCountryNames());
			}
		}

		const configureDataType = (disp: any): any => new Promise((resolve: any) => {
			disp({
				type: CONFIGURE_DATA_TYPE,
				triggeredByInterceptor,
				payload: {
					id, data, metadata
				}
			});
			resolve();
		});
		configureDataType(dispatch).then(() => dispatch(refreshPreview([id])));
	};
};

export const CONFIGURE_EXPORT_TYPE = 'CONFIGURE_EXPORT_TYPE';
export const configureExportType = (data: any): GDAction => ({
	type: CONFIGURE_EXPORT_TYPE,
	payload: {
		data
	}
});

export const REPOSITION_ROW = 'REPOSITION_ROW';
export const repositionRow = (id: string, newIndex: number, tableId: string): GDAction => ({
	type: REPOSITION_ROW,
	payload: {
		id, newIndex, tableId
	}
});

export const REPOSITION_DEP_ROW = 'REPOSITION_DEP_ROW';
export const repositionDepRow = (id: string, newIndex: number): GDAction => ({
	type: REPOSITION_DEP_ROW,
	payload: {
		id, newIndex
	}
});

export const TOGGLE_GRID = 'TOGGLE_GRID';
export const toggleGrid = (): GDAction => ({ type: TOGGLE_GRID });

export const TOGGLE_DEPENDENCY_GRID = 'TOGGLE_DEPENDENCY_GRID';
export const toggleDependencyGrid = (): GDAction => ({ type: TOGGLE_DEPENDENCY_GRID });

export const TOGGLE_PREVIEW = 'TOGGLE_PREVIEW';
export const togglePreview = (): GDAction => ({ type: TOGGLE_PREVIEW });

export const REFRESH_PREVIEW_DATA = 'REFRESH_PREVIEW_DATA';

// this re-generates the preview panel data. This doesn't have to be called on boot-up because the preview data is
// generated on the fly, saved in the store and rehydrated when the app loads
export const refreshPreview = (idsToRefresh: string[] = [], onComplete: any = null): any => {
	const dataTypeWorker = coreUtils.getDataTypeWorker('preview');

	return (dispatch: any, getState: any): any => {
		const state = getState();
		const i18n = getStrings();

		const template = selectors.getGenerationTemplate(state);
		const dataTypePreviewData = { ...selectors.getDataTypePreviewData(state) };
		const columns = selectors.getColumns(state);
		const unchanged = getUnchangedData(idsToRefresh, columns, dataTypePreviewData);

		// for initial bootup the page may be empty. This ensures the onComplete action fires (the `onmessage` doesn't fire
		// when no columns)
		if (!columns.length && onComplete) {
			dispatch(onComplete());
		}

		// here we DO need to generate the data independently of the final string in the appropriate export type format.
		// That allows us to tease out what changes on each keystroke in the UI and only refresh specific fields - it's
		// far clearer to the end user that way
		dataTypeWorker.postMessage({
			numResults: C.MAX_PREVIEW_ROWS,
			batchSize: C.MAX_PREVIEW_ROWS,
			unchanged,
			columns,
			i18n,
			template,
			countryNames: coreUtils.getCountryNames(),
			workerResources: {
				workerUtils: coreUtils.getWorkerUtils(),
				dataTypes: coreUtils.getDataTypeWorkerMap(selectors.getRowDataTypes(state) as DataTypeFolder[]),
				countryData: getCountryData()
			}
		});

		dataTypeWorker.onmessage = (resp: MessageEvent): void => {
			const { data } = resp;
			const { generatedData } = data;

			columns.forEach(({ id }, index: number) => {
				if (idsToRefresh.length && idsToRefresh.indexOf(id) === -1) {
					return;
				}

				dataTypePreviewData[id] = generatedData.map((row: any): any => row[index]);
			});

			// great! So we've generated the data we need and manually only changed those lines that have just changed
			// by the user via the UI. The CodeMirrorWrapper component handles passing off that info to the export type
			// web worker to generate the final string
			dispatch({
				type: REFRESH_PREVIEW_DATA,
				payload: {
					dataTypePreviewData
				}
			});

			if (onComplete) {
				dispatch(onComplete());
			}
		};
	};
};

export const TOGGLE_LAYOUT = 'TOGGLE_LAYOUT';
export const toggleLayout = (): GDAction => ({ type: TOGGLE_LAYOUT });

export const TOGGLE_GRID_CONTAINER_LAYOUT = 'TOGGLE_GRID_CONTAINER_LAYOUT';
export const toggleGridContainerLayout = (): GDAction => ({ type: TOGGLE_GRID_CONTAINER_LAYOUT });

export const UPDATE_NUM_PREVIEW_ROWS = 'UPDATE_NUM_PREVIEW_ROWS';
export const updateNumPreviewRows = (numRows: number): GDAction => ({ type: UPDATE_NUM_PREVIEW_ROWS, payload: { numRows } });

export const CHANGE_THEME = 'CHANGE_THEME';
export const changeTheme = (theme: string): GDAction => ({ type: CHANGE_THEME, payload: { theme } });

export const TOGGLE_SHOW_LINE_NUMBERS = 'TOGGLE_SHOW_LINE_NUMBERS';
export const toggleShowLineNumbers = (): GDAction => ({ type: TOGGLE_SHOW_LINE_NUMBERS });

export const TOGGLE_LINE_WRAPPING = 'TOGGLE_LINE_WRAPPING';
export const toggleLineWrapping = (): GDAction => ({ type: TOGGLE_LINE_WRAPPING });

export const SET_PREVIEW_TEXT_SIZE = 'SET_PREVIEW_TEXT_SIZE';
export const setPreviewTextSize = (previewTextSize: number): GDAction => ({
	type: SET_PREVIEW_TEXT_SIZE,
	payload: {
		previewTextSize
	}
});

export const TOGGLE_EXPORT_SETTINGS = 'TOGGLE_EXPORT_SETTINGS';
export const toggleExportSettings = (tab?: ExportSettingsTab): GDAction => ({
	type: TOGGLE_EXPORT_SETTINGS,
	payload: {
		tab
	}
});

export const HIDE_EXPORT_SETTINGS = 'HIDE_EXPORT_SETTINGS';
export const hideExportSettings = (): GDAction => ({ type: HIDE_EXPORT_SETTINGS });

export const SELECT_EXPORT_TYPE = 'SELECT_EXPORT_TYPE';
export const onSelectExportType = (exportType: ExportTypeFolder, shouldRefreshPreviewPanel = true): any => {
	return (dispatch: any): any => {
		dispatch({
			type: SELECT_EXPORT_TYPE,
			payload: {
				exportType
			}
		});

		loadExportTypeBundle(exportType)
			.then((bundle: DTBundle) => {
				dispatch(exportTypeLoaded(exportType, bundle.initialState));

				if (shouldRefreshPreviewPanel) {
					dispatch(refreshPreview());
				}
			});
	};
};

export const EXPORT_TYPE_LOADED = 'EXPORT_TYPE_LOADED';
export const exportTypeLoaded = (exportType: ExportTypeFolder, initialState: any): GDAction => ({
	type: EXPORT_TYPE_LOADED,
	payload: {
		exportType,
		initialState
	}
});

export const DATA_TYPE_LOADED = 'DATA_TYPE_LOADED';
export const dataTypeLoaded = (dataType: DataTypeFolder): GDAction => ({
	type: DATA_TYPE_LOADED,
	payload: {
		dataType
	}
});

export const SHOW_GENERATION_SETTINGS_PANEL = 'SHOW_GENERATION_SETTINGS_PANEL';
export const showGenerationSettingsPanel = (): GDAction => ({ type: SHOW_GENERATION_SETTINGS_PANEL });

export const HIDE_START_GENERATION_PANEL = 'HIDE_START_GENERATION_PANEL';
export const hideStartGenerationPanel = (): GDAction => ({ type: HIDE_START_GENERATION_PANEL });

export const SHOW_HELP_DIALOG = 'SHOW_HELP_DIALOG';
export const showHelpDialog = (dataType: DataTypeFolder): GDAction => ({
	type: SHOW_HELP_DIALOG,
	payload: {
		dataType
	}
});

export const HIDE_HELP_DIALOG = 'HIDE_HELP_DIALOG';
export const hideHelpDialog = (): GDAction => ({ type: HIDE_HELP_DIALOG });

export const UPDATE_NUM_ROWS_TO_GENERATE = 'UPDATE_NUM_ROWS_TO_GENERATE';
export const updateNumRowsToGenerate = (numRowsToGenerate: number): GDAction => ({
	type: UPDATE_NUM_ROWS_TO_GENERATE,
	payload: {
		numRowsToGenerate
	}
});

export const TOGGLE_STRIP_WHITESPACE = 'TOGGLE_STRIP_WHITESPACE';
export const toggleStripWhitespace = (): GDAction => ({ type: TOGGLE_STRIP_WHITESPACE });

export const CLEAR_GRID = 'CLEAR_GRID';
export const RESET_GENERATOR = 'RESET_GENERATOR';
export const clearPage = (addDefaultRows = true): any => (dispatch: Dispatch, getState: any): void => {
	const loadedExportTypes = selectors.getLoadedExportTypesArray(getState());

	const exportTypeInitialStates: any = {};
	loadedExportTypes.forEach((et: ExportTypeFolder) => {
		exportTypeInitialStates[et] = getExportTypeInitialState(et);
	});

	dispatch({
		type: RESET_GENERATOR,
		payload: {
			exportTypeInitialStates
		}
	});

	const initTableId = nanoid();
	dispatch({ type: ADD_TABLE, payload: { id: initTableId, title: 'Table' } });
	if (addDefaultRows) {
		dispatch(addRows(5, initTableId));
	}
};

export const SET_PANEL_SIZE = 'SET_PANEL_SIZE';
export const setPanelSize = (size: number): GDAction => ({
	type: SET_PANEL_SIZE,
	payload: {
		size
	}
});

export const SET_GRID_PANEL_SIZE = 'SET_GRID_PANEL_SIZE';
export const setGridPanelSize = (size: number): GDAction => ({
	type: SET_GRID_PANEL_SIZE,
	payload: {
		size
	}
});

export const CHANGE_SMALL_SCREEN_VISIBLE_PANEL = 'CHANGE_SMALL_SCREEN_VISIBLE_PANEL';
export const changeSmallScreenVisiblePanel = (): GDAction => ({ type: CHANGE_SMALL_SCREEN_VISIBLE_PANEL });

export const SET_INITIAL_DEPENDENCIES_LOADED = 'SET_INITIAL_DEPENDENCIES_LOADED';
export const setInitialDependenciesLoaded = (): GDAction => ({ type: SET_INITIAL_DEPENDENCIES_LOADED });

export const SET_BULK_ACTION = 'SET_BULK_ACTION';

export const LOAD_DATA_SET = 'LOAD_DATA_SET';
export const loadDataSet = (dataSet: DataSetListItem, showToast = true): any => async (dispatch: Dispatch, getState: any): Promise<any> => {
	const i18n = getStrings();
	const { exportType, exportTypeSettings, rows, sortedRows } = JSON.parse(dataSet.content);

	const dataTypes = sortedRows.map((hash: string) => rows[hash].dataType).filter((dataType: DataTypeFolder | null) => dataType !== null);
	const uniqueDataTypes = getUnique(dataTypes);

	dispatch({
		type: SET_BULK_ACTION,
		payload: {
			isComplete: false
		}
	});

	// load all the datasets and export type
	dispatch(onSelectExportType(exportType, false));
	uniqueDataTypes.forEach((dataType: DataTypeFolder) => (
		loadDataTypeBundle(dispatch, getState, dataType, { shouldRefreshPreviewPanel: false })
	));

	dispatch({
		type: LOAD_DATA_SET,
		payload: {
			exportType,
			exportTypeSettings,
			rows,
			sortedRows,
			dataSetId: dataSet.dataSetId,
			dataSetName: dataSet.dataSetName
		}
	});

	if (showToast) {
		addToast({
			type: 'success',
			message: i18n.core.dataSetLoaded
		});
	}
};

export const STASH_GENERATOR_STATE = 'STASH_GENERATOR_STATE';
export const stashGeneratorState = (): GDAction => ({ type: STASH_GENERATOR_STATE });

export const POP_STASHED_STATE = 'POP_STASHED_STATE';
export const popStashedState = (): GDAction => ({ type: POP_STASHED_STATE });

export const LOAD_STASHED_STATE = 'LOAD_STASHED_STATE';
export const loadStashedState = (): GDAction => ({ type: LOAD_STASHED_STATE });

export const SHOW_DATA_SET_HISTORY = 'SHOW_DATA_SET_HISTORY';
export const showDataSetHistory = (): GDAction => ({ type: SHOW_DATA_SET_HISTORY });

export const HIDE_DATA_SET_HISTORY = 'HIDE_DATA_SET_HISTORY';
export const hideDataSetHistory = (): GDAction => ({ type: HIDE_DATA_SET_HISTORY });

export const loadDataSetHistoryItem = (content: any): any => (dispatch: Dispatch, getState: any): any => {
	const state = getState();
	const { dataSetId, dataSetName } = getCurrentDataSet(state);

	dispatch(loadDataSet({
		dataSetId,
		dataSetName,
		content
	} as DataSetListItem, false));
};

export const SHOW_CLEAR_PAGE_DIALOG = 'SHOW_CLEAR_PAGE_DIALOG';
export const showClearPageDialog = (): GDAction => ({ type: SHOW_CLEAR_PAGE_DIALOG });

export const HIDE_CLEAR_GRID_DIALOG = 'HIDE_CLEAR_GRID_DIALOG';
export const hideClearPageDialog = (): GDAction => ({ type: HIDE_CLEAR_GRID_DIALOG });

export const SELECT_DATA_SET_HISTORY_ITEM = 'SELECT_DATA_SET_HISTORY_ITEM';
export const selectDataSetHistoryItem = (historyId: number, isLatest: boolean): GDAction => ({
	type: SELECT_DATA_SET_HISTORY_ITEM,
	payload: {
		historyId,
		isLatest
	}
});

// N.B. the version was actually selected when they clicked "View". This just closes the overlay and saves the
// current state of the generator
export const revertToHistoryVersion = (): any => (dispatch: Dispatch, getState: any): any => {
	const state = getState();
	const i18n = selectors.getCoreI18n(state);

	dispatch(hideDataSetHistory());
	dispatch(accountActions.saveCurrentDataSet(i18n.dataSetReverted));
};
