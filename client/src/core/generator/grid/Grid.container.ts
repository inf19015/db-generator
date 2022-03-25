import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as actions from '~store/generator/generator.actions';
import * as selectors from '~store/generator/generator.selectors';
import Grid, { GridProps } from './Grid.component';
import { DataTypeFolder } from '../../../../_plugins';
import { DataRow } from "~store/generator/generator.reducer";

const mapStateToProps = (state: any): Partial<GridProps> => ({
	i18n: selectors.getCoreI18n(state),
	columnTitle: selectors.getExportTypeColumnTitle(state),
	getRows: (id: string): DataRow[] => selectors.getRowsOfTableArray(state, id)
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): Partial<GridProps> => ({
	onAddRows: (numRows: number, tableId: string): any => dispatch(actions.addRows(numRows, tableId)),
	onSort: (id: string, newIndex: number, newTableId: string): any => dispatch(actions.repositionRow(id, newIndex, newTableId)),
	toggleGrid: (): any => dispatch(actions.toggleGrid()),
	changeSmallScreenVisiblePanel: (): any => dispatch(actions.changeSmallScreenVisiblePanel()),
	showHelpDialog: (dataType: DataTypeFolder): any => dispatch(actions.showHelpDialog(dataType)),
	...ownProps
});

const container: any = connect(
	mapStateToProps,
	mapDispatchToProps
)(Grid);

export default container;
