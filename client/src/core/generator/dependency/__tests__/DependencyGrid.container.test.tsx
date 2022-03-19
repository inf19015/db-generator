import React from 'react';
import Grid from '../DependencyGrid.container';
import { renderWithStoreAndRouter } from '../../../../../tests/testHelpers';

describe('DependencyGrid', () => {
	it('renders', () => {
		const { baseElement } = renderWithStoreAndRouter(
			<Grid />
		);

		expect(baseElement.querySelector('div')).toBeTruthy();
	});
});
