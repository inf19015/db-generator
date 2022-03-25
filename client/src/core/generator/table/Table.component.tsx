import Grid from "~core/generator/grid/Grid.container";
import { Table as TableType } from "../../store/generator/generator.reducer";
import React from "react";
import { NullButton } from "~components/Buttons.component";

export type TableProps = {
    table: TableType;
	onDelete: (id: string) => any;
	onChangeTitle: () => any;
};

export const Table = ({ table, onDelete, onChangeTitle }: TableProps): JSX.Element => {

	return(
		<div style={{ padding: 0, margin: 0 }}>
			<Grid tableId={table.id} />
			<NullButton onClick={(): void => onDelete(table.id)}>Delete Table</NullButton>
			<NullButton onClick={onChangeTitle}>Rename Table</NullButton>
		</div>  
	);
};

export default Table;