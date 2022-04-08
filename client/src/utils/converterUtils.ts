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
			id: fd.id,
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
				id: fd.id,
				leftSide: fd.leftSide,
				rightSide: fd.rightSide.filter(it => it !== dep),
				isMvd: false
			}));
			return !canReachAttributes(fd.leftSide, [dep], testDependencies);
		});
		return ({
			id: fd.id,
			leftSide: fd.leftSide,
			rightSide: dependencies,
			isMvd: false
		});
	}).filter(dep => dep.rightSide.length >= 1);

	const groupedDependencies = Object.entries(_.groupBy(rightReducedDependencies, (it: DependencyRow) => it.leftSide));
	return groupedDependencies.map(group => {
		const fds = group[1] as Array<DependencyRow>;
		const attributes = fds[0].leftSide;
		const dependencies = distinct(fds.flatMap((fd: DependencyRow) => fd.rightSide));
		return ({
			id: fds[0].id,
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

export const to3NF = (oldDependencies: DependencyRow[]): [string[][], DependencyRow[]] => {
	const dependencies = getCanonicalCover(oldDependencies);
	let schemas = dependencies.map(dep => [...dep.leftSide, ...dep.rightSide]);
	const candidateKeys = getKeyCandidates(schemas.flatMap(it => it), dependencies);
	const candidateKeyContainingSchemas = schemas.filter(schema => candidateKeys.some(key => includesAll(schema, key)));
	if (candidateKeyContainingSchemas.length === 0) candidateKeyContainingSchemas.push(candidateKeys[0]);
	schemas = distinct(schemas.map(schema => _.sortBy(schema))); // remove duplicates by same values
	schemas = reduceSchemas(schemas);
	return [schemas, dependencies];
};

export type rowType = {
	id: string;
	type: "pk"|"fk"|"untouched";
}
export const addIds = (schemas: string[][], dependencies: DependencyRow[]): [rowType[][], DependencyRow[]] => {
	const newDependencies: DependencyRow[] = [];
	const newSchemas: rowType[][] = schemas.map(schema => {
		const newSchema: rowType[] = schema.map(s => ({ id: s, type: "untouched" }));
		for(const dep of dependencies){
			if(!includesAll(schema, dep.leftSide))continue;
			const checkSchema = schema.filter(row => !dep.leftSide.includes(row));
			if(!canReachAttributes(dep.leftSide, checkSchema, dependencies))continue;

			const rowId = nanoid();
			newDependencies.push({
				id: nanoid(),
				leftSide: [rowId],
				rightSide: dep.leftSide,
				isMvd: false
			});
			return [({ id: rowId, type: "pk" }), ...newSchema];
		}
		return newSchema;
	}).map((schema: rowType[]) => { //now replace foreigen candidatekeys with the new primary keys
		const checkSchema = schema.map(row => row.id);
		for(const dep of newDependencies){
			if(!includesAll(checkSchema, dep.rightSide))continue;
			if(includesAll(checkSchema, dep.leftSide))continue;
			const fks: rowType[] = dep.leftSide.map(fk => ({ id: fk, type: "fk" }));
			schema = [...schema.filter(row => !dep.rightSide.includes(row.id)), ...fks];
		}
		return schema;
	});
	return [newSchemas, newDependencies];
};


