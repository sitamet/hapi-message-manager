'use strict';

module.exports = {

    // let's build a fake rascal publish:
    publish: (publisher, message, event) => new Promise(resolve => {

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
