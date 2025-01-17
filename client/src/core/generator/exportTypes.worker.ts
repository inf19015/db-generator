const context: Worker = self as any;

let workerResources: any;
const loadedExportTypeWorkers: any = {};
let exportTypeWorkerMap: any = {};
const abortedMessageIds: any = {};

context.onmessage = (e: MessageEvent) => {
	const {
		_action, _messageId, rows, tables, columns, isFirstBatch, isLastBatch, exportType, numResults,
		exportTypeSettings, stripWhitespace
	} = e.data;

	if (_action === 'abort') {
		abortedMessageIds[_messageId] = true;
	}

	workerResources = e.data.workerResources;
	exportTypeWorkerMap = workerResources.exportTypes;

	if (!loadedExportTypeWorkers[exportType]) {
		loadedExportTypeWorkers[exportType] = new Worker(exportTypeWorkerMap[exportType]);
	}

	const worker = loadedExportTypeWorkers[exportType];

	worker.postMessage({
		isFirstBatch,
		isLastBatch,
		numResults,
		tables, 
		rows,
		columns,
		settings: exportTypeSettings,
		stripWhitespace,
		workerResources
	});

	worker.onmessage = (e: MessageEvent): void => {
		if (abortedMessageIds[_messageId]) {
			console.log("ABORTED");
		} else {
			context.postMessage(e.data);
		}
	};
};


export {};
