'use strict';

/**
 * Helps management of messages with key structure based on 'dom.obj.act.det'
 * dom: domain.
 * obj: object message carries.
 * act: action: event, error, cmd command.
 * det: action detail.
 */

function MessageManager(broker, publication) {


    function Routing(message, content) {


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


        function send(err, result, next, getSuccessKey, getErrorKey) {

            let key = getSuccessKey();

            if (result) {
                content.result = result;
            }

            if (err) {
                content.error = err.message;
                key = getErrorKey();
            }

            publish(content, key, next);
        }


        return {

            key: function () {
                return key;
            },

            keyDom: function () {
                return dom;
            },

            keyAct: function () {
                return act;
            },

            keyDet: function () {
                return det;
            },

            keyObjAct: function () {
                return obj + '.' + act;
            },

            keyActDet: function () {
                return act + '.' + det;
            },

            keyBare: function () {
                return obj + '.' + act + '.' + det;
            },

            keyToDone: function () {
                return dom + '.' + obj + '.event.' + det + '-done';
            },

            keyToError: function () {
                return dom + '.' + obj + '.error.' + det;
            },

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
             * @param [next] function(*)
             */
            reply: function (err, result, next) {
                send(err, result, next, this.keyToDone, this.keyToError);
            },

            send: function (err, result, next) {
                send(err, result, next, this.key, this.keyToError);
            }
        }
    }

    function publish(content, key, next) {

        content.ocurredOn = new Date();

        broker.publish(publication, content, key, (err, publication) => publication.on('error', console.error));
        if (next) next();

    }


    function subscribeThisProcessor(processMessage, subscriptionKey) {

        // currently we do not listen to
        broker.subscribe(subscriptionKey, (err, subscription) => {
            subscription.on('message', processMessage).on('error', console.error).on('redeliveries_exceeded', processRedeliveriesExceeded);
        });
    }

    function processRedeliveriesExceeded(err, message, ackOrNack) {

        let routingManager = Routing(message, null);

        ackOrNack(err, {
            strategy: 'forward',
            publication: publication,
            options: { routingKey: routingManager.keyToError() }
        });
    }


    return {
        Routing,
        publish,
        subscribeThisProcessor
    }
}

module.exports = MessageManager;
