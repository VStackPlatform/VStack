define(['lib/models/Class'], function(Class) {

    var Query = Class.extend({
        init: function(database, title, version, size) {
            this.database = database;
            this.title = title || database;
            this.version = version || '1.0';
            this.size = size || 2 * 1024 * 1024;
            this.db = openDatabase(this.database, this.version, this.title, this.size);
        }
    });

    return Query;
});