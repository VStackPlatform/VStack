define(function(require) {
    var ko = require('knockout');
    var mapping = require('ko-mapping');

    return function (data) {
        data.username = data.username || '';
        mapping.fromJS(data, {}, this);
    };
});