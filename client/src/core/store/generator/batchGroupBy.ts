import { groupByActionTypes } from 'redux-undo';
import { nanoid } from "nanoid";

export const batchGroupBy = {
	_group: null,
	start(group = nanoid()) {
		// @ts-ignore
		this._group = group;
	},
	end() {
		this._group = null;
	},
	init(rawActions: any) {
		const defaultGroupBy = groupByActionTypes(rawActions);
		// @ts-ignore
		return (action: any) => this._group || defaultGroupBy(action);
	}
};
export const undoGroup = <T extends Array<any>>(fn: (...args: T) => void) => {
	return (...args: T): void => {
		batchGroupBy.start();
		fn(...args);
		batchGroupBy.end();
	};
};
