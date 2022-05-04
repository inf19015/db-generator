import React from 'react';
import Button from '@mui/material/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '~components/dialogs';
import Dropdown from '~components/dropdown/Dropdown';
import { DTHelpProps, DTMetadata, DTOptionsProps } from '~types/dataTypes';
import * as styles from './ForeignKey.scss';


export type ForeignKeyState = {
	pkId: string | undefined;
	tableId: string | undefined;
}

const FKDialog = ({ visible, data, id, onClose, coreI18n, onUpdate, rowOptions, i18n }: any): JSX.Element => {
	const getFieldsRow = (): JSX.Element | null => {
		return (
			<div className={styles.fieldsRow}>
				<div className={styles.fieldRow} style={{ marginRight: 10 }}>
					<label>PK Field</label>
					<Dropdown
						value={data.pkId}
						onChange={(item: any): any => {
							onUpdate('pkId', item.value.currentId);
							onUpdate('tableId', item.value.tableId);
						}}
						options={[
							{ value: '', label: coreI18n.pleaseSelect },
							...rowOptions
						]}
					/>
				</div>
			</div>
		);
	};

	return (
		<Dialog onClose={onClose} open={visible}>
			<div style={{ width: 500 }}>
				<DialogTitle onClose={onClose}>{i18n.selectSource}</DialogTitle>
				<DialogContent dividers>
					<div>
						{i18n.emailDesc}
					</div>

					<h3>{i18n.source}</h3>
					{getFieldsRow()}
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} color="primary" variant="outlined">{coreI18n.close}</Button>
				</DialogActions>
			</div>
		</Dialog>
	);
};

export const initialState: ForeignKeyState = {
	pkId: undefined,
	tableId: undefined
};

export const Options = ({ i18n, coreI18n, id, data, onUpdate, selectableRows, allRows }: DTOptionsProps): JSX.Element => {
	const safeData = data;
	const [dialogVisible, setDialogVisibility] = React.useState(false);

	const currentTitle = allRows.find((row: any) => row.id === data.pkId)?.title || i18n.nothing;
	const label = `${i18n.source} ${currentTitle}`;

	const rowOptions = selectableRows
		.map(({ id: currentId, title, index, tableTitle, tableId }: any) => ({
			value: { currentId, tableId },
			label: `${tableTitle}: ${title}`
		}));

	React.useEffect(() => {
		if (!selectableRows.length ) {
			onUpdate({
				...safeData,
			});
		}
	}, [selectableRows]);

	return (
		<div className={styles.buttonLabel}>
			<Button
				onClick={(): void => setDialogVisibility(true)}
				variant="outlined"
				color="primary"
				size="small">
				<span dangerouslySetInnerHTML={{ __html: label }} />
			</Button>
			<FKDialog
				visible={dialogVisible}
				data={safeData}
				id={id}
				coreI18n={coreI18n}
				i18n={i18n}
				onUpdate={(field: string, value: any): void => onUpdate({ ...safeData, [field]: value })}
				rowOptions={rowOptions}
				onClose={(): void => setDialogVisibility(false)}
			/>
		</div>
	);
};

export const Help = ({ i18n }: DTHelpProps): JSX.Element => (
	<>
		<p>
			{i18n.emailHelp1}
		</p>

		<h3>{i18n.sourceTitle}</h3>
		<p>
			{i18n.emailHelp2}
		</p>

		<h3>{i18n.domains}</h3>
		<p>
			{i18n.emailHelp3}
		</p>

		<h3>{i18n.domainSuffixes}</h3>
		<p>
			{i18n.emailHelp4}
		</p>
	</>
);

export const getMetadata = (): DTMetadata => {
	return ({
		general: {
			dataType: 'number'
		},
		sql: {
			field: 'int',
			field_MySQL: `int unsigned`,
			field_SQLite: 'INTEGER',
			field_Oracle: 'number default NULL',
			field_MSSQL: 'INTEGER NULL',
			field_Postgres: 'integer'
		}
	}
);
};

