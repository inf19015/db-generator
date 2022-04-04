import * as converterUtils from '../converterUtils';
import { DataRow, DependencyRow } from "~store/generator/generator.reducer";
import { nanoid } from "nanoid";


// const startRows = "A,B,C,D,E".split(",").map(l => mockDataRow(l));
const mockDataRow = (line: string): DataRow => ({
            id: line,
            title: line,
            data: null,
            dataType: null,
            titleError: null,
        });

const mockDependency = (s: string): DependencyRow => {
    let sides =  s.split("->");
    let leftSide = sides[0].split(",");
    let rightSide = sides[1].split(",");
    let isMvd = false;
    if(leftSide[0] === "->"){
        leftSide[0] = leftSide[0].replace("->", "");
        isMvd = true;
    }
    return ({
        id: nanoid(),
        leftSide,
        rightSide,
        isMvd
    });
};



describe('canReachAttributes()', () => {
    const dependencies = [
        "A,B->C",
        "B->D,A",
        "D->AC"
    ].map(l => mockDependency(l));
    it("can't reach C from A alone", () => {
        const dependencies = [
        "A,B->C",
        "B->D,A",
        "D->AC"
        ].map(l => mockDependency(l));
        const start = ["A"];
        const reach = ["C"];
        let actual = converterUtils.canReachAttributes(start, reach, dependencies)
        expect(actual).toBeFalsy();
    });
    it("can reach C from A,B together", () => {
        const start = ["A", "B"];
        const reach = ["C"];
        let actual = converterUtils.canReachAttributes(start, reach, dependencies)
        expect(actual).toBeTruthy();
    });
    it("can reach D,A,C from B", () => {
        const start = ["B"];
        const reach = ["C","A", "D"];
        let actual = converterUtils.canReachAttributes(start, reach, dependencies)
        expect(actual).toBeTruthy();
    });
});

describe("getKeyCandidates", () => {
    it("should be B,E", () => {
        const rowIds = "A,B,C,D,E".split(",");
        const dependencies = [
            "A,B->C",
            "B->D,A",
            "D->A,C",
            "B->C",
            "C->->A" //mvd
        ].map(l => mockDependency(l));
        const expected = ["B,E".split(",")];
        expect(converterUtils.getKeyCandidates(rowIds, dependencies)).toEqual(expected);
    });
});