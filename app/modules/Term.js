define(['knockout', 'ko-postbox', 'jquery-ui'], function(ko, postbox) {
    var Terminal = require('terminal.js');
    var obj = function(id) {
        this.terminal = new Terminal({
            columns: 200,
            rows: 150
        });
        postbox.subscribe('Term.'+id, function(data) {
            if (!this.isOpen()) {
                this.isOpen(true);
            }
            this.terminal.write('> ' + data);
        }.bind(this));

        /**
         * Push changes to the terminal.
         */
        this.bindingComplete = function() {
            var output = $('#terminal').find('pre');
            this.terminal.dom(output[0]);
            output.resizable({
                handles: 'n',
                maxHeight: $(window).height() - 100
            });
        };

        this.isOpen = ko.observable(false);

        this.toggle = function() {
            this.isOpen(!this.isOpen());
        };

        this.active = ko.computed(function() {
            return this.isOpen() ? 'active' : '';
        }, this);

        this.menuOptions = function(model, event) {

        };

    };
    return obj;
});