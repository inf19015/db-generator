import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import GridContainer, { GridContainerProps } from './GridContainer.component';
import * as selectors from '~store/generator/generator.selectors';
import * as actions from '~store/generator/generator.actions';
import { GDAction } from '~types/general';

const mapStateToProps = (state: any): Partial<GridContainerProps> => ({
	i18n: selectors.getCoreI18n(state),
	isGridVisible: selectors.isGridVisible(state),
	gridContainerLayout: selectors.getGridContainerLayout(state),
	lastLayoutWidth: selectors.getLastGridContainerLayoutWidth(state),
	lastLayoutHeight: selectors.getLastGridContainerLayoutHeight(state),
	isDependencyGridVisible: selectors.isDependencyGridVisible(state)
});

const mapDispatchToProps = (dispatch: Dispatch): Partial<GridContainerProps> => ({
	onResizePanels: (size: number): GDAction => dispatch(actions.setGridPanelSize(size))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(GridContainer);
