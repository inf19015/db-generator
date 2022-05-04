import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DragIndicator from '@mui/icons-material/DragIndicator';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import Dropdown, { DropdownOption } from '~components/dropdown/Dropdown';
import { DependencyRow } from '~store/generator/generator.reducer';
import { DataTypeFolder } from '../../../../_plugins';

import * as styles from './DependencyGrid.scss';
import { CountryNamesMap } from '~types/countries';
import Button from "@mui/material/Button";
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import { ActionTypes } from "react-select";

const getItemStyle = (isDragging: boolean, draggableStyle: any): React.CSSProperties => {
	const styles: React.CSSProperties = {
		...draggableStyle,
		userSelect: 'none',
		margin: `0 0 0 0`,
	};
	if (isDragging) {
		styles.background = '#e0ebfd';
	}
	return styles;
};

export type GridRowProps = {
	row: DependencyRow;
	index: number;
	Example: any;
	Options: any;
	i18n: any;
	countryI18n: any;
	selectedDataTypeI18n: any;
	isDataTypeLoaded: boolean;
	onSelectLeftSide: (selected: string[], dependencyId: string) => void;
	onSelectRightSide: (selected: string[], dependencyId: string) => void;
	toggleMvd: (dependencyId: string) => void;
	onRemove: (id: string) => void;
	dtCustomProps: { [propName: string]: any };
	dtDropdownOptions: DropdownOption[];
	gridPanelDimensions: {
		width: number;
		height: number;
	};
	showHelpDialog: (dataType: DataTypeFolder) => void;
	isCountryNamesLoading: boolean;
	isCountryNamesLoaded: boolean;
	countryNamesMap: CountryNamesMap | null;
};


export const GridRow = ({
	row, index, onRemove, onSelectLeftSide, onSelectRightSide, dtDropdownOptions, toggleMvd, i18n
}: GridRowProps): JSX.Element => {

	const ToggleIcon = row.isMvd ? CheckBox : CheckBoxOutlineBlank;
	let mvdButtonClasses = "";
	if(row.isMvd){
		mvdButtonClasses += ` ${styles.btnSelected}`;
	}

	return (
		<Draggable key={row.id} draggableId={row.id} index={index}>
			{(provided: any, snapshot: any): any => {

				return (
					<div className={`${styles.gridRow} tour-gridRow`} key={row.id}
						 ref={provided.innerRef}
						 {...provided.draggableProps}
						 style={getItemStyle(
							 snapshot.isDragging,
							 provided.draggableProps.style
						 )}
					>
						<div className={styles.orderCol}{...provided.dragHandleProps}>
							<DragIndicator fontSize="small"/>
							{index + 1}
						</div>
						<div className={styles.leftDepSideCol}>
							<Dropdown
								className={styles.dataTypeColDropdown}
								isGrouped={false}
								value={row.leftSide}
								isMulti={true}
								onChange={(i: DropdownOption[]): void => onSelectLeftSide( i?.map((o) => o.value), row.id)}
								options={dtDropdownOptions}
							/>
						</div>
						<div className={styles.rightDepSideCol}>
							<Dropdown
								className={styles.dataTypeColDropdown}
								isGrouped={false}
								value={row.rightSide}
								isMulti={true}
								onChange={(i: DropdownOption[]): void => onSelectRightSide( i?.map((o) => o.value), row.id)}
								options={dtDropdownOptions}
							/>
						</div>
						<div className={styles.toggleMvdBtn}>
							<Button className={mvdButtonClasses} onClick={(): void => toggleMvd(row.id)} startIcon={<ToggleIcon />} />
						</div>
						<div className={styles.deleteCol} onClick={(): void => onRemove(row.id)}>
							<HighlightOffIcon />
						</div>
					</div>
				);
			}}
		</Draggable>
	);
};
