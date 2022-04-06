import { DependencyRow } from "~store/generator/generator.reducer";
import { nanoid } from "nanoid";
// @ts-ignore
import * as _ from "lodash";

const includesAll = (array: any, elements: any) => {
	for (const element of elements) {
		if (!array.includes(element)) return false;
	}
	return true;
};
const includesNone = (array: any, elements: any) => {
	for (const element of elements) {
		if (array.includes(element)) return false;
	}
	return true;
};

// const distinct = <T>(array: Array<T>): Array<T> => array.filter((value, index, self) => self.indexOf(value) === index)
const distinct = _.uniq;

export const canReachAttributes = (startAttributes: Array<string>, attributesToReach: Array<string>, dependencies: Array<DependencyRow>): boolean => {
	const possibleDependenciesIds = dependencies.filter(dep => includesAll(startAttributes, dep.leftSide)).flatMap(dep => dep.rightSide);
	const reachableAttributes = [...startAttributes];
	possibleDependenciesIds.forEach(id => {
		if (!reachableAttributes.includes(id)) reachableAttributes.push(id);
	});
	if (includesAll(reachableAttributes, attributesToReach)) return true;
	if (reachableAttributes.length === startAttributes.length && includesAll(reachableAttributes, startAttributes)) return false;
	return canReachAttributes(reachableAttributes, attributesToReach, dependencies);
};

// const rowIds = selectors.getSortedRowsOfTable(state, tableId);
// const getFunctionalDependencies = (state:Store) => selectors.getSortedDependencyRowsArray(state).filter(dep => !dep.isMvd);
// const dependencies = getFunctionalDependencies(state);

export const getKeyCandidates = (rowIds: string[], allDependencies: Array<DependencyRow>): string[][] => {
	const dependencies = allDependencies.filter(dep => !dep.isMvd);
	// An attribute is independent when it's not present at any right side of a dependency
	const isIndependent = (rowId: any) =>
		!dependencies.flatMap(dep => dep.rightSide).includes(rowId);
	const independentAttributes = rowIds.filter(rowId => isIndependent(rowId));
	if (canReachAttributes(independentAttributes, rowIds, dependencies)) {
		return [independentAttributes];
	}
	const attributeslisted = rowIds.map(id => [id]);
	let powerAttributes = rowIds.map(id => [id]);
	for (let i = 1; i < rowIds.length; i++) {
		const candidates = powerAttributes.filter(at => canReachAttributes(at, rowIds, dependencies));
		if (candidates.length > 0) return candidates;
		const powerAttributesWithPossibleDuplicates = powerAttributes.flatMap(p => attributeslisted.filter(l => includesNone(p, l)).map(it => [...p, ...it]))
			.map(l => l.sort((a, b) => b.localeCompare(a)));
		powerAttributes = distinct(powerAttributesWithPossibleDuplicates);
	}
	return [];
};

export const getCanonicalCover = (functionalDependencies: Array<DependencyRow>): Array<DependencyRow> => {
	const possibleLeftReductionDependencies = functionalDependencies.filter(fd => fd.leftSide.length >= 2);
	const otherDependencies = functionalDependencies.filter(fd => fd.leftSide.length === 1);
	const leftReducedDependencies = possibleLeftReductionDependencies.map(fd => {
		const attributes = fd.leftSide.filter(at => !canReachAttributes([at], fd.rightSide, functionalDependencies));
		if (attributes.length === 0) {
			attributes.push(fd.leftSide[0]);
		}
		return ({
			id: nanoid(),
			leftSide: attributes,
			rightSide: fd.rightSide,
			isMvd: false,
		});
	});
	leftReducedDependencies.push(...otherDependencies);

	const rightReducedDependencies = leftReducedDependencies.map(fd => {
		const dependencies = fd.rightSide.filter(dep => {
			const testDependencies = leftReducedDependencies.filter(td => td !== fd);
			testDependencies.push(({
				id: nanoid(),
				leftSide: fd.leftSide,
				rightSide: fd.rightSide.filter(it => it !== dep),
				isMvd: false
			}));
			return !canReachAttributes(fd.leftSide, [dep], testDependencies);
		});
		return ({
			id: nanoid(),
			leftSide: fd.leftSide,
			rightSide: dependencies,
			isMvd: false
		});
	}).filter(dep => dep.rightSide.length >= 1);

	const groupedDependencies = Object.entries(_.groupBy(rightReducedDependencies, (it: DependencyRow) => it.leftSide));
	// @ts-ignore
	return groupedDependencies.map(group => {
		const fds = group[1] as Array<DependencyRow>;
		const attributes = fds[0].leftSide;
		const dependencies = distinct(fds.flatMap((fd: DependencyRow) => fd.rightSide));
		return ({
			id: nanoid(),
			leftSide: attributes,
			rightSide: dependencies,
			isMvd: false
		});
	});
};
export const reduceSchemas = (schemas: string[][]): string[][] => {
	const newSchemas: string[][] = [];
	schemas.forEach(schema => {
		if (!newSchemas.some(it => includesAll(it, schema))) {
			newSchemas.push(schema);
		}
	});
	if (_.isEqual(newSchemas, schemas)) return newSchemas;
	return reduceSchemas(newSchemas);
};
export const to3NF = (oldDependencies: DependencyRow[], addPKs = false): [string[][], DependencyRow[]] => {
	let dependencies = getCanonicalCover(oldDependencies);
	let schemas = dependencies.map(dep => [...dep.leftSide, ...dep.rightSide]);
	if (addPKs) {
		const withIds = schemas.map(schema => addIds(schema, dependencies));
		schemas = withIds.map(([schema]) => schema);
		dependencies = getCanonicalCover(withIds.flatMap(([, deps]) => deps));
	}
	const candidateKeys = getKeyCandidates(schemas.flatMap(it => it), dependencies);
	const candidateKeyContainingSchemas = schemas.filter(schema => candidateKeys.some(key => includesAll(schema, key)));
	if (candidateKeyContainingSchemas.length === 0) candidateKeyContainingSchemas.push(candidateKeys[0]);
	schemas = distinct(schemas.map(schema => _.sortBy(schema))); // remove duplicates by same values
	schemas = reduceSchemas(schemas);
	return [schemas, dependencies];
};

export const addIds = (schema: string[], dependencies: DependencyRow[]): [string[], DependencyRow[]] => {
	const keys = getKeyCandidates(schema, dependencies);
	const pk = nanoid();
	const newSchema = [pk, ...schema];
	const newDependencies = [
		({
			id: nanoid(),
			leftSide: [pk],
			rightSide: keys[0],
			isMvd: false
		}),
		...dependencies
	];
	return [newSchema, newDependencies];
};


