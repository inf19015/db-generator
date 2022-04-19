import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { GridRow, GridRowProps } from './DependencyGridRow.component';
import { getCountryNames } from '~utils/coreUtils';
import { Store } from '~types/general';
import { DependencyRow } from '~store/generator/generator.reducer';
import * as actions from '~store/generator/generator.actions';
import * as selectors from '~store/generator/generator.selectors';
import { DataTypeFolder } from '../../../../_plugins';
import { ActionTypes } from 'react-select';
import { undoGroup } from "~store/generator/batchGroupBy";

type OwnProps = {
	row: DependencyRow;
	index: number;
	gridPanelDimensions: {
		width: number;
		height: number;
	};
	showHelpDialog: (dataType: DataTypeFolder) => void;
};

const mapStateToProps = (state: Store, ownProps: OwnProps): Partial<GridRowProps> => {
	return {
		dtDropdownOptions: selectors.getRowsAsOptions(state),
		i18n: selectors.getCoreI18n(state),
		countryI18n: selectors.getCountryI18n(state),
		countryNamesMap: getCountryNames(),
		...ownProps
	};
};

const mapDispatchToProps = (dispatch: Dispatch): Partial<GridRowProps> => ({
	onRemove: undoGroup((id: string): any => dispatch(actions.removeDepRow(id))),
	onSelectLeftSide: undoGroup((selected, dependencyId): any => dispatch(actions.onSelectDepLeftSide(selected, dependencyId))),
	onSelectRightSide: undoGroup((selected, dependencyId): any => dispatch(actions.onSelectDepRightsSide(selected, dependencyId))),
	toggleMvd: undoGroup((dependencyId: string): any => dispatch(actions.toggleDepMvd(dependencyId)))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(GridRow);
