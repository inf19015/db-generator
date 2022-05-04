import React, { useCallback } from "react";
import { Table as TableType } from "../../store/generator/generator.reducer";
import { Box, Tab, Tabs } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, DragUpdate, Droppable, DropResult, ResponderProvided, SensorAPI } from "react-beautiful-dnd";
import styles from './Tables.scss';
import Grid from "~core/generator/grid/Grid.container";

export type TablesProps = {
    selectedTab: number;
    onTabChange: (value: number) => void;
    addTableTab: () => void;
    tables: TableType[];
	reorderRows: (id: string, newIndex: number, newTableId: string) => void;
	onDelete: (id: string) => any;
	onChangeTitle: () => any;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
interface TabDeleteLabelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
	onDelete: () => void;
	onEdit: () => void;
}

const TabPanel = (props: TabPanelProps): JSX.Element => {
	const { children, value, index, ...other } = props;
	return (
		<div
			// style={{ height: "100%" }}
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


const TabDeleteLabel = (props: TabDeleteLabelProps): JSX.Element => {
	const { children, value, index, onDelete, onEdit, ...other } = props;
	return (
		<div className={styles.TabLabel} {...other}>
			<div className={styles.TabLabelContent} >{children}</div>
			<div className={styles.TabLabelEdit} hidden={value !== index} onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onEdit();
			}}>
				<EditIcon />
			</div>

			<div className={styles.TabLabelDelete} hidden={value !== index} onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onDelete();
			}}>
				<CloseIcon />
			</div>
		</div>
	);
};

const a11yProps = (index: number): any => {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
};



export const Tables = ({ selectedTab, onTabChange, addTableTab, tables, reorderRows, onDelete, onChangeTitle }: TablesProps): JSX.Element => {

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
											<Tab
												key={"tabof" + table.id}
												label={
													<TabDeleteLabel
														value={selectedTab}
														index={i}
														onDelete={() => onDelete(table.id)}
														onEdit={() => onChangeTitle()}
													>
														<p>{table.title}</p>
													</TabDeleteLabel>
												}
												iconPosition="end"
												// icon = {}
												// sx ={{  }}
												{...a11yProps(i)}/>
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
							<Grid tableId={table.id} />
						</TabPanel>
					)}
				</DragDropContext>
			</Box>
		</Box>
	);
};

export default Tables;
