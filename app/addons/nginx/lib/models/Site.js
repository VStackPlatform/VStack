define([
    'knockout',
    'ko-mapping',
    'addons/nginx/lib/models/Server',
    'addons/nginx/lib/models/Stream'
], function(ko, mapping, Server, Stream) {

    var Site = function(data) {

        mapping.fromJS(data, {
            'upstreams': {
                "create": function (model) {
                    return new Stream(model.data);
                }
            },
            'servers': {
                "create": function (model) {
                    return new Server(model.data);
                }
            }
        }, this);

        /**
         * Add a new server.
         */
        this.addServer = function() {
            this.servers.push(new Server());
        }.bind(this);

        /**
         * Remove a server.
         *
         * @param model The server to remove.
         */
        this.removeServer = function(model) {
            this.servers.remove(model);
        }.bind(this);

        /**
         * Adds a stream.
         *
         */
        this.addStream = function() {
            this.upstreams.push(new Stream());
        }.bind(this);

        /**
         * Remove a stream.
         *
         * @param model The stream to remove.
         */
        this.removeStream = function(model) {
            this.upstreams.remove(model);
        }.bind(this);

    };
    return Site;
});