import React, { useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import * as coreUtils from '~utils/coreUtils';
import { ExportTypeFolder } from '../../../../_plugins';
import { LoadedExportTypes } from '~utils/exportTypeUtils';
import { getCountryData } from '~utils/countryUtils';
import { GeneratorLayout } from '~core/generator/Generator.component';

export type CodeMirrorWrapperProps = {
	previewRows: any;
	tables: any;
	columns: any;
	exportType: ExportTypeFolder;
	exportTypeSettings: any;
	theme: string;
	codeMirrorMode: string;
	showLineNumbers: boolean;
	enableLineWrapping: boolean;
	generatorLayout: GeneratorLayout;
	loadedExportTypes: LoadedExportTypes;
};

const CodeMirrorWrapper = (props: CodeMirrorWrapperProps): JSX.Element => {
	const {
		previewRows, columns, exportType, exportTypeSettings, codeMirrorMode, theme, showLineNumbers, loadedExportTypes,
		generatorLayout, enableLineWrapping
	} = props;
	const [code, setCode] = React.useState('');
	const [codeMirrorInstance, setCodeMirrorInstance] = React.useState<any>(null);

	useEffect(() => {
		if (!columns.length || !previewRows.length) {
			return;
		}
		generatePreviewString(props)
			.then((str: string) => {
				setCode(str);
			});
	}, [previewRows, columns, exportType, exportTypeSettings, loadedExportTypes]);

	useEffect(() => {
		if (codeMirrorInstance) {
			codeMirrorInstance.refresh();
		}
	}, [generatorLayout]);

	return (
		<CodeMirror
			value={code}
			onBeforeChange={(editor, data, value): void => setCode(value)}
			editorDidMount={(editor): void => setCodeMirrorInstance(editor)}
			options={{
				mode: codeMirrorMode,
				theme,
				lineNumbers: showLineNumbers,
				lineWrapping: enableLineWrapping,
				readOnly: true
			}}
		/>
	);
};

export default CodeMirrorWrapper;

export const generatePreviewString = (props: any): Promise<any> => {
	const { previewRows, columns, tables, exportType, exportTypeSettings, loadedExportTypes } = props;
	const exportTypeWorker = coreUtils.getExportTypeWorker('preview');

	return new Promise((resolve) => {
		coreUtils.performTask('exportTypeWorker', exportTypeWorker, {
			tables: tables,
			rows: previewRows,
			columns,
			exportType,
			exportTypeSettings: exportTypeSettings[exportType],
			isFirstBatch: true,
			isLastBatch: true,
			stripWhitespace: false,
			workerResources: {
				workerUtils: coreUtils.getWorkerUtils(),
				exportTypes: coreUtils.getExportTypeWorkerMap(loadedExportTypes),
				countryData: getCountryData()
			}
		}, ({ data }: MessageEvent): void => {
			resolve(data);
		});
	});
};
