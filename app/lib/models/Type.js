define(['knockout', 'lib/models/Addon', 'lib/vstack'], function(ko, Addon, vstack) {
    var q = require('q');
    var Type = function(data) {
        this.identifier = 'Type';
        this.title = data.name;
        this.addons = ko.observableArray();
        this.dragging = ko.observable(false);
        this.priority = ko.observable(data.priority || 0);

        Addon.findByType(this.title).then(function(addons) {
            this.addons(addons);
        }.bind(this));

        this.reorder = function (event, dragData, zoneData) {
            if (dragData !== zoneData.item && zoneData.item.identifier == dragData.identifier && zoneData.item.type == dragData.type) {
                var zoneDataIndex = zoneData.items.indexOf(zoneData.item);
                zoneData.items.remove(dragData);
                zoneData.items.splice(zoneDataIndex, 0, dragData);
                zoneData.items().forEach(function(item, index) {
                    item.priority(index);
                    item.save();
                });
            }
        };
        this.dragStart = function (item) {
            item.dragging(true);
        };

        this.dragEnd = function (item) {
            item.dragging(false);
        };

        this.save = function() {
            var deferred = q.defer();
            vstack.db.transaction(function (tx) {
                var sql = "UPDATE type SET name=?, priority=? WHERE name=?";
                tx.executeSql(sql, [
                    this.title,
                    this.priority(),
                    this.title
                ], function (tx, results) {
                    deferred.resolve(true);
                }, function(tx, error) {
                    console.error(error);
                    deferred.resolve(false);
                });
            }.bind(this));
            return deferred.promise;
        };
    };

    return Type;
});