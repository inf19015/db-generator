import * as selectors from "~store/generator/generator.selectors";
import * as actions from '~store/generator/generator.actions';
import { Dispatch } from "redux";
import { connect } from "react-redux";
import Table, { TableProps } from "~core/generator/table/Table.component";

const mapStateToProps = (state: any, ownProps: any): Partial<TableProps> => (ownProps);

const mapDispatchToProps = (dispatch: Dispatch): Partial<TableProps> => ({
	onDelete: (id: string): void => dispatch(actions.removeTable(id)),
	onChangeTitle: (): any => dispatch(actions.openChangeTableTitleDialog())
});

const table: any = connect(
	mapStateToProps,
	mapDispatchToProps
)(Table);

export default table;
