'use strict';

module.exports = {

    // lets build a fake rascal publish:
    publish: (publisher, message, event, callback) => {

        let publication = {
            on: function(event, callback) {
                if (event === 'success') {
                    callback();
                }
                return this;
            }
        };

        callback(null, publication);
    }

};
