define(function(requirejs) {

    var ko = requirejs('knockout');
    var mapping = requirejs('ko-mapping');

    return function (data) {

        mapping.fromJS({
            username: '',
            host: 'localhost',
            password: ''
        }, {}, this);

        mapping.fromJS(data, {}, this);

        this.username.extend({
            required: true
        });

        this.password.extend({
            required: true
        });

        this.passVisible = ko.observable(false);

        this.passText = ko.pureComputed(function() {
            return this.passVisible() ? 'Hide' : 'Show';
        }, this);

        this.passType = ko.pureComputed(function() {
            return this.passVisible() ? 'text' : 'password';
        }, this);

        this.togglePassVisible = function(model, event) {
            this.passVisible(!this.passVisible());
        }.bind(this);

        /**
         * The conversion back to json.
         */
        this.toJSON = function() {
            var copy = mapping.toJS(this);
            delete copy.passVisible;
            delete copy.passText;
            delete copy.passType;
            return copy;
        };

    };
});