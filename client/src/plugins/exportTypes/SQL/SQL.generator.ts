import { ETOnMessage, ETMessageData } from '~types/exportTypes';
import { SQLSettings } from './SQL';
import { ColumnData } from '~types/general';
import { Table } from "~store/generator/generator.reducer";

const context: Worker = self as any;


let workerUtilsLoaded = false;
context.onmessage = (e: ETOnMessage) => {
	if (!workerUtilsLoaded) {
		importScripts(e.data.workerResources.workerUtils);
		workerUtilsLoaded = true;
	}
	const settings = e.data.settings;

	let content = '';
	if (settings.databaseType === 'MySQL') {
		content = generateMySQL(e.data);
	} else if (settings.databaseType === 'Postgres') {
		content = generatePostgres(e.data);
	} else if (settings.databaseType === 'SQLite') {
		content = generateSQLite(e.data);
	} else if (settings.databaseType === 'Oracle') {
		content = generateOracle(e.data);
	} else if (settings.databaseType === 'MSSQL') {
		content = generateMSSQL(e.data);
	}

	context.postMessage(content);
};

export const enum QuoteType {
	single = '\'',
	double = '"'
}

const getWrappedValue = (value: any, colIndex: number, numericFieldIndexes: number[], quote: QuoteType = QuoteType.double): any => {
	let val = '';
	if (numericFieldIndexes.indexOf(colIndex) !== -1) {
		val = value;
	} else {
		if (quote === QuoteType.double) {
			if (value.toString().indexOf(QuoteType.double) !== -1) {
				value = value.replaceAll(QuoteType.double, `${QuoteType.double}${QuoteType.double}`);
			}
		} else {
			if (value.toString().indexOf(QuoteType.single) !== -1) {
				value = value.replaceAll(QuoteType.single, `${QuoteType.single}${QuoteType.single}`);
			}
		}
		val = `${quote}${value}${quote}`;
	}
	return val;
};

export const generateMySQL = (data: ETMessageData): string => {
	const sqlSettings: SQLSettings = data.settings;
	const { isFirstBatch, columns, rows, tables } = data;
	const backquote = sqlSettings.encloseInBackQuotes ? '`' : '';
	
	let content = '';
	const tablesToGenerate = tables.filter(table => table.sortedRows.length > 0)
		.filter(table => table.sortedRows.map(colId => columns.find(col => col.columnId === colId))
			.find(col => !!col && col.dataType && col.title));
	const numericFieldIndexes = getNumericFieldColumnIndexes(data.columns);

	if (isFirstBatch) {
		tablesToGenerate.forEach(table => {
			const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
			if (sqlSettings.dropTable) {
				content += `DROP TABLE IF EXISTS ${backquote}${table.title}${backquote};\n\n`;
			}
			if (sqlSettings.createTable) {
				content += `CREATE TABLE ${backquote}${table.title}${backquote} (\n`;
				const cols: any[] = [];
				tableColumns.forEach(({ title, dataType, metadata, props }) => {
					let columnTypeInfo = 'MEDIUMTEXT';
					if (metadata && metadata.sql) {
						if (metadata.sql.field_MySQL) {
							columnTypeInfo = metadata.sql.field_MySQL;
						} else if (metadata.sql.field) {
							columnTypeInfo = metadata.sql.field;
						}
					}
					let col = `  ${backquote}${title}${backquote} ${columnTypeInfo}`;
					if (dataType === "ForeignKey"){
						const tableName = tables.find(t => t.id === props?.tableId)?.title || "error";
						const colName = columns.find(t => t.columnId === props?.pkId)?.title || "error";
						col += `,\n  FOREIGN KEY (${backquote}${title}${backquote}) REFERENCES ${backquote}${tableName}${backquote} (${backquote}${colName}${backquote})`;
					}
					cols.push(col);
				});

				content += cols.join(',\n');
				if (tableColumns.filter(c => c.dataType === "PrimaryKey").length > 0) {
					content += `\n) AUTO_INCREMENT=1;\n\n`;
				} else {
					content += `\n);\n\n`;
				}
			}
		});

	}
	tablesToGenerate.forEach(table => {
		let rowDataStr: string[] = [];
		const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
		const tableColIndexMappings: {
			[index: number]: number;
		} = {};
		tableColumns.forEach((column, colIndex)=> tableColIndexMappings[colIndex] = columns.indexOf(column));
		const colTitles = tableColumns.map(({ title }) => title);

		let colNamesStr = '';
		if (sqlSettings.encloseInBackQuotes) {
			colNamesStr = `\`${colTitles.join('`,`')}\``;
		} else {
			colNamesStr = colTitles.join(',');
		}
		rows.forEach((row: any, rowIndex: number) => {
			if (sqlSettings.statementType === 'insert') {
				const displayVals: any = [];
				colTitles.forEach((columnTitle: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					displayVals.push(getWrappedValue(row[colIndex], colIndex, numericFieldIndexes));
				});
				rowDataStr.push(displayVals.join(','));
				if (rowDataStr.length === sqlSettings.insertBatchSize) {
					content += `INSERT INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
					rowDataStr = [];
				}
			} else if (sqlSettings.statementType === 'insertIgnore') {
				const displayVals: any = [];

				colTitles.forEach((columnTitle: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					displayVals.push(getWrappedValue(row[colIndex], colIndex, numericFieldIndexes));
				});
				rowDataStr.push(displayVals.join(','));
				if (rowDataStr.length === sqlSettings.insertBatchSize) {
					content += `INSERT IGNORE INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
					rowDataStr = [];
				}
			} else {
				const pairs: string[] = [];
				colTitles.forEach((title: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					const colValue = getWrappedValue(row[colIndex], colIndex, numericFieldIndexes);
					pairs.push(`${backquote}${title}${backquote} = ${colValue}`);
				});
				const pairsStr = pairs.join(', ');
				const pk = tableColumns.find(c => c.dataType === "PrimaryKey")?.title || "id";
				content += `UPDATE ${backquote}${table.title}${backquote} SET ${pairsStr} WHERE ${backquote}${pk}${backquote} = ${rowIndex+1};\n\n`;
			}
		});

		if (rowDataStr.length) {
			if (sqlSettings.statementType === 'insert') {
				content += `INSERT INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
			} else if (sqlSettings.statementType === 'insertIgnore') {
				content += `INSERT IGNORE INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
			}
		}
	});


	return content;
};


