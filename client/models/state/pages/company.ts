import { List, Map } from 'immutable'

import { StateModelFactory } from '@models/state/base'
import { State } from '@types'

interface CompanyProps {
    isSubmittingContactMessage: boolean
    hasSubmittedContactMessage: boolean
    contactMessageError: string
}

const keyMap = {
    'isSubmittingContactMessage': ['contact', 'isSubmitting'],
    'hasSubmittedContactMessage': ['contact', 'hasSubmitted'],
    'contactMessageError': ['contact', 'error']
}

const keyMapPrefix = ['pages', 'company']

export default class Company extends StateModelFactory<CompanyProps>(keyMap, keyMapPrefix) {}