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
        const expectedSchemasMustHaves = [
            ["Vorname", "Nachname", "E-Mail", "Adresse"],
            ["Artikel", "Preis"],
            ["Rechnungszeitpunkt", "Vorname", "Nachname", "Artikel", "Menge"]
        ]
        expect(deps).toEqual(dependencies);
        expect(schemas).toHaveLength(3);
        expect(schemas[0]).toHaveLength(4);
        expectedSchemasMustHaves[0].forEach(expected => expect(schemas[0]).toContainEqual(expected));
        expect(schemas[1]).toHaveLength(2);
        expectedSchemasMustHaves[1].forEach(expected => expect(schemas[1]).toContainEqual(expected));
        expect(schemas[2]).toHaveLength(5);
        expectedSchemasMustHaves[2].forEach(expected => expect(schemas[2]).toContainEqual(expected));

    });

});

describe("addIds", ()=>{
    it("should replace candidateKeys with ForeignKeys", ()=> {
        const dependencies = [
            "Vorname,Nachname->E-Mail,Adresse",
            "Artikel->Preis",
            "Rechnungszeitpunkt->Vorname,Nachname,Artikel,Menge"
        ].map(l => mockDependency(l));
        let [schemas, deps] = converterUtils.to3NF(dependencies);
        let [newSchemas, newDeps] = converterUtils.addIds(schemas, deps);
        const expectedSchemasMustHaves = [
            ["Vorname", "Nachname", "E-Mail", "Adresse"],
            ["Artikel", "Preis"],
            ["Rechnungszeitpunkt", "Menge"]
        ].map(schema => schema.map(row => ({ id: row, type: "untouched" })));
        expect(newDeps).toHaveLength(3);
        expect(newSchemas).toHaveLength(3);
        expect(newSchemas[0]).toHaveLength(5);
        expectedSchemasMustHaves[0].forEach(expected => expect(newSchemas[0]).toContainEqual(expected));
        expect(newSchemas[1]).toHaveLength(3);
        expectedSchemasMustHaves[1].forEach(expected => expect(newSchemas[1]).toContainEqual(expected));
        expect(newSchemas[2]).toHaveLength(5);
        expectedSchemasMustHaves[2].forEach(expected => expect(newSchemas[2]).toContainEqual(expected));
    });
})
