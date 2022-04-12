import { createSelector } from 'reselect';
import { getRows, getSortedRowsArray, getSortedTablesArray } from '~store/generator/generator.selectors';
import { DTCustomProps } from '~types/dataTypes';

const getSelectableRows = createSelector(
	getSortedTablesArray,
	getRows,
	(tables, rows) => tables.flatMap(table => table.sortedRows.map((rowId, index) => ({ ...rows[rowId], index, tableTitle: table.title, tableId: table.id })))
		.filter(({ dataType }) => dataType === 'PrimaryKey')
);

export const customProps: DTCustomProps = {
	selectableRows: getSelectableRows,
	allRows: getSortedRowsArray
};
