'use strict';

let MessageManager = require('../lib/index');
let broker = require('./mocks/fakeBroker');

describe("message-manager", () => {

    let messageManager = MessageManager(broker);

    it("give us the routingManager Class when calling Routing", done => {

        let amqpMessage = { fields: { routingKey: 'dom.obj.act.det' } };

        let routingManager = messageManager.Routing(amqpMessage);

        expect(routingManager.key()).toBe('dom.obj.act.det');
        expect(routingManager.keyBare()).toBe('obj.act.det');
        expect(routingManager.keyObjAct()).toBe('obj.act');
        expect(routingManager.keyActDet()).toBe('act.det');
        expect(routingManager.keyAct()).toBe('act');
        expect(routingManager.keyDom()).toBe('dom');
        expect(routingManager.keyDet()).toBe('det');
        expect(routingManager.keyToDone()).toBe('dom.obj.event.det-done');
        expect(routingManager.keyToError()).toBe('dom.obj.error.det');

        done();
    });

    it("sets a new det when setDet", done => {

        let amqpMessage = { fields: { routingKey: 'dom.obj.act.det' } };
        let routingManager = messageManager.Routing(amqpMessage);

        expect(routingManager.setDet('newActionDetail').key()).toBe('dom.obj.act.newActionDetail');

        done();
    });

    beforeEach(done => {
        spyOn(broker, 'publish').and.callThrough();
        done();
    });

    describe('the Routing.reply', () => {

        it("give us a standar reply to an error when calling Routing.reply", done => {

            let amqpMessage = { fields: { routingKey: 'dev.obj.cmd.test-reply' } },
                content = { obj: 'my object' },
                routingManager = messageManager.Routing(amqpMessage, content);


            routingManager.reply(new Error('the error'), 'result with error', () => {

                expect(broker.publish).toHaveBeenCalled();
                expect(broker.publish.calls.mostRecent().args[2]).toBe('dev.obj.error.test-reply');
                expect(broker.publish.calls.mostRecent().args[1].error).toBe('the error');
                expect(broker.publish.calls.mostRecent().args[1].result).toBe('result with error');

                done();

            });
        });


        it("give us a standar reply to a successful cmd when calling Routing.reply", done => {

            let amqpMessage = { fields: { routingKey: 'dev.obj.cmd.test-reply' } },
                content = { obj: 'my object' },
                routingManager = messageManager.Routing(amqpMessage, content);

            routingManager.reply(null, 'successful result', () => {

                expect(broker.publish).toHaveBeenCalled();
                expect(broker.publish.calls.mostRecent().args[2]).toBe('dev.obj.event.test-reply-done');
                expect(broker.publish.calls.mostRecent().args[1].result).toBe('successful result');

                done();

            });
        });


        it("give us a standar reply to a successful cmd with new content when calling Routing.setContent", done => {

            let amqpMessage = { fields: { routingKey: 'dev.obj.cmd.test-reply' } },
                content = { obj: 'original content' },
                routingManager = messageManager.Routing(amqpMessage, content);

            routingManager.setContent({ obj: 'new content' }).reply(null, null, () => {

                expect(broker.publish.calls.mostRecent().args[1].result).toBeUndefined();
                expect(broker.publish.calls.mostRecent().args[1].obj).toBe('new content');

                done();

            });
        });
    });


    it("publishes a message when calling publish", done => {

        messageManager.publish({ foo: 'bar' }, 'dev.foo.event.bar', () => {

            expect(broker.publish).toHaveBeenCalled();
            expect(broker.publish.calls.mostRecent().args[2]).toBe('dev.foo.event.bar');
            expect(broker.publish.calls.mostRecent().args[1].foo).toBe('bar');
            expect(broker.publish.calls.mostRecent().args[1].ocurredOn).toBeDefined();

            done();

        });

    });

    /*
     it("acks with a forward when calling processRedeliveriesExceeded", done => {

     let amqpMessage = { fields: { routingKey: 'dom.obj.act.det' } };

     messageManager.processRedeliveriesExceeded('the error', amqpMessage, (err, ackObject) => {

     expect(err).toBe('the error');
     expect(ackObject).toEqual(jasmine.objectContaining({
     strategy: 'forward',
     publication: 'dom.obj.act.det',
     options: { routingKey: 'dom.obj.error.det' }
     }));

     done();
     });
     });
     */

});
