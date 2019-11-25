import {expect} from "chai";
import {GetUserIdByEmailResponse, RealSlackClient, SlackUser} from "./main";
import sinon = require("sinon");
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

function makeFakeFetchApp(response: GetUserIdByEmailResponse) {
    const testFetch: typeof UrlFetchApp.fetch = () => ({
        getResponseCode: () => 1,
        getContentText: () => JSON.stringify(response),
    }) as HTTPResponse;

    const testFetchApp = {
        fetchAll: sinon.spy(),
        getRequest: sinon.spy(),
        fetch: testFetch
    };

    return testFetchApp;
}

describe('SlackClient', () => {
    let logger: typeof Logger;
    let testFetchApp: typeof UrlFetchApp;

    beforeEach(() => {
        logger = {
            clear: sinon.spy(),
            getLog: sinon.spy(),
            log: sinon.spy()
        };
    });

    specify('getUserIdByEmail', () => {
        const user = {
            id: 'success'
        } as SlackUser;

        const response = {
            user,
            ok: true,
        };

        testFetchApp = makeFakeFetchApp(response);

        const slack = new RealSlackClient('', testFetchApp, logger);

        expect(slack.getUserIdByEmail('')).to.eq('success');
    });

    specify('getUserIdByEmail - user not found', () => {
        const response = {
            ok: false,
            error: 'users_not_found'
        };

        testFetchApp = makeFakeFetchApp(response);

        const slack = new RealSlackClient('', testFetchApp, logger);

        expect(slack.getUserIdByEmail('')).to.eq('');
    });
});
