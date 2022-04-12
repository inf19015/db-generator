import { DTBundle } from '~types/dataTypes';
import { initialState, Help, Options, getMetadata } from './ForeignKey';
import { customProps } from './ForeignKey.store';

const bundle: DTBundle = {
	initialState,
	Help,
	Options,
	getMetadata,
	customProps,
};

export default bundle;
