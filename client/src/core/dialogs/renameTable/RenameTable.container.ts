import * as selectors from "~store/generator/generator.selectors";
import { Dispatch } from "redux";
import * as actions from "~store/generator/generator.actions";
import { connect } from "react-redux";
import RenameTableDialog, { RenameTableProps } from "~core/dialogs/renameTable/RenameTable.component";

const mapStateToProps = (state: any): Partial<RenameTableProps> => ({
	i18n: selectors.getCoreI18n(state),
	visible: selectors.shouldShowChangeTableTitleDialog(state),
	table: selectors.getSelectedTable(state),

});

const mapDispatchToProps = (dispatch: Dispatch): Partial<RenameTableProps> => ({
	onClose: (): any => dispatch(actions.closeChangeTableTitleDialog()),
	onSubmit: (title: string, id: string): any => dispatch(actions.onChangeTableTitle(id, title)),
});

const container: any = connect(
	mapStateToProps,
	mapDispatchToProps
)(RenameTableDialog);

export default container;
