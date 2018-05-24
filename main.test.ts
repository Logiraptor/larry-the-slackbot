import {PeopleSource, SlackClient, StandupMaster} from './main'
import * as sinon from 'sinon'

describe('StandupMaster', () => {
    describe('#chooseAndNotifyStandupRunners', () => {
        it('picks masters based on how frequently they have been picked', () => {
            const slack: SlackClient = {
                postMessage: sinon.spy()
            }
            const people: PeopleSource = {
                listPeople: () => []
            }
            const standupMaster = new StandupMaster(slack, people)
            standupMaster.chooseAndNotifyStandupRunners()
        })
    })
})
