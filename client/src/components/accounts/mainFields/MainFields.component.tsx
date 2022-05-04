import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '~components/TextField';
import Dropdown from '~components/dropdown/Dropdown';
import { canadianProvinceOptions, countryDropdownOptions } from '~utils/countryUtils';
import { AccountEditingData } from '~store/account/account.reducer';
import { isValidEmail } from '~utils/generalUtils';
import sharedStyles from '../../../styles/shared.scss';

export type MainFieldsProps = {
	data: AccountEditingData;
	accountHasChanges: boolean;
	updateAccount: (data: AccountEditingData) => void;
	submitButtonLabel: string;
	i18n: any;
	onSave: () => void;
	onCancel: () => void;
	showRequiredFieldError: boolean;
	isAddingUser: boolean;
	className?: string;
};

const MainFields = ({
	data, accountHasChanges, updateAccount, onSave, onCancel, submitButtonLabel, i18n, showRequiredFieldError,
	isAddingUser, className = ''
}: MainFieldsProps): JSX.Element => {
	const emailFieldRef = useRef(null);

	// very fussy indeed!
	const [emailFieldHasFocus, setEmailFieldHasFocus] = useState(false);
	const [emailFieldHasHadFocus, setEmailFieldHasHadFocus] = useState(false);

	const onBlurEmail = (): void => {
		setEmailFieldHasFocus(false);
		setEmailFieldHasHadFocus(true);
	};

	const update = (fieldName: string, value: string): void => {
		updateAccount({
			...data,
			[fieldName]: value
		});
	};

	let fieldsValid = true;
	if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
		if (showRequiredFieldError) {
			fieldsValid = false;
		}
	}
	let emailError;
	if (data.email.trim() === '') {
		if (showRequiredFieldError) {
			emailError = i18n.requiredField;
		}
	} else if (!isValidEmail(data.email)) {
		// subtle. We only want to show the email field is in an invalid state when
		// (a) adding an email and the user's moved off the field & left it in an invalid state
		// (b) is editing the email
		if (!isAddingUser || (emailFieldHasHadFocus && !emailFieldHasFocus)) {
			emailError = i18n.validationInvalidEmail;
			fieldsValid = false;
		}
	}

	const saveButtonEnabled = accountHasChanges && fieldsValid;

	const getCanadianRegions = (): JSX.Element | null => {
		if (data.country !== 'CA') {
			return null;
		}

		return (
			<>
				<label>{i18n.province}</label>
				<div style={{ marginBottom: 15 }}>
					<Dropdown
						value={data.region}
						onChange={(item: any): any => update('region', item.value)}
						options={canadianProvinceOptions}
					/>
				</div>
			</>
		);
	};

	const handleSave = (e: any): void => {
		e.preventDefault();

		if (!fieldsValid) {
			return;
		}

		onSave();
	};

	const firstNameError = (showRequiredFieldError && data.firstName.trim() === '') ? i18n.requiredField : '';
	const lastNameError = (showRequiredFieldError && data.lastName.trim() === '') ? i18n.requiredField : '';

	let cancelLinkClasses = sharedStyles.cancelLink;
	if (!saveButtonEnabled) {
		cancelLinkClasses += ` ${sharedStyles.hidden}`;
	}

	return (
		<form onSubmit={handleSave} autoComplete="off" className={className}>
			<div>
				<label>{i18n.firstName}</label>
				<div style={{ marginBottom: 15 }}>
					<TextField
						error={firstNameError}
						value={data.firstName}
						name="firstName"
						onChange={(e: any): void => update('firstName', e.target.value)}
						style={{ width: '100%' }}
						autoFocus
					/>
				</div>

				<label>{i18n.lastName}</label>
				<div style={{ marginBottom: 15 }}>
					<TextField
						error={lastNameError}
						value={data.lastName}
						name="lastName"
						onChange={(e: any): void => update('lastName', e.target.value)}
						style={{ width: '100%' }}
					/>
				</div>

				<label>{i18n.email}</label>
				<div style={{ marginBottom: 15 }}>
					<TextField
						error={emailError}
						value={data.email}
						name="email"
						onChange={(e: any): void => update('email', e.target.value)}
						onFocus={(): void => setEmailFieldHasFocus(true)}
						onBlur={onBlurEmail}
						style={{ width: '100%' }}
						ref={emailFieldRef}
					/>
				</div>

				<label>{i18n.country}</label>
				<div style={{ marginBottom: 15 }}>
					<Dropdown
						value={data.country}
						onChange={(item: any): any => update('country', item.value)}
						options={countryDropdownOptions}
					/>
				</div>

				{getCanadianRegions()}
			</div>

			<div>
				<Button
					type="submit"
					color="primary"
					variant="contained"
					disableElevation
					disabled={!saveButtonEnabled}
				>
					{submitButtonLabel}
				</Button>

				<span onClick={onCancel} className={cancelLinkClasses}>{i18n.cancel}</span>
			</div>
		</form>
	);
};

export default MainFields;
