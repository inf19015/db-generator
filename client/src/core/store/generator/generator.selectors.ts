import { createSelector } from 'reselect';
import { GeneratorLayout } from '../../generator/Generator.component';
import { CurrentDataSet, DataRow, DataRows, DependencyRows, Table, Tables } from './generator.reducer';
import { GeneratorPanel } from '~types/general';
import { DataTypeFolder, ExportTypeFolder } from '../../../../_plugins';
import * as mainSelectors from '../main/main.selectors';
import * as langUtils from '~utils/langUtils';
import { processBatches, getDataType } from '~utils/dataTypeUtils';
import {
	getExportTypeLabel as exportTypeUtilsGetExportTypeLabel,
	getCodeMirrorMode as exportTypeUtilsGetCodeMirrorMode,
	getExportTypeTitleValidationFunction as exportTypeGetExportTypeTitleValidation
} from '~utils/exportTypeUtils';
import { ColumnData, GDLocale, GenerationTemplate, Store } from '~types/general';
import { GridContainerLayout } from "~core/generator/gridContainer/GridContainer.component";




export const getLoadedDataTypes = (state: Store): any => state.generator.loadedDataTypes;
export const getLoadedExportTypes = (state: Store): any => state.generator.loadedExportTypes;
export const getExportType = (state: Store): ExportTypeFolder => state.generator.exportType;
export const getRows = (state: Store): DataRows => state.generator.rows;
export const getDependencyRows = (state: Store): DependencyRows => state.generator.dependencyRows;
export const getSortedDependencyRows = (state: Store): string[] => state.generator.sortedDependencyRows;
export const getTables = (state: Store): Tables => state.generator.tables;
export const getSortedTables = (state: Store): string[] => state.generator.sortedTables;
export const getSelectedTableTab = (state: Store): number => state.generator.selectedTableTab;
export const isGridVisible = (state: Store): boolean => state.generator.showGrid;
export const isDependencyGridVisible = (state: Store): boolean => state.generator.showDependencyGrid;
export const isPreviewVisible = (state: Store): boolean => state.generator.showPreview;
export const getSmallScreenVisiblePanel = (state: Store): GeneratorPanel => state.generator.smallScreenVisiblePanel;
export const getGeneratorLayout = (state: Store): GeneratorLayout => state.generator.generatorLayout;
export const getGridContainerLayout = (state: Store): GridContainerLayout => state.generator.gridContainerLayout;
export const getNumPreviewRows = (state: Store): number => state.generator.numPreviewRows;
export const shouldShowLineNumbers = (state: Store): boolean => state.generator.showLineNumbers;
export const shouldEnableLineWrapping = (state: Store): boolean => state.generator.enableLineWrapping;
export const getTheme = (state: Store): string => state.generator.theme;
export const getPreviewTextSize = (state: Store): number => state.generator.previewTextSize;
export const getDataTypePreviewData = (state: Store): any => state.generator.dataTypePreviewData;
export const shouldShowExportSettings = (state: Store): boolean => state.generator.showExportSettings;
export const shouldShowDataSetHistory = (state: Store): boolean => state.generator.showDataSetHistory;
export const getSelectedDataSetHistoryItem = (state: Store): any => state.generator.selectedDataSetHistory;
export const getExportTypeSettings = (state: Store): any => state.generator.exportTypeSettings;
export const getExportSettingsTab = (state: Store): any => state.generator.exportSettingsTab;
export const isGenerationSettingsPanelVisible = (state: Store): boolean => state.generator.showGenerationSettingsPanel;
export const isHelpDialogVisible = (state: Store): boolean => state.generator.showHelpDialog;
export const isClearPageDialogVisible = (state: Store): boolean => state.generator.showClearPageDialog;
export const getHelpDialogSection = (state: Store): DataTypeFolder | null => state.generator.helpDialogSection;
export const getNumRowsToGenerate = (state: Store): number => state.generator.numRowsToGenerate;
export const getLastLayoutWidth = (state: Store): number | null => state.generator.lastLayoutWidth;
export const getLastLayoutHeight = (state: Store): number | null => state.generator.lastLayoutHeight;
export const getLastGridContainerLayoutWidth = (state: Store): number | null => state.generator.lastGridContainerLayoutWidth;
export const getLastGridContainerLayoutHeight = (state: Store): number | null => state.generator.lastGridContainerLayoutHeight;
export const isInitialDependenciesLoaded = (state: Store): boolean => state.generator.initialDependenciesLoaded;
export const shouldStripWhitespace = (state: Store): boolean => state.generator.stripWhitespace;
export const getCurrentDataSetId = (state: Store): number | null => state.generator.currentDataSet.dataSetId;
export const getCurrentDataSet = (state: Store): CurrentDataSet => state.generator.currentDataSet;
export const hasBulkActionPending = (state: Store): boolean => state.generator.bulkActionPending;
export const isCountryNamesLoading = (state: Store): boolean => state.generator.isCountryNamesLoading;
export const isCountryNamesLoaded = (state: Store): boolean => state.generator.isCountryNamesLoaded;
export const shouldShowChangeTableTitleDialog = (state: Store): boolean => state.generator.showChangeTableTitleDialog;



