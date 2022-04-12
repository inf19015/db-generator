import { DTOnMessage } from "~types/dataTypes";

let utilsLoaded = false;
export const onmessage = (e: DTOnMessage) => {
	if (!utilsLoaded) {
		importScripts(e.data.workerResources.workerUtils);
		utilsLoaded = true;
	}
	const { pkId } = e.data.rowState;
	const { existingRowData } = e.data;
	let foundId = false;
	existingRowData.forEach(({ id, data }) => {
		if (id === pkId ) {
			foundId = true;
			postMessage({
				display: data.display
			});
			return;
		}
	});
	if(!foundId){
		postMessage({
			display: ""
		});
	}

};