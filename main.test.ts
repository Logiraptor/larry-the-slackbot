import {PeopleDatabase, SlackClient, StandupMaster} from "./main";
import sinon = require("sinon");

describe('StandupMaster', () => {
    describe('#chooseAndNotifyStandupRunners', () => {
        it('picks masters based on how frequently they have been picked', () => {
            // const slack: SlackClient = {
            //     postMessage: sinon.spy()
            // };

            const slack: SlackClient = {
                postMessage: sinon.spy(),
                getUserIdByEmail: sinon.spy()
            };

            const people: PeopleDatabase = {
                listPeople: () => [],
                pick: sinon.spy()
            };

            const standupMaster = new StandupMaster(slack, people);

            standupMaster.assignStandup();
        });
    });
});
