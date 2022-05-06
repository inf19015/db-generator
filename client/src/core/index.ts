/* istanbul ignore file */
import store from './store';
import C from './constants';
import * as actions from './store/generator/generator.actions';
import * as mainActions from './store/main/main.actions';
import * as selectors from './store/generator/generator.selectors';
import * as mainSelectors from './store/main/main.selectors';
import { requestCountryNames } from '~store/generator/generator.actions';
import { DataTypeFolder } from '../../_plugins';
import { createDataTypeWorker, createExportTypeWorker } from '~utils/coreUtils';
import { initAuthVendors } from '~utils/authUtils';
import { getCurrentPageLocale } from '~utils/langUtils';
import { AuthMethod } from '~types/general';
import '../../_imports';
import { nanoid } from "nanoid";

export const init = (): void => {

	// create the preview workers. These handle the job of farming out work to the various plugin worker files.
	createDataTypeWorker('preview');
	createExportTypeWorker('preview');

	const state = store.getState();
	const pageLocale = getCurrentPageLocale();

	// initialize any external vendors (Google, Github, Facebook) that are set up for login
	initAuthVendors();

	const isLoggedIn = mainSelectors.isLoggedIn(state);
	const exportType = selectors.getExportType(state);
	const numTables = selectors.getSortedTablesArray(state).length;

	store.dispatch(mainActions.selectLocale(pageLocale));
	store.dispatch(actions.onSelectExportType(exportType, false));

	const loadCountryNames = selectors.currentDataSetNeedsCountryNames(state);
	if (loadCountryNames) {
		store.dispatch(requestCountryNames());
	}

	// if there's a live session, verify the JWT is still valid
	if (isLoggedIn) {
		if (mainSelectors.getAuthMethod(state) === AuthMethod.default) {
			store.dispatch(mainActions.updateRefreshToken());
		}
	} else {
		store.dispatch(mainActions.setOnloadAuthDetermined());
	}

	if(numTables === 0){
		const tableId = nanoid();
		store.dispatch(actions.addTable(tableId));
		store.dispatch(actions.onSelectTableTab(0));
		store.dispatch(actions.addRows(C.NUM_DEFAULT_ROWS, tableId));
		store.dispatch(mainActions.showTourIntroDialog());
	}


	const preloadDataTypes = selectors.getRowDataTypes(state);

	preloadDataTypes.forEach((dataType: DataTypeFolder) => (
		actions.loadDataTypeBundle(store.dispatch, store.getState, dataType, { shouldRefreshPreviewPanel: false })
	));
};
