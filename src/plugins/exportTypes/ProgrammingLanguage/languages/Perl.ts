import { ETMessageData } from '~types/exportTypes';

export const generatePerl = (data: ETMessageData, stripWhitespace: boolean): string => {
	const newline = (stripWhitespace) ? '' : '\n';
	const tab = (stripWhitespace) ? '' : '\t';
	let content = '';

	const { isFirstBatch, isLastBatch, rows, columns } = data;
	if (isFirstBatch) {
		content += `@data = (${newline}`;
	}

	rows.forEach((row: any, rowIndex: number) => {
		const pairs: string[] = [];
		columns.forEach(({ title }, colIndex) => {
			const currValue = row[colIndex];
			pairs.push(`"${title}" => "${currValue}"`);

			// 		if ($this->isNumeric($j, $currValue) || $this->isBoolean($j, $currValue)) {
			// 			$pairs[] = "\"$varName\" => {$currValue}";
			// 		} else {
			// 			$pairs[] = "\"$varName\" => \"{$currValue}\"";
			// 		}
		});

		content += `${tab}{${newline}${tab}${tab}` + pairs.join(`,${newline}${tab}${tab}`) + `${newline}${tab}}`;

		if (isLastBatch && rowIndex == rows.length - 1) {
			content += newline;
		} else {
			content += `,${newline}`;
		}
	});

	if (isLastBatch) {
		content += ');';
	}

	return content;
};

