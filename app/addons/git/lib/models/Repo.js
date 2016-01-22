define(function(require) {

    var ko = require('knockout');
    var mapping = require('ko-mapping');

    var Repo = function(data) {
        data = data || {};
        data.remote = data.remote || '';
        data.path = data.path || '';
        mapping.fromJS(data, {}, this);
    };

    return Repo;
});