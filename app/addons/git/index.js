define(function(require) {

    require('components/c-radio-list/c-radio-list');
    require('components/c-group/c-group');

    var Addon = require('app-lib/models/Addon');
    var Repo = require('addons/git/lib/models/Repo');

    var Git = Addon.extend({
        init: function () {
            this._super('git');
            this.enableLiveUpdates();
            this.versions = ["1.9.1"];
            this.repo = Repo;
        }
    });

    return Git;
});