export const getSortedTablesArray = createSelector(
	getSortedTables,
	getTables,
	(sortedTables, tables) => sortedTables.map((id: string) => tables[id])
);

export const getSortedRows = createSelector(
	getSortedTablesArray,
	(tables): Array<string> => tables.flatMap(t => t.sortedRows)
);
export const getNumRows = createSelector(
	getSortedRows,
	(rows) => rows.length
);

export const getRow = (state: Store, rowId: string): DataRow => state.generator.rows[rowId];

export const getSortedRowsArray = createSelector(
	getRows,
	getSortedRows,
	(rows, sorted) => sorted.map((id: string) => rows[id])
);
export const getSortedRowsOfTable = (state: Store, tableId: string): string[] => state.generator.tables[tableId].sortedRows;

export const getRowsOfTableArray = (state: Store, tableId: string): DataRow[] =>
	getSortedRowsOfTable(state, tableId).map(id => getRow(state, id));

export const getSelectedTable = createSelector(
	getSelectedTableTab,
	getSortedTablesArray,
	(tabIndex, tables) => tables[tabIndex]
);

export const getRowsAsOptions = createSelector(
	getSortedRowsArray,
	(rows) => rows.map((row, i) => ({ value: row.id, label: `(${i+1}) ${row.title}` }))
);

export const getSortedRowsArrayWithIds = createSelector(
	getRows,
	getSortedRows,
	(rows, sorted) => sorted.map((id: string) => ({ ...rows[id], id }))
);

export const getTitles = createSelector(
	getSortedRowsArray,
	(rows) => rows.map(({ title }) => title)
);

export const getNonEmptySortedRows = createSelector(
	getSortedRowsArray,
	(rows) => rows.filter((row: DataRow) => row.title.trim() !== '' && row.dataType !== null && row.dataType.trim() !== '')
);

export const getSortedRowsWithDataTypeSelected = createSelector(
	getSortedRowsArrayWithIds,
	(rows) => rows.filter((row: DataRow) => row.dataType !== null && row.dataType.trim() !== '')
);

// returns everything in the grid where a data type has been selected
export const getColumns = createSelector(
	getSortedRowsWithDataTypeSelected,
	(rows): (ColumnData & { id: string })[] => {
		return rows.filter((row: DataRow) => row.dataType !== null && row.dataType.trim() !== '')
			.map(({ dataType, title, data, id }: any) => {
				const { getMetadata } = getDataType(dataType);
				const metadata = getMetadata ? getMetadata({ data }) : null;

				return {
					title,
					dataType,
					metadata,
					props: data,
					columnId: id,
					id
				};
			});
	}
);

