define(function(require) {

    var ko = require('knockout'),
        mapping = require('ko-mapping');

    var Directory = function(data) {
        data = data || {
            path: '',
            options: [],
            allow_override: []
        };
        mapping.fromJS(data, {}, this);
    };

    return Directory;
});