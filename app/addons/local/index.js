define([
    'plugins/router',
    'knockout',
    'jquery',
    'lib/virtualBox',
    'ko-postbox',
    'lib/environment',
    'lib/models/Addon'
],
function(router, ko, $, vb, postbox, env, Addon) {

    try {
        var Local = Addon.extend({
            init: function () {
                this._super('local');
                this.enableLiveUpdates();

                this.target = ko.computed({
                    read: function () {
                        return this.project().settings().target();
                    },
                    write: function (val) {
                        this.project().settings().target(val);
                    }
                }, this);

                this.addForwardPort = function () {
                    this.data().options.forward_ports.push({host: '', vm: ''});
                }.bind(this);
                this.removeForwardPort = function (model) {
                    this.data().options.forward_ports.remove(model);
                }.bind(this);
                this.addSyncedFolder = function () {
                    this.data().options.synced_folders.push({
                        from: '',
                        to: '',
                        type: "default",
                        owner: 'www-data',
                        group: 'www-data'
                    });
                }.bind(this);
                this.removeSyncedFolder = function (model) {
                    this.data().options.synced_folders.remove(model);
                }.bind(this);

            },
            isWindows: ko.observable(env.isWindows)
        });

        return new Local();
    } catch (e) {
        console.error(e.stack);
        return {};
    }

});
