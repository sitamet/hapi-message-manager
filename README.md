# Hapi amqp message manager

A service wrapper for message digest of keys based on the structure 'dom.obj.act.det'

 * dom: domain.
 * obj: object message carries.
 * act: action: event, error, cmd command.
 * det: action detail.

This service exposes:

- `Routing`: a class that helps you to manage a message.
- `subscribeThisProcessor`: a method used to link a message digest to a subscription.

**IMPORTANT**: this module is in design stage.


## Dependencies

`hapi-message-manager` depends on hapi-rascal [https://github.com/sitamet/hapi-rascal](hapi-rascal) (the amqp rascal plugin for hapijs).


## Install

```sh
npm install hapi-message-manager --save
```

## Usage

When starting your hapijs server, register this module after hapi-rascal:

```
{ register: require('hapi-rascal'), options: config.rascal },
{ register: require('hapi-message-manager') },
...
```

This message-manager service gets exposed in `server.plugins.message.manager`


### How to link a processMessage digest to a subscription:

To subscribe `processMessage` to our named subscription `entity-product.tasks`:

```javascript
function processMessage(message, content, ackOrNack) {
    // message digest
}

server.plugins.message.manager.subscribeThisProcessor(processMessage, 'entity-product.tasks');
```

### How to deal with a message with the help of `Routing`:

```javascript
let routing = server.plugins.message.manager.Routing(message, content);

// routing provides getters to deal with all key segments based on structure 'dom.obj.act.det'
// i.e for a given key ´domain-one.object-type-a.cmd.do-something´ keyBare give us 'object-type-a.cmd.do-something'
switch (routing.keyBare()) {

    case 'object-type-a.cmd.do-something':
        // once exec the rounting delivers the 'object-type-a.event.do-something-done'
        // and if there is an err the 'object-type-a.error.do-something'
        doSomething(content.objectTypeA.id).exec(routing.reply.bind(routing));
        break;
        
    case 'object-type-b.cmd.update-b':

        // once updateB calls back, routing sets new content if no err 
        // and reply emits a done with key object-type-b.event.update-b-done or
        // object-type-b.errir.update-b if the updateB fails
        updateB(content.objectTypeB, (err, objectTypeB) => {
            routing.setContent(err ? null : { objectTypeB }).reply(err);
        });
        break;
}
```


## Running the tests

```bash
npm test
```


