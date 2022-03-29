import { GeneratorLayout } from '~core/generator/Generator.component';
import { ColumnData, TableData } from '~types/general';
import { CountryMap } from '~types/countries';
import { DataTypeMap } from '~types/dataTypes';
import { ExportTypeFolder } from '../_plugins';

export type ExportTypeMap = {
	[exportType in ExportTypeFolder]?: string;
};

export interface ETValidateTitleField {
	(title: string, i18n: any, settings?: any): string | null;
}

export type ETBundle = {
	getCodeMirrorMode: (settings: any) => string; // TODO generics - data is same type as initialState
	getDownloadFileInfo: (downloadPacket: ETDownloadPacket) => ETDownloadPacketResponse;
	initialState?: any; // TODO generics
	Settings?: any;
	getExportTypeLabel?: (data: any) => string; // TODO generics - data is same type as initialState
	validateTitleField?: ETValidateTitleField;
	isValid?: (data: any) => boolean;
};

export interface ETState {
	isValid: boolean;
}

export type ETFieldGroup = 'core' | 'programmingLanguage';

export type ETDefinition = {
	fieldGroup: ETFieldGroup;
	codeMirrorModes: string[];
};

export type ETSettings = {
	onUpdate: Function; // from container
	data: any; // from store
	id: string;
	layout: GeneratorLayout;
	i18n: any;
	coreI18n: any;
};

export type ETMessageData = {
	action: 'generate' | 'pause' | 'continue' | 'abort';
	tables: TableData[];
	columns: ColumnData[];
	rows: any[];
	isFirstBatch: boolean;
	isLastBatch: boolean;
	settings: any; // TODO generic possible? This is the export type settings
	stripWhitespace: boolean;
	rowState: any;
	workerResources: {
		workerUtils: string;
		exportTypes: ExportTypeMap;
		dataTypes: DataTypeMap;
		countries: CountryMap;
	};
};

interface ETOnMessage extends MessageEvent {
	data: ETMessageData;
}

export type ETDownloadPacket = {
	packetId: string;
	settings: any;
};

export type ETDownloadPacketResponse = {
	filename: string;
	fileType: string;
};


