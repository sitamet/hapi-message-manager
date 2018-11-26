'use strict';

module.exports = {

    // lets build a fake rascal publish:
    publishAsync: (publisher, message, event) => new Promise(resolve => {

        let publication = {
            on: function (event, callback) {

                if (event === 'success') {
                    callback();
                }
                return this;
            }
        };

        resolve(publication);
    })
};
