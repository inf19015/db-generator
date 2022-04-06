import * as converterUtils from '../converterUtils';
import { DataRow, DependencyRow } from "~store/generator/generator.reducer";
import { nanoid } from "nanoid";
import * as _ from "lodash";


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
    let rightSide = sides[sides.length-1].split(",");
    let isMvd = sides.length === 3;
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
    const makeExpected = (s: Array<string>) => s.map(it => it.split(","));
    it("should be B,E", () => {
        const rowIds = "A,B,C,D,E".split(",");
        const dependencies = [
            "A,B->C",
            "B->D,A",
            "D->A,C",
            "B->C",
            "C->->A" //mvd
        ].map(l => mockDependency(l));
        const expected = makeExpected(["B,E"]);
        expect(converterUtils.getKeyCandidates(rowIds, dependencies)).toEqual(expected);
    });
    it("should be A", () => {
        const rowIds = "A,B,C,D,E".split(",");
        const dependencies = [
            "A,B->C",
            "A->B",
            "A->E,D",
            "B->E,D"
        ].map(l => mockDependency(l));
        const expected = makeExpected(["A"]);
        expect(converterUtils.getKeyCandidates(rowIds, dependencies)).toEqual(expected);
    });
    it("should be B and C and D", () => {
        const rowIds = "A,B,C,D,E".split(",");
        const dependencies = [
            "A,B->C",
            "B->D,A",
            "D->A,C",
            "B->C",
            "C->->A",
            "C->E",
            "C->B"
        ].map(l => mockDependency(l));
        const expected = makeExpected(["B", "C", "D"]);
        expect(converterUtils.getKeyCandidates(rowIds, dependencies)).toEqual(expected);
    });
});

describe("canonicalCover()", () => {
    const makeComparable = (fds: Array<DependencyRow>) => fds.map(({leftSide, rightSide}) => ({leftSide, rightSide}));
   it("should be A->B, B->D, D->A", () => {
       const rowIds = "A,B,C,D,E".split(",");
       const dependencies = [
           "A,B->C",
           "B->D,A",
           "D->A,C",
           "B->C"
       ].map(l => mockDependency(l));
       const expected = [
           "A->C",
           "B->D",
           "D->A"
       ].map(l => mockDependency(l));
       const canonicalCover = converterUtils.getCanonicalCover(dependencies)
       expect(makeComparable(canonicalCover)).toEqual(makeComparable(expected));
   });
    it("should be A->C,B->D,D->A,E->C", () => {
        const rowIds = "A,B,C,D,E".split(",");
        const dependencies = [
            "A,B->C",
            "B->D,A",
            "D->A,C",
            "B,E->C"
        ].map(l => mockDependency(l));
        const expected = [
            "A->C",
            "E->C",
            "B->D",
            "D->A",
        ].map(l => mockDependency(l));
        const canonicalCover = converterUtils.getCanonicalCover(dependencies)
        expect(makeComparable(canonicalCover)).toEqual(makeComparable(expected));
    });
});

describe("to3NF", () => {
    // const attributes = [
    //     "Vorname",
    //     "Nachname",
    //     "E-Mail",
    //     "Adresse",
    //     "Artikel",
    //     "Menge",
    //     "Preis",
    //     "Rechnungszeitpunkt"
    // ]'
    it("should do something", ()=> {
        const dependencies = [
            "Vorname,Nachname->E-Mail,Adresse",
            "Artikel->Preis",
            "Rechnungszeitpunkt->Vorname,Nachname,Artikel,Menge"
        ].map(l => mockDependency(l));
        const [schemas, deps] = converterUtils.to3NF(dependencies);
        console.log(schemas);
        console.log(deps);
    });
    it("should do something 2", ()=> {
        const dependencies = [
            "Vorname,Nachname->E-Mail,Adresse",
            "Artikel->Preis",
            "Rechnungszeitpunkt->Vorname,Nachname,Artikel,Menge"
        ].map(l => mockDependency(l));
        const [schemas, deps] = converterUtils.to3NF(dependencies, true);
        console.log(schemas);
        console.log(deps);
    });
});

describe("äppes", () => {
    const p = ["A", "B", "C"].map(it => [it]);
    const q = ["A", "C", "B"].map(it => [it]);
   console.log(_.isEqual(p,q))
});