import styles from "~core/dialogs/login/Login.scss";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "~components/dialogs";
import TextField from "~components/TextField";
import Button from "@mui/material/Button";
import React, { useRef, useState } from "react";
import { Table } from "~store/generator/generator.reducer";


export type RenameTableProps = {
    table: Table;
    visible: boolean;
    onClose: () => void;
	onExited: () => void;
    onSubmit: (newTitle: string, id: string) => void;
    i18n: any;
};

const RenameTableDialog = ({ table, visible, onClose, onExited, onSubmit, i18n }: RenameTableProps): JSX.Element => {
    if(!table) return <div hidden={true}/>;
	const titleFieldRef = useRef<any>();
	const [title, setTitle] = useState(table.title || "");

	const onEntering = (): void => setTitle(table.title);
	const onEntered = (): void => titleFieldRef?.current?.focus();

	const onSubmitNewTitle = (e: any): void => {
		e.preventDefault();
		onSubmit(title, table.id);
		onClose();
	};

	return (
		<>
			<Dialog
				onClose={onClose}
				open={visible}
				className={styles.loginDialog}
				TransitionProps={{
					onEntering,
					onEntered,
					onExited
				}}>
				<form onSubmit={onSubmitNewTitle}>
					<div style={{ width: 380 }}>
						<DialogTitle onClose={onClose}>Rename Table</DialogTitle>
						<DialogContent dividers>
							<div>
								<div className={styles.col}>
									<label>Title</label>
									<div style={{ marginBottom: 15 }}>
										<TextField
											ref={titleFieldRef}
											value={title}
											name="Table"
											onChange={(e: any): void => setTitle(e.target.value)}
											style={{ width: '100%' }}
											throttle={false}
											autoFocus
										/>
									</div>
								</div>
							</div>
						</DialogContent>
						<DialogActions className={styles.actionsRow}>
							<Button type="submit" color="primary" variant="outlined">
								change
							</Button>
						</DialogActions>
					</div>
				</form>
			</Dialog>
		</>
	);
};

export default RenameTableDialog;