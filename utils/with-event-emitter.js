const { EventEmitter } = require('events');

/**
 * decorates provided class with EventEmitter proxy calls
 * could be used as @withEventEmitter decorator with babel for now
 * @param {class} target class to be decorated with EventEmitter proxy calls
 */
const withEventEmitter = target => (
    class extends target {
        // add event emitter instance to decorated class
        constructor(...args) {
            super(...args);
            this.eventEmitter = new EventEmitter();
        }

        // add proxy call to event emitter emit method
        emit(event, data) {
            this.eventEmitter.emit(event, data);
        }

        // add proxy call to event emitter addListener method
        on(event, listener) {
            this.eventEmitter.on(event, listener);
            return this;
        }

        // add proxy call to event emitter removeListener method
        off(event, listener) {
            this.eventEmitter.removeListener(event, listener);
            return this;
        }
    }
);
module.exports = withEventEmitter;
