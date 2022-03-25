import Table from "./Table.container";
import React, { useCallback } from "react";
import { Table as TableType } from "../../store/generator/generator.reducer";
import { Box, Tab, Tabs } from "@material-ui/core";
import AddBoxIcon from '@material-ui/icons/AddBox';
import { DragDropContext, DragUpdate, Droppable, DropResult, ResponderProvided, SensorAPI } from "react-beautiful-dnd";
import * as styles from "~core/generator/grid/Grid.scss";

export type TablesProps = {
    selectedTab: number;
    onTabChange: (value: number) => void;
    addTableTab: () => void;
    tables: TableType[];
	reorderRows: (id: string, newIndex: number, newTableId: string) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps): JSX.Element => {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{children}
		</div>
	);
};

const a11yProps = (index: number): any => {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
};



export const Tables = ({ selectedTab, onTabChange, addTableTab, tables, reorderRows }: TablesProps): JSX.Element => {

	const onSort = (result: DropResult): void => {
		const { draggableId, destination: destination } = result;
		const droppableId = destination?.droppableId;
		if(!destination || !droppableId) return;

		if(droppableId.startsWith("droppable-table-")){
			const tableId = droppableId.replace("droppable-table-", "");
			reorderRows(draggableId, destination.index, tableId);
		}else if(droppableId.startsWith("tab-")){
			const tableId = droppableId.replace("tab-", "");
			const tabIndex = tables.findIndex((t)=> t.id === tableId);
			if(tabIndex > -1 && tabIndex !== selectedTab){
				reorderRows(draggableId, destination.index, tableId);
				onTabChange(tabIndex);
			}
		}

	};

	return (
		<Box sx={{ width: '100%' }}>
			<Box sx={{ borderBottom: 1, borderColor: 'blue' }}>
				<DragDropContext onDragEnd={onSort} >
					<Tabs value={selectedTab} onChange={(e, v) => onTabChange(v)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ color: 'primary' }}>
						{tables.map((table, i) =>
							<div key={"droppable-tab-"+table.id}
								 onClick={() => onTabChange(i)}>
								<Droppable droppableId={"tab-"+table.id}>
									{(provided: any): any => (
										<div
											{...provided.droppableProps}
											ref={provided.innerRef}
										>
											<Tab key={"tabof" + table.id} label={table.title} {...a11yProps(i)} />
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</div>

						)}
						<Tab icon={<AddBoxIcon/>} sx={{ color: 'black', width: '10px', fontSize: '20px', p: 0 }} {...a11yProps(tables.length)} onClick={addTableTab}/>
					</Tabs>

					{tables.map((table, i) =>
						<TabPanel key={"tabpanel" + table.id} value={selectedTab} index={i} >
							<Table table={table}/>
						</TabPanel>
					)}
				</DragDropContext>
			</Box>
		</Box>
	);
};

export default Tables;