import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export interface Person {
    spreadsheetRow: number
    spreadsheetCol: number
    email: string
    pickCount: number
}

export interface PeopleDatabase {
    listPeople(): Person[]
    pick(person: Person): void
}

export interface SlackClient {
    getUserIdByEmail(email: string): string
    postMessage(channel: string, message: string): void
}

export class RealPeopleSource implements PeopleDatabase {
    constructor(private sheet: Sheet) {
    }

    listPeople(): Person[] {
        const lastRow = this.sheet.getLastRow();
        const range = this.sheet.getRange(2, 1, lastRow - 1, 2);
        const values = range.getValues();
        const people: Person[] = [];
        for (let i = 0; i < values.length; i++) {
            const person: Person = {
                spreadsheetRow: i + 2,
                spreadsheetCol: 2,
                email: values[i][0].toString(),
                pickCount: parseInt(values[i][1].toString()),
            };

            people.push(person);
        }

        return people;
    }

    pick(person: Person): void {
        let range = this.sheet.getRange(person.spreadsheetRow, person.spreadsheetCol);
        range.setValue(person.pickCount + 1);
    }
}

export class RealSlackClient implements SlackClient {
    constructor(private token: string) {
    }

    getUserIdByEmail(email: string): string {
        const resp = UrlFetchApp.fetch(`https://slack.com/api/users.lookupByEmail?token=${this.token}&email=${email}`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        Logger.log(resp.getResponseCode());
        Logger.log(resp.getContentText());
        return JSON.parse(resp.getContentText()).user.id;
    }

    postMessage(channel: string, text: string): void {
        const resp = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
            payload: JSON.stringify({
                channel, text,
            }),
        });
    }
}

export class StandupMaster {
    constructor(private slack: SlackClient, private people: PeopleDatabase) {
    }

    assignStandup() {
        const people = this.people.listPeople();
        const masters = weightedChoice(2, people, person => 1 / person.pickCount);
        const masterIds = masters.map(master => this.slack.getUserIdByEmail(master.email));
        const userNameList = masterIds.map(id => `<@${id}>`).join(" and ");
        this.slack.postMessage('C0A2QNDEX', `Hey ${userNameList}, you're scheduled to run standup this week!`);
        masters.forEach(master => {
            this.people.pick(master)
        });
    }
}

function shuffle<T>(array: T[]) {
    let copy = [];
    let n = array.length;
    let i;

    // While there remain elements to shuffle…
    while (n) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * array.length);

        // If not already shuffled, move it to the new array.
        if (i in array) {
            copy.push(array[i]);
            delete array[i];
            n--;
        }
    }

    return copy;
}

// weightedChoice selects a random element from *elements*
// with probability defined by the passed weightFunc
function weightedChoice<T>(numElements: number, elements: T[], weightFunc: (element: T) => number) {
    elements = shuffle(elements);

    const weights: number[] = [];
    for (let i = 0; i < elements.length; i++) {
        let weight = weightFunc(elements[i]);
        weights.push(weight);
    }

    const results: T[] = [];
    resultLoop: while (results.length < numElements) {

        let sum = 0;
        for (let i = 0; i < weights.length; i++) {
            sum += weights[i]
        }

        const selection = Math.random() * sum;
        let cumulativeWeight = 0;
        for (let i = 0; i < weights.length; i++) {
            cumulativeWeight += weights[i];
            if (cumulativeWeight >= selection) {
                results.push(elements[i]);
                elements.splice(i, 1);
                weights.splice(i, 1);
                continue resultLoop;
            }
        }
        break;
    }

    return results;
}

function assignStandup() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
        Logger.log('No active spreadsheet');
        throw new Error("No active spreadsheet");
    }
    const people = spreadsheet.getSheetByName('People');
    const peopleSource = new RealPeopleSource(people);
    let slackToken = PropertiesService.getScriptProperties().getProperty('slack-token');
    if (!slackToken) {
        Logger.log('No slack token defined');
        throw new Error("No slack token defined");
    }
    const client = new RealSlackClient(slackToken);
    const master = new StandupMaster(client, peopleSource);
    master.assignStandup();
}
