import { Map } from 'immutable'
import * as React from 'react'
import { Store as ReduxStore, Dispatch } from 'react-redux'
import { RouteComponentProps } from 'react-router'

import { Action } from '@actions/types'

export type State = Map<string, any>
export type Reducer = (state: State, action: Action) => State
export type Store = ReduxStore<State>
export interface DispatchProps {
    dispatch: Dispatch<State>
}
export type RouteProps<P> = RouteComponentProps<P, P>

interface Type<T> {
    new (...args: any[]): T;
}

export function staticImplements<T>() {
    return (constructor: T) => {}
}

export interface ServerRenderingComponent extends Type<React.Component> {
    fetchData: (store: Store, params: object)
}