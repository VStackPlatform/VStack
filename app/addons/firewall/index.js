define([
    'knockout',
    'app-lib/models/Addon',
    'addons/firewall/lib/models/Rule',
    'bindings/select2',
    'components/c-nav/c-nav'
],
function(ko, Addon, Rule) {

    var Firewall = Addon.extend({
        init: function () {
            this._super('firewall', {
                'rules': {
                    create: function(options) {
                        return new Rule(options.data);
                    }
                }
            });
            this.enableLiveUpdates();
            this.addRule = function() {
                this.rules.push(new Rule());
            };

            this.removeRule = function(model) {
                this.data().options.rules.remove(model);
            }.bind(this);
        }
    });
    return Firewall;
});