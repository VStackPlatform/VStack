define(['knockout', 'ko-mapping'], function(ko, mapping) {
    var Stream = function(data) {

        mapping.fromJS({
            upstream_name: '',
            directives: [
                {
                    directive: ['server'],
                    value: '127.0.0.1:9000'
                }
            ]
        }, {}, this);
        mapping.fromJS(data, {}, this);

        /**
         * Adds a directive for a upstream.
         *
         */
        this.addDirective = function() {
            this.directives.push({
                directive: ko.observableArray([]),
                value: ''
            });
        }.bind(this);

        /**
         * Removes a directive for a upstream.
         *
         * @param model the directive to remove.
         */
        this.removeDirective = function(model) {
            this.directives.remove(model);
        }.bind(this);
    };

    return Stream;
});
