/**
 * This file is autogenerated. Do not edit!
 * ----------------------------------------
 **/

import { GDLocale, GDLocaleMap } from '~types/general';
import { ExportTypeFolder } from './_plugins';

export type AppType = 'login' | 'open' | 'closed' | 'prod';

export type EnvSettings = {
	version: string;
	appType: AppType;
	defaultNumRows: number;
	maxDemoModeRows: number;
	maxDataSetHistorySize: number;
	defaultLocale: GDLocale;
	defaultExportType: ExportTypeFolder;
	apiEnabled: boolean;
	availableLocales: GDLocale[];
	allSupportedLocales: GDLocaleMap;
	googleAuthClientId: string;
	jwtDurationMins: number;
};

const envSettings: EnvSettings = {
	"version": "4.0.14",
	"appType": "login",
	"defaultNumRows": 100,
	"maxDemoModeRows": 100000000,
	"maxDataSetHistorySize": 200,
	"defaultLocale": "en",
	"defaultExportType": "SQL",
	"apiEnabled": false,
	"availableLocales": [
		"en"
	],
	"allSupportedLocales": {
		"en": "English"
	},
	"googleAuthClientId": "",
	"jwtDurationMins": 15
};

export default envSettings;
