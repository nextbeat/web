export class NotLoggedInError extends Error {
    constructor (message = "User is not logged in.") {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class EddyError extends Error {
    constructor (message?: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class TimeoutError extends Error {
    constructor (message?: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

