import { DTMetadata } from '~types/dataTypes';

export type PrimaryKeyState = {
	example: string;
	incrementStart: string;
	incrementValue: string;
	incrementPlaceholder: string;
}

export const initialState: PrimaryKeyState = {
	example: '1,1',
	incrementStart: '1',
	incrementValue: '1',
	incrementPlaceholder: ''
};

export const getMetadata = (): DTMetadata => {
	return {
		general: {
			dataType: 'number'
		},
		sql: {
			field: 'int NOT NULL',
			field_MySQL: 'int unsigned NOT NULL auto_increment PRIMARY KEY',
			field_SQLite: 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
			field_Oracle: 'number PRIMARY KEY',
			field_MSSQL: 'INTEGER IDENTITY(1, 1) NOT NULL',
			field_Postgres: 'Serial PRIMARY KEY'
		}
	};
};

