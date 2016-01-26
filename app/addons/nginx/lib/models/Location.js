define([
    'knockout',
    'ko-mapping',
    'addons/nginx/lib/models/Directive'
],
function(ko, mapping, Directive) {

    var Location = function(data) {

        mapping.fromJS({
            path: '',
            directives: []
        }, {}, this);
        mapping.fromJS(data, {
            "directives": {
                create: function (options) {
                    return new Directive(options.data);
                }
            }
        }, this);

        /**
         * Adds a directive for a location.
         *
         */
        this.addDirective = function() {
            this.directives.push(new Directive());
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
