import { DTHelpProps, DTMetadata } from '~types/dataTypes';
import * as React from "react";

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

export const Help = ({ i18n }: DTHelpProps): JSX.Element => <p>{i18n.helpIntro}</p>;
