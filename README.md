# Hapi amqp message manager

A service wrapper for message digest of keys based on the structure 'dom.obj.act.det'

 * dom: domain.
 * obj: object message carries.
 * act: action: event, error, cmd command.
 * det: action detail.

this service exposes:

- `Routing`: a class that helps you to manage a message.
- `subscribeThisProcessor: a method used to link a message digest to a subscription.

**IMPORTANT**: this module is in design stage.


## Dependencies

`hapi-message-manager` depends on hapi-rascal (the amqp rascal plugin for hapijs).


## Install

```sh
npm install hapi-message-manager --save
```

## Usage

Register this module after hapi-rascal:

```
{ register: require('hapi-rascal'), options: config.rascal },
{ register: require('hapi-message-manager') },
...
```

Subscribe `processMessage` to our named subscription `entity-product.tasks`:

```javascript
function processMessage(message, content, ackOrNack) {
    // message digest
}


server.plugins.message.manager.subscribeThisProcessor(processMessage, 'entity-product.tasks');
```

Route a message with the help of `Routing`:


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


