define(['knockout', 'ko-mapping'], function(ko, mapping) {

    var Location = function(data) {

        mapping.fromJS({
            path: '',
            directives: []
        }, {}, this);
        mapping.fromJS(data, {}, this);

        /**
         * Adds a directive for a location.
         *
         */
        this.addDirective = function() {
            this.directives.push({
                directive: ko.observableArray(),
                value: ''
            });
        }.bind(this);

        /**
         * Removes a directive for a location.
         *
         * @param model the directive to remove.
         */
        this.removeDirective = function(model) {
            this.directives.remove(model);
        }.bind(this);
    };

    return Location;
});
