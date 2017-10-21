import { StateModelFactory } from '@models/state/base'
import EddyClient from '@eddy'
import { State } from '@types'

interface EddyProps {
    client: EddyClient
    hasLostConnection: boolean
}

const keyMap = {
    'client': ['client'],
    'hasLostConnection': ['hasLostConnection'],
}

const keyMapPrefix = ['eddy']

export default class Eddy extends StateModelFactory<EddyProps>(keyMap, keyMapPrefix) {

    static client(state: State): EddyClient {
        return this.get(state, 'client')
    }

    static isConnected(state: State): boolean {
        return !!this.client(state) && this.client(state).isConnected()
    }

}

