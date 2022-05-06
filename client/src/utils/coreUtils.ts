import { nanoid } from 'nanoid';
import webWorkers from '../../_pluginWebWorkers';
import { DataTypeFolder, ExportTypeFolder } from '../../_plugins';
import env from '../../_env';

import { ExportTypeMap } from '~types/exportTypes';
import { DataTypeMap } from '~types/dataTypes';
import { CountryNamesMap } from '~types/countries';

export const getScriptVersion = (): string => env.version;

type WorkerMap = {
	[workerId: string]: Worker;
}

const dataTypeWorkers: WorkerMap = {};
const exportTypeWorkers: WorkerMap = {};

export const createDataTypeWorker = (customId: string | null = null): string => {
	const workerId = (customId) ? customId : nanoid();
	dataTypeWorkers[workerId] = new Worker(`./workers/${webWorkers.coreDataTypeWorker}`);
	return workerId;
};

export const getDataTypeWorker = (id: string): Worker => dataTypeWorkers[id];

export const destroyDataTypeWorker = (id: string): void => { delete dataTypeWorkers[id]; };

export const createExportTypeWorker = (customId: string | null = null): string => {
	const workerId = (customId) ? customId : nanoid();
	exportTypeWorkers[workerId] = new Worker(`./workers/${webWorkers.coreExportTypeWorker}`);
	return workerId;
};

export const getExportTypeWorker = (id: string): Worker => exportTypeWorkers[id];

export const getDataTypeWorkerMap = (dataTypes: DataTypeFolder[]): DataTypeMap => {
	const map: DataTypeMap = {};
	const dataTypeMap: any = webWorkers.dataTypes;
	dataTypes.forEach((dataType: DataTypeFolder) => {
		map[dataType] = dataTypeMap[dataType];
	});
	return map;
};

export const getExportTypeWorkerMap = (exportTypes: ExportTypeMap): ExportTypeMap => {
	const map: ExportTypeMap = {};
	const dataTypeMap: any = webWorkers.exportTypes;
	Object.keys(exportTypes).forEach((exportType: ExportTypeFolder) => {
		map[exportType] = dataTypeMap[exportType];
	});
	return map;
};

// TODO rename to getWorkerUtilsFilename ?
export const getWorkerUtils = (): string => webWorkers.workerUtils;

const messageIds: any = {};
const liveMessages: any = {};

// wrapper method for the worker calls. This just adds a layer to abort any previous unfinished messages that are
// sent to the worker. It's up to the worker to handle aborting it however it sees fit, but the important part is
// that it doesn't post back any data from stale requests
export const performTask = (workerName: string, worker: any, postMessagePayload: any, onMessage: any): void => {
	if (liveMessages[workerName]) {
		console.log("trying to abort");
		worker.postMessage({ _action: 'abort', _messageId: messageIds[workerName] });
		liveMessages[workerName] = false;
	}

	if (!messageIds[workerName]) {
		messageIds[workerName] = 1;
	} else {
		messageIds[workerName]++;
	}

	worker.postMessage({
		...postMessagePayload,
		_messageId: 1
	});

	worker.onmessage = (data: any): void => {
		onMessage(data);
	};
};

export const sleep = (duration: number) => {
	return new Promise(resolve => setTimeout(resolve, duration));
};

export const easeInOutSine = (t: any, b: any, c: any, d: any): number => {
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};

let namesPlugins: any = null;
export const getCountryNamesBundle = (): any => {
	return new Promise((resolve, reject) => {
		import(
			/* webpackChunkName: "countryNames" */
			/* webpackMode: "lazy" */
			`../../_namePlugins`
		)
			.then((resp: any) => {
				namesPlugins = resp.default;
				resolve(resp.default);
			})
			.catch((e) => {
				reject(e);
			});
	});
};

export const getCountryNames = (): CountryNamesMap | null => namesPlugins;
