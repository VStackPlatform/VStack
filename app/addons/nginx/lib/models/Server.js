define([
    'ko-mapping',
    'addons/nginx/lib/models/Location',
    'knockout',
    'addons/nginx/lib/models/Directive'
],
function(mapping, Location, ko, Directive) {
    var Server = function(data) {

        var jsonMap = {
            locations: {
                "create": function (model) {
                    return new Location(model.data);
                }
            }
        };

        mapping.fromJS({
            server_name: 'localdev',
            listen: '80',
            directives: [],
            locations: [
                {
                    path: '/var/www',
                    directives: []
                }
            ]
        }, jsonMap, this);
        mapping.fromJS(data, jsonMap, this);

        /**
         * Adds a directive for a server.
         *
         */
        this.addDirective = function() {
            this.directives.push(new Directive());
        }.bind(this);

        /**
         * Removes a directive for a server.
         *
         * @param model the directive to remove.
         */
        this.removeDirective = function(model) {
            this.directives.remove(model);
        }.bind(this);

        /**
         * Adds a location for a server.
         *
         */
        this.addLocation = function() {
            this.locations.push(new Location());
        }.bind(this);

        /**
         * Removes a location for a server.
         *
         * @param model the directory to remove.
         */
        this.removeLocation = function(model) {
            this.locations.remove(model);
        }.bind(this);
    };

    return Server;
});
