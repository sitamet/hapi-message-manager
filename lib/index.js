'use strict';

let MessageManager = require('./message-manager');

exports.register = function (server, config, next) {

    let publication = config.publication? config.publication:'dom.obj.act.det';

    let messageManager = MessageManager(server.plugins.rascal.broker, publication);

    // expose message service at server.plugins.rascal.service
    server.expose('manager', messageManager);

    next();
};


exports.register.attributes = {
    name: 'message',
    pkg: require('../package.json')
};
