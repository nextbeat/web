/// <reference types="google.analytics" />

declare module 'hoist-non-react-statics';
declare module 'linkifyjs/html';

declare var ga: UniversalAnalytics.ga

interface WebpackRequire {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
}
interface NodeRequire extends WebpackRequire {}
declare var require: NodeRequire;

declare module '*.png'
declare module '*.svg'
declare module '*.md'