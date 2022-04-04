import * as selectors from '../core/store/generator/generator.selectors';
import { Store } from "~types/general";
import { DataRow, DependencyRow } from "~store/generator/generator.reducer";

const includesAll = (array: any, elements: any) => {
    for (const element of elements) {
        if(!array.includes(element)) return false
    }
    return true;
};
const includesNone = (array: any, elements: any) => {
    for (const element of elements) {
        if(array.includes(element)) return false
    }
    return true;
};

export const canReachAttributes = (startAttributes: Array<String>, attributesToReach: Array<String>, dependencies: Array<DependencyRow>): Boolean => {
    const possibleDependenciesIds = dependencies.filter(dep => includesAll(startAttributes, dep.leftSide)).flatMap(dep => dep.rightSide);
    const reachableAttributes = [...startAttributes];
    possibleDependenciesIds.forEach(id => {
        if(!reachableAttributes.includes(id)) reachableAttributes.push(id)
    });
    if(includesAll(reachableAttributes, attributesToReach)) return true;
    if(reachableAttributes.length === startAttributes.length && includesAll(reachableAttributes, startAttributes)) return false;
    return canReachAttributes(reachableAttributes, attributesToReach, dependencies);
};

// const rowIds = selectors.getSortedRowsOfTable(state, tableId);
// const getFunctionalDependencies = (state:Store) => selectors.getSortedDependencyRowsArray(state).filter(dep => !dep.isMvd);
// const dependencies = getFunctionalDependencies(state);

export const getKeyCandidates = (rowIds: string[], allDependencies: DependencyRow[]): Array<Array<String>> => {
    const dependencies = allDependencies.filter(dep => !dep.isMvd)
    // An attribute is independent when it's not present at any right side of a dependency
    const isIndependent = (rowId: any) =>
        !dependencies.flatMap(dep => dep.rightSide).includes(rowId)
    const independentAttributes =  rowIds.filter(rowId => isIndependent(rowId));
    if(canReachAttributes(independentAttributes, rowIds, dependencies)){
        return [independentAttributes];
    }
    const attributeslisted = rowIds.map(id => [id]);
    let powerAttributes = rowIds.map(id => [id]);
    for (let i=1; i < rowIds.length; i++) {
        let candidates = powerAttributes.filter(at => canReachAttributes(at, rowIds, dependencies));
        if (candidates.length > 0) return candidates;
        let powerAttributesWithPossibleDuplicates = powerAttributes.flatMap(p => attributeslisted.filter(l => includesNone(p, l)).map(it => [...p, ...it]))
            .map(l => l.sort((a, b) => b.localeCompare(a)));
        powerAttributes = [];
        powerAttributesWithPossibleDuplicates.forEach(l => {
            if (powerAttributes.includes(l)) powerAttributes.push(l)
        });
    }
//    error
    return [];
};


