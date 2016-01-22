define(function(require) {

    var ko = require('knockout'),
        mapping = require('ko-mapping');

    var Alias = function(data) {
        data = data || {
            type: 'alias',
            url: '',
            path: ''
        };
        mapping.fromJS(data, {}, this);

        this.options = [
            {"key": "alias", "value": "Alias"},
            {"key": "aliasmatch", "value": "Alias Match"},
            {"key": "scriptaliasmatch", "value": "Script Alias Match"},
            {"key": "scriptalias", "value": "Script Alias"}
        ];
    };

    return Alias;
});