export const getRowDataTypes = createSelector(
	getRows,
	(rows) => (
		Object.keys(rows).filter((id: string) => rows[id].dataType !== null).map((id: string) => rows[id].dataType)
	)
);

export const getPreviewRows = createSelector(
	getNumPreviewRows,
	getNonEmptySortedRows,
	getDataTypePreviewData,
	(numPreviewRows, rows, data) => {
		const numRows = rows.length;
		const formattedData: any[] = [];

		for (let j=0; j<numPreviewRows; j++) {
			const rowData = [];
			for (let i=0; i<numRows; i++) {
				const id = rows[i].id;
				// this occurs when a new row is first added. The data is generated AFTERWARDS (see logic in onSelectDataType() action)
				if (!data[id]) {
					continue;
				}
				rowData.push(data[id][j]?.display);
			}

			if (rowData.length) {
				formattedData.push(rowData);
			}
		}
		return formattedData;
	}
);

export const getSortedDependencyRowsArray = createSelector(
	getDependencyRows,
	getSortedDependencyRows,
	(rows, sorted) => sorted.map((id: string) => rows[id])
);

type ProcessOrders = {
	[num: number]: any;
};

export const getGenerationTemplate = createSelector(
	getSortedRowsWithDataTypeSelected,
	getLoadedDataTypes, // yup, intentional! This ensures the selector will be re-ran after the data types are async loaded
	(rows): GenerationTemplate => {
		const templateByProcessOrder: ProcessOrders = {};
		rows.map(({ id, title, dataType, data }: any, colIndex: number) => {
			const processOrder = processBatches[dataType as DataTypeFolder] as number;
			const { rowStateReducer } = getDataType(dataType);

			if (!templateByProcessOrder[processOrder]) {
				templateByProcessOrder[processOrder] = [];
			}

			templateByProcessOrder[processOrder].push({
				id,
				title,
				dataType,
				colIndex,

				// settings for the DT cell. The rowStateReducer is optional: it lets developers convert the Data Type row
				// state into something friendlier for the generation step
				rowState: rowStateReducer ? rowStateReducer(data) : data
			});
		});

		return templateByProcessOrder;
	}
);

export const hasData = createSelector(
	getPreviewRows,
	(rows) => rows.length > 0
);

export const selectedExportTypeLoaded = createSelector(
	getExportType,
	getLoadedExportTypes,
	(exportType, loadedExportTypes) => loadedExportTypes[exportType]
);

export const getLoadedExportTypesArray = createSelector(
	getLoadedExportTypes,
	(exportTypes) => Object.keys(exportTypes).filter((et: ExportTypeFolder) => exportTypes[et])
);

// returns the entire i18n content
export const getI18n = createSelector(
	mainSelectors.localeFileLoaded,
	mainSelectors.getLocale,
	(localeFileLoaded, locale: GDLocale): any | null => {
		if (!localeFileLoaded) {
			return null;
		}
		return langUtils.getStrings(locale);
	}
);

// TODO hmm.. this kinda belongs in `main` not `generator`
export const getCoreI18n = createSelector(
	mainSelectors.getLocale,
	(locale): any | null => {
		const strings = langUtils.getStrings(locale);
		return strings ? strings.core : null;
	}
);

export const getCountryI18n = createSelector(
	mainSelectors.getLocale,
	(locale): any | null => {
		const strings = langUtils.getStrings(locale);
		return strings ? strings.countries : null;
	}
);

export const getDataTypeI18n = createSelector(
	mainSelectors.localeFileLoaded,
	mainSelectors.getLocale,
	(localeFileLoaded, locale): any | null => {
		if (!localeFileLoaded) {
			return null;
		}
		const strings = langUtils.getStrings(locale);
		return strings ? strings.dataTypes : null;
	}
);

export const getExportTypeI18n = createSelector(
	mainSelectors.getLocale,
	getExportType,
	(locale, exportType): any | null => {
		const strings = langUtils.getStrings(locale);
		return strings ? strings.exportTypes[exportType] : null;
	}
);

