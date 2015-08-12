define(['knockout', 'ko-mapping'], function(ko, mapping) {

    var Directive = function(data) {

        mapping.fromJS({
            directive: [],
            value: ''
        }, {}, this);

        if ($.isArray(data)) {
            data.forEach(function () {
                var matches = options.data.match(/([a-z0-9_]+) (.*)/i);
                this.directive.push(matches[1]);
                this.value(matches[2]);
            }.bind(this));
        }

        this.toJSON = function() {
            var copy = mapping.toJS(this);
            return copy.directive[0] + " " + copy.value;
        }

    };

    return Directive;
});
