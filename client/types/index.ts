import { Map, List } from 'immutable'
import * as React from 'react'
import { Store as ReduxStore, Dispatch as ReduxDispatch } from 'react-redux'
import { RouteComponentProps } from 'react-router'

import { Action } from '@actions/types'

export type State = Map<string, any>
export type Reducer<S> = (state: S, action: Action) => S
export type Store = ReduxStore<State>
export type Dispatch = ReduxDispatch<State>

export interface DispatchProps {
    dispatch: Dispatch
}
export type RouteProps<P> = RouteComponentProps<P, P>

interface Type<T> {
    new (...args: any[]): T;
}

export function staticImplements<T>() {
    return (constructor: T) => {}
}

export interface ServerRenderingComponent extends Type<React.Component> {
    fetchData: (store: Store, params: object) => void
}