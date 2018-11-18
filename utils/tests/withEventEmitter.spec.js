const { EventEmitter } = require('events');
const withEventEmitter = require('../withEventEmitter');

describe('utils', () => {
    describe('#withEventEmitter()', () => {
        let TestClass;
        let testClassInstance;

        beforeEach(() => {
            TestClass = class {
                constructor(test1, test2) {
                    this.test1 = test1;
                    this.test2 = test2;
                }
            };
            TestClass = withEventEmitter(TestClass);
            testClassInstance = new TestClass();
        });

        it('should create an instance', () => {
            const instance = new TestClass('test1', 'test2');
            expect(typeof instance.on).toBe('function');
            expect(typeof instance.off).toBe('function');
            expect(typeof instance.emit).toBe('function');
            expect(instance instanceof TestClass).toBe(true);
            expect(instance.eventEmitter instanceof EventEmitter).toBe(true);
            expect(instance.test1).toBe('test1');
            expect(instance.test2).toBe('test2');
        });

        it('should add event listener', () => {
            const handleEvent = jest.fn();
            testClassInstance.on('test', handleEvent);
            const listeners = testClassInstance.eventEmitter.listeners('test').length;
            expect(listeners).toBe(1);
        });

        it('should remove event listener', () => {
            const handleEvent = jest.fn();
            testClassInstance.on('test', handleEvent);
            const listenersBefore = testClassInstance.eventEmitter.listeners('test').length;
            expect(listenersBefore).toBe(1);
            testClassInstance.off('test', handleEvent);
            const listenersAfter = testClassInstance.eventEmitter.listeners('test').length;
            expect(listenersAfter).toBe(0);
        });

        it('should fire event', (done) => {
            testClassInstance.on('test', () => {
                done();
            });
            testClassInstance.emit('test');
        });
    });
});