export const generatePostgres = (generationData: ETMessageData): string => {
	const sqlSettings: SQLSettings = generationData.settings;
	const { isFirstBatch, columns, rows, tables } = generationData;
	let content = '';
	const tablesToGenerate = tables.filter(table => table.sortedRows.length > 0)
		.filter(table => table.sortedRows.map(colId => columns.find(col => col.columnId === colId))
			.find(col => !!col && col.dataType && col.title));
	const numericFieldIndexes = getNumericFieldColumnIndexes(generationData.columns);

	if (isFirstBatch) {
		tablesToGenerate.forEach(table => {
			const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
			if (sqlSettings.dropTable) {
				content += `DROP TABLE IF EXISTS "${table.title}";\n\n`;
			}
			if (sqlSettings.createTable) {
				content += `CREATE TABLE "${table.title}" (\n`;
				const cols: any[] = [];
				tableColumns.forEach(({ title, dataType, metadata, props }) => {
					let columnTypeInfo = 'MEDIUMTEXT';
					if (metadata) {
						if (metadata.sql && metadata.sql.field_Postgres) {
							columnTypeInfo = metadata.sql.field_Postgres;
						} else if (metadata.sql && metadata.sql.field) {
							columnTypeInfo = metadata.sql.field;
						}
					}
					let col = `  ${title} ${columnTypeInfo}`;
					if (dataType === "ForeignKey"){
						const tableName = tables.find(t => t.id === props.tableId)?.title || "error";
						const colName = columns.find(t => t.columnId === props.pkId)?.title || "error";
						col += `,\n  FOREIGN KEY (${title}) REFERENCES ${tableName} (${colName})`;
					}
					cols.push(col);
				});
				content += cols.join(',\n');
				content += `\n);\n\n`;
			}
		});

	}

	tablesToGenerate.forEach(table => {
		let rowDataStr: string[] = [];
		const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
		const colTitles = tableColumns.map(({ title }) => title);
		const colNamesStr = colTitles.join(',');
		const tableColIndexMappings: {
			[index: number]: number;
		} = {};
		tableColumns.forEach((column, colIndex)=> tableColIndexMappings[colIndex] = columns.indexOf(column));
		rows.forEach((row: any, rowIndex: number) => {
			if (sqlSettings.statementType === 'insert') {
				const displayVals: any = [];
				colTitles.forEach((columnTitle: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					displayVals.push(getWrappedValue(row[colIndex], colIndex, numericFieldIndexes, QuoteType.single));
				});
				rowDataStr.push(displayVals.join(','));
				if (rowDataStr.length === sqlSettings.insertBatchSize) {
					content += `INSERT INTO ${table.title} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
					rowDataStr = [];
				}
			} else {
				const pairs: string[] = [];
				colTitles.forEach((title: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					const colValue = getWrappedValue(row[colIndex], colIndex, numericFieldIndexes);
					pairs.push(`${title} = ${colValue}`);
				});
				const pairsStr = pairs.join(', ');
				const pk = tableColumns.find(c => c.dataType === "PrimaryKey")?.title || "id";
				content += `UPDATE ${table.title} SET ${pairsStr} WHERE ${pk} = ${rowIndex+1};\n\n`;
			}
		});

		if (rowDataStr.length && sqlSettings.statementType === 'insert') {
			content += `INSERT INTO ${table.title} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
		}
	});

	return content;
};


export const generateSQLite = (generationData: ETMessageData): string => {
	const sqlSettings: SQLSettings = generationData.settings;
	const { isFirstBatch, columns, rows, tables } = generationData;
	const backquote = sqlSettings.encloseInBackQuotes ? '`' : '';
	let content = '';
	const tablesToGenerate = tables.filter(table => table.sortedRows.length > 0)
		.filter(table => table.sortedRows.map(colId => columns.find(col => col.columnId === colId))
			.find(col => !!col && col.dataType && col.title));
	const numericFieldIndexes = getNumericFieldColumnIndexes(generationData.columns);

	if (isFirstBatch) {
		tablesToGenerate.forEach(table => {
			const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
			if (sqlSettings.dropTable) {
				content += `DROP TABLE IF EXISTS ${backquote}${table.title}${backquote};\n\n`;
			}
			if (sqlSettings.createTable) {
				content += `CREATE TABLE ${backquote}${table.title}${backquote} (\n`;
				const cols: any[] = [];
				tableColumns.forEach(({ title, dataType, metadata, props }) => {
					let columnTypeInfo = 'MEDIUMTEXT';
					// figure out the content type. Default to MEDIUMTEXT, then use the specific SQLField_MySQL, then the SQLField
					if (metadata && metadata.sql) {
						if (metadata.sql.field_MySQL) {
							columnTypeInfo = metadata.sql.field_MySQL;
						} else if (metadata.sql.field) {
							columnTypeInfo = metadata.sql.field;
						}
					}
					let col = `  ${backquote}${title}${backquote} ${columnTypeInfo}`;
					if (dataType === "ForeignKey"){
						const tableName = tables.find(t => t.id === props.tableId)?.title || "error";
						const colName = columns.find(t => t.columnId === props.pkId)?.title || "error";
						col += `,\n  FOREIGN KEY (${backquote}${title}${backquote}) REFERENCES ${backquote}${tableName}${backquote} (${backquote}${colName}${backquote})`;
					}
					cols.push(col);
				});

				content += cols.join(',\n');
				content += `\n);\n\n`;
			}
		});

	}
	tablesToGenerate.forEach(table => {
		let rowDataStr: string[] = [];
		const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
		const colTitles = tableColumns.map(({ title }) => title);
		let colNamesStr = '';
		const tableColIndexMappings: {
			[index: number]: number;
		} = {};
		tableColumns.forEach((column, colIndex)=> tableColIndexMappings[colIndex] = columns.indexOf(column));
		if (sqlSettings.encloseInBackQuotes) {
			colNamesStr = `\`${colTitles.join('`,`')}\``;
		} else {
			colNamesStr = colTitles.join(',');
		}
		rows.forEach((row: any, rowIndex: number) => {
			if (sqlSettings.statementType === 'insert') {
				const displayVals: any = [];
				colTitles.forEach((columnTitle: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					displayVals.push(getWrappedValue(row[colIndex], colIndex, numericFieldIndexes));
				});
				rowDataStr.push(displayVals.join(','));
				if (rowDataStr.length === sqlSettings.insertBatchSize) {
					content += `INSERT INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
					rowDataStr = [];
				}
			} else {
				const pairs: string[] = [];
				colTitles.forEach((title: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					const colValue = getWrappedValue(row[colIndex], colIndex, numericFieldIndexes);
					pairs.push(`${backquote}${title}${backquote} = ${colValue}`);
				});
				const pairsStr = pairs.join(', ');
				const pk = tableColumns.find(c => c.dataType === "PrimaryKey")?.title || "id";
				content += `UPDATE ${backquote}${table.title}${backquote} SET ${pairsStr} WHERE ${backquote}${pk}${backquote} = ${rowIndex+1};\n\n`;
			}
		});

		if (rowDataStr.length && sqlSettings.statementType === 'insert') {
			content += `INSERT INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
		}
	});

	return content;
};


export const generateOracle = (generationData: ETMessageData): string => {
	const sqlSettings: SQLSettings = generationData.settings;
	const backquote = sqlSettings.encloseInBackQuotes ? '`' : '';
	const { isFirstBatch, columns, rows, tables } = generationData;
	let content = '';
	const tablesToGenerate = tables.filter(table => table.sortedRows.length > 0)
		.filter(table => table.sortedRows.map(colId => columns.find(col => col.columnId === colId))
			.find(col => !!col && col.dataType && col.title));
	const numericFieldIndexes = getNumericFieldColumnIndexes(generationData.columns);

	if (isFirstBatch) {
		tablesToGenerate.forEach(table => {
			const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
			if (sqlSettings.dropTable) {
				content += `DROP TABLE ${backquote}${table.title}${backquote};\n\n`;
			}
			if (sqlSettings.createTable) {
				content += `CREATE TABLE ${backquote}${table.title}${backquote} (\n`;

				const cols: any[] = [];
				tableColumns.forEach(({ title, dataType, metadata, props }) => {
					let columnTypeInfo = 'MEDIUMTEXT';
					if (metadata && metadata.sql) {
						if (metadata.sql.field_Oracle) {
							columnTypeInfo = metadata.sql.field_Oracle;
						} else if (metadata.sql.field) {
							columnTypeInfo = metadata.sql.field;
						}
					}
					let col = `  ${backquote}${title}${backquote} ${columnTypeInfo}`;
					if (dataType === "ForeignKey"){
						const tableName = tables.find(t => t.id === props.tableId)?.title || "error";
						const colName = columns.find(t => t.columnId === props.pkId)?.title || "error";
						col += `,\n  FOREIGN KEY (${backquote}${title}${backquote}) REFERENCES ${backquote}${tableName}${backquote} (${backquote}${colName}${backquote})`;
					}
					cols.push(col);
				});

				content += cols.join(',\n');
				content += `\n);\n\n`;
			}
		});

	}
	tablesToGenerate.forEach(table => {
		const rowDataStr: string[] = [];
		const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
		const colTitles = tableColumns.map(({ title }) => title);
		let colNamesStr = '';
		const tableColIndexMappings: {
			[index: number]: number;
		} = {};
		tableColumns.forEach((column, colIndex)=> tableColIndexMappings[colIndex] = columns.indexOf(column));
		if (sqlSettings.encloseInBackQuotes) {
			colNamesStr = `\`${colTitles.join('`,`')}\``;
		} else {
			colNamesStr = colTitles.join(',');
		}
		rows.forEach((row: any, rowIndex: number) => {
			if (sqlSettings.statementType === 'insert') {
				const displayVals: any = [];
				colTitles.forEach((columnTitle: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					displayVals.push(getWrappedValue(row[colIndex], colIndex, numericFieldIndexes));
				});
				const rowDataStr = displayVals.join(',');
				content += `INSERT INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES (${rowDataStr});\n`;
			} else {
				const pairs: string[] = [];
				colTitles.forEach((title: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					const colValue = getWrappedValue(row[colIndex], colIndex, numericFieldIndexes);
					pairs.push(`${backquote}${title}${backquote} = ${colValue}`);
				});
				const pairsStr = pairs.join(', ');
				const pk = tableColumns.find(c => c.dataType === "PrimaryKey")?.title || "id";
				content += `UPDATE ${backquote}${table.title}${backquote} SET ${pairsStr} WHERE ${backquote}${pk}${backquote} = ${rowIndex+1};\n`;
			}
		});

		if (rowDataStr.length && sqlSettings.statementType === 'insert') {
			content += `INSERT INTO ${backquote}${table.title}${backquote} (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n`;
		}
	});

	return content;
};


export const generateMSSQL = (generationData: ETMessageData): string => {
	const sqlSettings: SQLSettings = generationData.settings;
	const { isFirstBatch, columns, rows, tables } = generationData;
	const quote = sqlSettings.quotes === 'single' ? QuoteType.single : QuoteType.double;
	let content = '';
	const tablesToGenerate = tables.filter(table => table.sortedRows.length > 0)
		.filter(table => table.sortedRows.map(colId => columns.find(col => col.columnId === colId))
			.find(col => !!col && col.dataType && col.title));
	const numericFieldIndexes = getNumericFieldColumnIndexes(generationData.columns);

	if (isFirstBatch) {
		tablesToGenerate.forEach(table => {
			const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
			if (sqlSettings.dropTable) {
				content += `IF EXISTS(SELECT 1 FROM sys.tables WHERE object_id = OBJECT_ID(${quote}${table.title}${quote}))\n`;
				content += "BEGIN;\n";
				content += `    DROP TABLE [${table.title}];\n`;
				content += "END;\n";
				content += "GO\n\n";
			}

			if (sqlSettings.createTable) {
				content += `CREATE TABLE [${table.title}] (\n`;
				const cols: any[] = [];
				tableColumns.forEach(({ title, dataType, metadata, props }) => {
					let columnTypeInfo = 'MEDIUMTEXT';
					if (metadata && metadata.sql) {
						if (metadata.sql.field_MSSQL) {
							columnTypeInfo = metadata.sql.field_MSSQL;
						} else if (metadata.sql.field) {
							columnTypeInfo = metadata.sql.field;
						}
					}
					let col = `    [${title}] ${columnTypeInfo}`;
					if (dataType === "ForeignKey"){
						const tableName = tables.find(t => t.id === props.tableId)?.title || "error";
						const colName = columns.find(t => t.columnId === props.pkId)?.title || "error";
						col += `,\n    CONSTRAINT FK_${tableName}_${colName} FOREIGN KEY ([${title}]) REFERENCES [${tableName}] ([${colName}])`;
					}else if (dataType === "PrimaryKey") {
						col += `,\n    CONSTRAINT PK_${table.title}_${title} PRIMARY KEY ([${title}])`;
					}
					cols.push(col);
				});
				content += cols.join(',\n');
				content += `\n);\nGO\n\n`;
			}
		});

	}
	tablesToGenerate.forEach(table => {
		let rowDataStr: string[] = [];
		const tableColumns = columns.filter(column => table.sortedRows.includes(column.columnId));
		const colTitles = tableColumns.map(({ title }) => title);
		const colNamesStr = colTitles.join(',');
		const tableColIndexMappings: {
			[index: number]: number;
		} = {};
		tableColumns.forEach((column, colIndex)=> tableColIndexMappings[colIndex] = columns.indexOf(column));

		rows.forEach((row: any, rowIndex: number) => {
			if (sqlSettings.statementType === 'insert') {
				const displayVals: any = [];
				colTitles.forEach((columnTitle: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					displayVals.push(getWrappedValue(row[colIndex], colIndex, numericFieldIndexes, quote));
				});
				rowDataStr.push(displayVals.join(','));
				if (rowDataStr.length === sqlSettings.insertBatchSize) {
					content += `INSERT INTO [${table.title}] (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
					rowDataStr = [];
				}

				// TODO - need the current row
				// if (($currentRow % 1000) == 0) {
				// 	$content .= $endLineChar;
				// 	$content .= "PRINT 'Row {$currentRow} inserted';$endLineChar";
				// 	$content .= "GO";
				// 	$content .= $endLineChar;
				// }
			} else {
				const pairs: string[] = [];
				colTitles.forEach((title: string, colIndex: number) => {
					colIndex = tableColIndexMappings[colIndex];
					const colValue = getWrappedValue(row[colIndex], colIndex, numericFieldIndexes);
					pairs.push(`[${title}] = ${colValue}`);
				});
				const pairsStr = pairs.join(', ');
				const pk = tableColumns.find(c => c.dataType === "PrimaryKey")?.title || "id";
				content += `UPDATE [${table.title}] SET ${pairsStr} WHERE [${pk}] = ${rowIndex+1};\n\n`;

				// if (($currentRow % 1000) == 0) {
				// 	$content .= $endLineChar;
				// 	$content .= "PRINT 'Row {$currentRow} updated';$endLineChar";
				// 	$content .= "GO";
				// 	$content .= $endLineChar;
				// }
			}
		});

		if (rowDataStr.length && sqlSettings.statementType === 'insert') {
			content += `INSERT INTO [${table.title}] (${colNamesStr})\nVALUES\n  (${rowDataStr.join('),\n  (')});\n\n`;
		}
	});

	return content;
};


export const getNumericFieldColumnIndexes = (columns: ColumnData[]): number[] => {
	const numericFieldColIndexes: number[] = [];

	columns.forEach((col: ColumnData, colIndex: number) => {
		const { metadata } = col;
		const dataType = metadata?.general && metadata.general?.dataType;

		if (dataType === 'number') {
			numericFieldColIndexes.push(colIndex);
		}
	});

	return numericFieldColIndexes;
};