export const getExportTypeColumnTitle = createSelector(
	getExportTypeI18n,
	(i18n) => i18n.COL_TITLE
);


// Export Types can optionally override the label that appears in the Preview panel. For example, instead of
// just showing "Programming Language", they can show "PHP" or "Programming Language: Perl" or whatever they
// want. By default it'll just show the localized Export Type name
// TODO: need validation on the export type to confirm `EXPORT_TYPE_NAME` exists. Perhaps a separate grunt `validate` task
// that's integrated into the build process to prevent incomplete/invalid bundles from being included
export const getExportTypeLabel = createSelector(
	getExportType,
	getExportTypeSettings,
	getExportTypeI18n,
	getLoadedExportTypes,
	(exportType, exportTypeSettings, i18n, loadedExportTypes): string => {
		if (loadedExportTypes[exportType]) {
			const etSettings = exportTypeSettings[exportType];
			const label = exportTypeUtilsGetExportTypeLabel(exportType, etSettings);
			if (label) {
				return label;
			}
		}
		return i18n.EXPORT_TYPE_NAME;
	}
);

export const getCurrentExportTypeSettings = createSelector(
	getExportType,
	getExportTypeSettings,
	(exportType, settings) => exportType ? settings[exportType] : {}
);

// wrapper function for the Export Type's getCodeMirrorMode function. This ensures it's loaded and does the work
// of figuring out what export type is currently loaded
export const getCodeMirrorMode = createSelector(
	getExportType,
	getLoadedExportTypes,
	getExportTypeSettings,
	(exportType, loadedExportTypes, exportTypeSettings) => {
		if (!loadedExportTypes[exportType]) {
			return "";
		}
		return exportTypeUtilsGetCodeMirrorMode(exportType, exportTypeSettings[exportType]);
	}
);

export const getExportTypeTitleValidationFunction = createSelector(
	getExportType,
	getLoadedExportTypes,
	(exportType, loadedExportTypes) => {
		if (!loadedExportTypes[exportType]) {
			return "";
		}
		return exportTypeGetExportTypeTitleValidation(exportType);
	}
);

export const previewPanelDependenciesLoaded = createSelector(
	getRowDataTypes,
	getExportType,
	getLoadedDataTypes,
	getLoadedExportTypes,
	mainSelectors.localeFileLoaded,
	(dataTypes, exportType, loadedDataTypes, loadedExportTypes, localeFileLoaded) => {
		if (!localeFileLoaded || !loadedExportTypes[exportType]) {
			return false;
		}

		const allDataTypesLoaded = dataTypes.every((i: DataTypeFolder) => loadedDataTypes[i]);
		if (!allDataTypesLoaded) {
			return false;
		}

		return true;
	}
);

export const shouldGeneratePreviewRows = createSelector(
	getRowDataTypes,
	previewPanelDependenciesLoaded,
	getRows,
	getDataTypePreviewData,
	(dataTypes, dependenciesLoaded, rowsObj, previewData) => {
		if (!dataTypes.length) {
			return false;
		}
		if (!dependenciesLoaded) {
			return false;
		}

		const alreadyGenerated = Object.keys(rowsObj).every((key: string) => !!previewData[key]);
		if (alreadyGenerated) {
			return false;
		}

		return true;
	}
);

export const getDataSetSavePackage = createSelector(
	getExportType,
	getCurrentExportTypeSettings,
	getRows,
	getSortedRows,
	(exportType, exportTypeSettings, rows, sortedRows) => ({
		exportType,
		exportTypeSettings,
		rows,
		sortedRows
	})
);

export const currentDataSetNeedsCountryNames = createSelector(
	getSortedRowsArray,
	(rows) => rows.reduce((needsCountryNames, { metadata }) => {
		return needsCountryNames ? true : !!metadata?.useCountryNames;
	}, false)
);
