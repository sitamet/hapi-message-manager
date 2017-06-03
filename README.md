# Hapi amqp message manager

A hapi-rascal [https://github.com/sitamet/hapi-rascal](hapi-rascal) driver. A wrapper for event management with keys based on the structure 'dom.obj.act.det'

 * dom: domain where the event occurs or the command is targetted
 * obj: object the message carries.
 * act: action: [event|error|cmd command].
 * det: action detail.

This service driver exposes:

- `publish`: a method used to publish events.
- `Routing`: a class that helps us to manage a message.
- `subscribeThisProcessor`: a method used to link an event message digest to a subscription.

**IMPORTANT**: this module is in design stage.


## Dependencies

`hapi-message-manager` is a driver loaded by hapi-rascal [https://github.com/sitamet/hapi-rascal](hapi-rascal) (the amqp rascal plugin for hapijs).


## Install

```sh
npm install hapi-rascal --save
npm install hapi-message-manager --save
```

### Config

When starting your hapijs server, register this module after hapi-rascal:

```
{ register: require('hapi-rascal'), options: config.rascal },
...
```

where config.rascal config contains the driver options:

```
{
    'defaults': {...},
    'vhosts': {
        'test': {
            'connection': {...},
            'exchanges': {...},
            'publications': {
                'dom.obj.act.det': {...}
            },
            'queues': {...},
            'bindings': [...],
            'subscriptions': {...}
        }
    },
    'drivers': [{
        module: 'hapi-message-manager',
        name: 'events',
        options: {
            publication: 'dom.obj.act.det'
        }
    }]
}
```


## Usage

This message-manager service gets exposed in drivers name under rascal plugin `server.plugins.rascal.events`


### How to link a processMessage digest to a subscription:

To subscribe `processMessage` to our named subscription `entity-product.tasks`:

```javascript
function processMessage(message, content, ackOrNack) {
    // message digest
}

server.plugins.rascal.events.subscribeThisProcessor(processMessage, 'entity-product.tasks');
```

### How to publish a message:

```javascript
server.plugins.rascal.events.publish({ 'foo': 'bar' }, 'test-domain.foo.cmd.update-foo');
```



### How to deal with a message with the help of `Routing`:

```javascript
let routing = server.plugins.rascal.events.Routing(message, content);

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


