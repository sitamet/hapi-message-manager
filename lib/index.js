'use strict';

let lodash = require('lodash');

/**
 * Helps management of messages with key structure based on 'dom.obj.act.det'
 * dom: domain.
 * obj: object message carries.
 * act: action: event, error, cmd command.
 * det: action detail.
 */

function MessageManager(broker, options) {

    let publication = options && options.publication || 'dom.obj.act.det';

    function Routing(message, messageContent = {}) {

        let me = this;

        let content = lodash.cloneDeep(messageContent);
        delete content.result;
        delete content.error;


        let routingKeyArray = message.fields.routingKey.split('.'),
            key = message.fields.routingKey,
            dom = routingKeyArray[0],
            obj = routingKeyArray[1],
            act = routingKeyArray[2],
            det = routingKeyArray[3];

        function setActDet(actDet) {
            let actDetArray = actDet.split('.');

            act = actDetArray[0];
            det = actDetArray[1];
            key = dom + '.' + obj + '.' + act + '.' + det;
        }


        function setDet(newDet) {
            det = newDet;
            key = dom + '.' + obj + '.' + act + '.' + det;
        }

        return {

            key: () => key,

            keyDom: () => dom,

            keyAct: () => act,

            keyDet: () => det,

            keyObjAct: () => obj + '.' + act,

            keyActDet: () => act + '.' + det,

            keyBare: () => obj + '.' + act + '.' + det,

            keyToDone: () => dom + '.' + obj + '.event.' + det + '-done',

            keyToError: () => dom + '.' + obj + '.error.' + det,

            setDet: function (det) {
                setDet(det);
                return this;
            },

            forward: function (actDet) {
                setActDet(actDet);
                return this;
            },

            setContent: function (theNewContent) {
                if (theNewContent) content = theNewContent;
                return this;
            },

            /**
             * Generic answer to a message cmd
             * @param err
             * @param [result] Object
             */
            reply: async function (err, result) {

                let key = this.keyToDone();

                if (result) {
                    content.result = result;
                }

                if (err) {
                    content.error = err.message;
                    key = this.keyToError();
                }

                await me.publish(content, key);
            },

        }
    }

    async function publish(content, key) {

        content.ocurredOn = new Date();

        let published = await broker.publishAsync(publication, content, key);
        published.on('error', console.error);
    }

    async function subscribeThisProcessor(processMessage, subscriptionKey) {

        await broker.subscribeAsync(subscriptionKey)
            .on('message', processMessage)
            .on('error', console.error)
            .on('redeliveries_exceeded', processRedeliveriesExceeded);
    }

    function processRedeliveriesExceeded(err, message, ackOrNack) {

        let routingKey = Routing(message).keyToError();

        ackOrNack(err, {
            strategy: 'forward',
            publication,
            options: { routingKey }
        });
    }


    return {
        Routing,
        publish,
        subscribeThisProcessor
    }
}

module.exports = MessageManager;
