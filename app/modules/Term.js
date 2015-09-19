define(['knockout', 'ko-postbox', 'jquery', 'jquery-ui', 'bindings/debug'], function(ko, postbox) {

    var Terminal = require('terminal.js');
    var gui = require('nw.gui');
    var count = 100;

    var obj = function (id) {
        this.terminal = new Terminal({
            columns: 200,
            rows: count
        });
        postbox.subscribe('Term.' + id, function (data) {
            if (!this.isOpen()) {
                this.isOpen(true);
            }
            this.terminal.state._createLine();
            this.terminal.write('> ' + data);
        }.bind(this));

        /**
         * Push changes to the terminal.
         */
        this.bindingComplete = function () {
            var output = $('#terminal').find('pre');
            this.terminal.dom(output[0]);
            output.resizable({
                handles: 'n',
                maxHeight: $(window).height() - 100
            });
        };

        this.isOpen = ko.observable(false);

        this.toggle = function () {
            this.isOpen(!this.isOpen());
        };

        this.active = ko.computed(function () {
            return this.isOpen() ? 'active' : '';
        }, this);

        this.clear = function () {
            this.terminal.state.reset();
        }.bind(this);

        this.menuOptions = function (model, event) {
            var menu = new gui.Menu();
            menu.append(new gui.MenuItem({label: 'Clear'}));
            menu.popup(event.pageX, event.pageY);
            menu.items[0].click = function () {
                this.clear();
            }.bind(this);
        }.bind(this);
    };
    return obj;

});