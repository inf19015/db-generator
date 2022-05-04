import React from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import TextField from '@mui/material/TextField';
import { getLocale, getStrings } from '~utils/langUtils';
import { arDZ, de, enUS, es, fr, ja, hi, nl, pt, ta, zhCN } from 'date-fns/locale';

// localized wrapper for the date picker provider
export const LocalizedDatePicker = (props: any): JSX.Element => {
	const { core: i18n } = getStrings();

	return (
		<DatePicker
			{...props}
			cancelLabel={i18n.cancel}
			renderInput={(props) => <TextField {...props} />}
		/>
	);
};

// localized wrapper for the date picker provider
export const LocalizedDatePickerProvider = ({ children }: any): JSX.Element => {
	const locale = getLocale();

	const localeMap = {
		ar: arDZ,
		en: enUS,
		fr,
		de,
		es,
		ja,
		hi,
		nl,
		pt,
		ta,
		zh: zhCN
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} locale={localeMap[locale]}>
			{children}
		</LocalizationProvider>
	);
};
