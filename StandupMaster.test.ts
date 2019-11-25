import {PeopleSource, Person, SlackClient, StandupMaster} from "./main";
import {expect} from "chai";
import {SinonSpy} from "sinon";
import sinon = require("sinon");

describe('StandupMaster.assignStandup', () => {
    let personB: Person;
    let personA: Person;
    let slack: SlackClient;
    let people: PeopleSource;

    beforeEach(() => {
        personA = {
            spreadsheetRow: 0,
            spreadsheetCol: 0,
            email: 'A',
            pickCount: 0
        };

        personB = {
            spreadsheetRow: 0,
            spreadsheetCol: 0,
            email: 'B',
            pickCount: 0
        };

        slack = {
            postMessage: sinon.spy(),
            getUserIdByEmail: sinon.spy(),
        };

        people = {
            pick: sinon.spy(),
            listPeople: () => [],
            markError: sinon.spy()
        };
    });


    it('posts a message to slack', () => {
        const standupMaster = new StandupMaster(slack, people);
        standupMaster.assignStandup();
        expect((<SinonSpy>slack.postMessage).calledOnce).to.true;
    });

    it('posts message in slack with an @ to selected standed up masters', () => {
        people.listPeople = () => [personA, personB];
        slack.getUserIdByEmail = () => 'user_id';

        const standupMaster = new StandupMaster(slack, people);

        standupMaster.assignStandup();

        expect((<SinonSpy>slack.postMessage).args[0][1]).to.contain('<@user_id> and <@user_id>');
    });

    it('does not @ user when ID not found', () => {
        people.listPeople = () => [personA, personB];
        slack.getUserIdByEmail = (email: string) => {
            if (email === 'A') {
                return 'user_id';
            }
            return '';
        };

        const standupMaster = new StandupMaster(slack, people);

        standupMaster.assignStandup();

        expect((<SinonSpy>slack.postMessage).args[0][1]).to.contain('Hey <@user_id>,');
    });

    it('picks standup masters', () => {
        people.listPeople = () => [personA, personA];
        const standupMaster = new StandupMaster(slack, people);

        standupMaster.assignStandup();

        expect((<SinonSpy>people.pick).callCount).to.eq(2);
    });

    it('marks person when there was an error with their user name', () => {
        people.listPeople = () => [personA, personB];
        slack.getUserIdByEmail = (email: string) => {
            if (email === 'A') {
                return 'user_id';
            }
            return '';
        };

        const standupMaster = new StandupMaster(slack, people);

        standupMaster.assignStandup();

        expect((<SinonSpy>people.pick).calledOnce).to.be.true;
        expect((<SinonSpy>people.markError).calledOnce).to.be.true;
    });
});

