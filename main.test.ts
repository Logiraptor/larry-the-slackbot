import {PeopleDatabase, SlackClient, StandupMaster} from "./main";
import sinon = require("sinon");
import { expect } from "chai";

describe('StandupMaster', () => {
    specify('assignStandup', () => {
        const postMessage = sinon.spy();
        const pick = sinon.spy();

        const slack: SlackClient = {
            postMessage,
            getUserIdByEmail: sinon.spy()
        };

        const people: PeopleDatabase = {
            pick,
            listPeople: () => [],
        };

        const standupMaster = new StandupMaster(slack, people);

        standupMaster.assignStandup();

        expect(postMessage.calledOnce).to.be.true;
        expect(pick.notCalled).to.be.true;
    });
});
