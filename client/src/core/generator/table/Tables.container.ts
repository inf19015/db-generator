import * as selectors from "~store/generator/generator.selectors";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import Tables, { TablesProps } from "./Tables.component";
import { GDAction } from "~types/general";
import * as actions from "~store/generator/generator.actions";
import { undoGroup } from "~store/generator/batchGroupBy";

const mapStateToProps = (state: any): Partial<TablesProps> => ({
	selectedTab: selectors.getSelectedTableTab(state),
	tables: selectors.getSortedTablesArray(state),
});

const mapDispatchToProps = (dispatch: Dispatch): Partial<TablesProps> => ({
	onTabChange: (selectedTab: number): GDAction => dispatch(actions.onSelectTableTab(selectedTab)),
	addTableTab: undoGroup((): GDAction => dispatch(actions.addTable())),
	reorderRows: (id: string, newIndex: number, newTableId: string): any => dispatch(actions.repositionRow(id, newIndex, newTableId)),
	onDelete: undoGroup((id: string): void => dispatch(actions.removeTable(id))),
	onChangeTitle: (): any => dispatch(actions.openChangeTableTitleDialog())
});

const tables: any = connect(
	mapStateToProps,
	mapDispatchToProps
)(Tables);

export default tables;
