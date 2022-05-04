import { DTGenerationData, DTGenerateResult, DTOnMessage } from '~types/dataTypes';

export const generate = (data: DTGenerationData): DTGenerateResult => {
	const rowNum = data.rowNum;
	const value = (rowNum - 1) + 1;
	return { display: value };
};

let utilsLoaded = false;

export const onmessage = (e: DTOnMessage) => {
	if (!utilsLoaded) {
		importScripts(e.data.workerResources.workerUtils);
		utilsLoaded = true;
	}

	postMessage(generate(e.data));
};
