/* istanbul ignore file */
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import undoable, { includeAction } from 'redux-undo';
import { Persistor } from 'redux-persist/es/types';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import actionsInterceptor from '../actionInterceptor';
import storage from 'redux-persist/lib/storage';
import mainReducer from './main/main.reducer';
import generatorReducer, { GeneratorState, UndoableGeneratorState } from './generator/generator.reducer';
import packetsReducer from './packets/packets.reducer';
import accountReducer from './account/account.reducer';
import * as generatorActions from './generator/generator.actions';
import { batchGroupBy } from "~store/generator/batchGroupBy";

let persistor: Persistor;
function initStore(state: any): any {
	const enhancers: any = [];
	let composeEnhancers = compose;

	if (process.env.NODE_ENV === 'development') {
		const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
		if (typeof composeWithDevToolsExtension === 'function') {
			composeEnhancers = composeWithDevToolsExtension;
		}
	}

	const rootPersistConfig = {
		key: 'root',
		storage,
		blacklist: ['generator', 'main', 'packets']
	};

	const generatorPersistConfig = {
		key: 'generator',
		storage,
		// blacklist: [
		// 	'initialDependenciesLoaded',
		// 	'loadedDataTypes',
		// 	'loadedExportTypes',
		// 	'isGenerating',
		// 	'numGeneratedRows',
		// 	'dataTypePreviewData',
		// 	'bulkActionPending',
		// 	'isCountryNamesLoading',
		// 	'isCountryNamesLoaded'
		// ]
		blacklist: [
			'initialDependenciesLoaded',
			'loadedDataTypes',
			'loadedExportTypes',
			'isGenerating',
			'numGeneratedRows',
			'dataTypePreviewData',
			'bulkActionPending',
			'isCountryNamesLoading',
			'isCountryNamesLoaded'
		].map(key => `present.${key}`)
	};

	const mainPersistConfig = {
		key: 'main',
		storage,
		blacklist: [
			'localeFileLoaded',
			'isOnloadAuthDetermined',
			'tourBundleLoaded',
			'dialogProcessing',
			'accountsCurrentPage',
			'accountsSortCol',
			'accountsSortDir',
			'accountsFilterStr'
		]
	};

	// TODO should be able to just blacklist the entire section and not have to pinpoint them here... doc really not clear
	const packetsPersistConfig = {
		key: 'packets',
		storage,
		blacklist: [
			'currentPacketId',
			'packetIds',
			'packets'
		]
	};

	const accountPersistConfig = {
		key: 'account',
		storage,
		blacklist: [
			'yourAccount',
			'editAccount'
		]
	};

	const undoConfig = {
		limit: 10,
		groupBy: batchGroupBy.init([]),
		filter: includeAction([
			generatorActions.ADD_ROW_TO_TABLE,
			generatorActions.ADD_ROW,
			generatorActions.ADD_DEP_ROW,
			generatorActions.ADD_TABLE,
			generatorActions.SELECT_DEP_RIGHT_SIDE,
			generatorActions.SELECT_DEP_LEFT_SIDE,
			generatorActions.SELECT_DATA_TYPE,
			generatorActions.SELECT_TABLE_TAB,
			generatorActions.REPOSITION_ROW,
			generatorActions.REPOSITION_DEP_ROW,
			generatorActions.REMOVE_DEP_ROW,
			generatorActions.REMOVE_ROW,
			generatorActions.REMOVE_TABLE,
			generatorActions.CHANGE_TITLE,
			generatorActions.CHANGE_TABLE_TITLE
		])
	};

	const rootReducer = combineReducers({
		generator: persistReducer(generatorPersistConfig, undoable(generatorReducer, undoConfig)),
		main: persistReducer(mainPersistConfig, mainReducer),
		packets: persistReducer(packetsPersistConfig, packetsReducer),
		account: persistReducer(accountPersistConfig, accountReducer)
	});

	const persistedRootReducer = persistReducer(rootPersistConfig, rootReducer);

	const store = createStore(
		persistedRootReducer,
		state,
		composeEnhancers(
			applyMiddleware(
				thunk,
				actionsInterceptor
			),
			...enhancers
		)
	);
	persistor = persistStore(store);
	return store;
}

// for testing we set up our own mock stores with the subset of whatever we want to examine
let store: any;
if (process.env.NODE_ENV !== 'test') {
	store = initStore({});
}

export default store;

export { persistor };
