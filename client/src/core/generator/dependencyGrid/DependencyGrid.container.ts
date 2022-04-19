import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as actions from '~store/generator/generator.actions';
import * as selectors from '~store/generator/generator.selectors';
import DependencyGrid, { DependencyGridProps } from './DependencyGrid.component';
import { DataTypeFolder } from '../../../../_plugins';
import { undoGroup } from "~store/generator/batchGroupBy";

const mapStateToProps = (state: any): Partial<DependencyGridProps> => ({
	i18n: selectors.getCoreI18n(state),
	columnTitle: selectors.getExportTypeColumnTitle(state),
	rows: selectors.getSortedDependencyRowsArray(state)
});

const mapDispatchToProps = (dispatch: Dispatch): Partial<DependencyGridProps> => ({
	onAddRows: undoGroup((numRows: number): any => dispatch(actions.addDepRows(numRows))),
	onSort: (id: string, newIndex: number): any => dispatch(actions.repositionDepRow(id, newIndex)),
	toggleGrid: (): any => dispatch(actions.toggleDependencyGrid()),
	changeSmallScreenVisiblePanel: (): any => dispatch(actions.changeSmallScreenVisiblePanel()),
});

const container: any = connect(
	mapStateToProps,
	mapDispatchToProps
)(DependencyGrid);

export default container;
