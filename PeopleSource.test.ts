import {Person, RealPeopleSource} from "./main";
import {SinonSpy, SinonStub} from "sinon";
import {expect} from "chai";
import sinon = require("sinon");

describe('PeopleDatabase', () => {
    let person: Person;
    let range: { getValues: SinonSpy, setValue: SinonSpy };
    let getRange: SinonStub;
    let realPeopleSource: RealPeopleSource;

    beforeEach(() => {
        person = {
            email: '',
            pickCount: 0,
            spreadsheetCol: 2,
            spreadsheetRow: 3
        };

        getRange = sinon.stub();
        const getValues = sinon.stub();
        getValues.returns([['a@b.com', 0], ['b@b.com', 1]]);
        range = {
            getValues,
            setValue: sinon.spy()
        };
        getRange.returns(range);

        const sheet = {
            getRange,
            getLastRow: () => 10,
        };

        // @ts-ignore
        realPeopleSource = new RealPeopleSource(sheet as Sheet);
    });

    specify('listPeople', () => {
        const people = realPeopleSource.listPeople();
        expect(people).to.have.length(2);
        expect(people[0].spreadsheetRow).to.eq(2);
        expect(people[0].spreadsheetCol).to.eq(2);
        expect(people[0].email).to.eq('a@b.com');
        expect(people[0].pickCount).to.eq(0);
    });

    specify('listPeople - no initial pick count', () => {
        const getValues = sinon.stub();
        getValues.returns([['a@b.com', null]]);
        range = {
            getValues,
            setValue: sinon.spy()
        };
        getRange.returns(range);

        const sheet = {
            getRange,
            getLastRow: () => 10,
        };

        // @ts-ignore
        realPeopleSource = new RealPeopleSource(sheet as Sheet);

        const people = realPeopleSource.listPeople();

        expect(people[0].pickCount).to.eq(0);
        expect(range.setValue.calledOnce).to.be.true;
    });

    specify('pick', () => {
        realPeopleSource.pick(person);

        expect(getRange.calledWith(person.spreadsheetRow, person.spreadsheetCol)).to.be.true;
        expect(range.setValue.calledWith(person.pickCount + 1)).to.be.true;
    });

    specify('markError', () => {
        realPeopleSource.markError(person);

        expect(getRange.calledWith(person.spreadsheetRow, person.spreadsheetCol + 1)).to.be.true;
        expect(range.setValue.calledWith('Error picking this user')).to.be.true;
    });
});
