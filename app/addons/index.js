define(['knockout', 'lib/models/Addon', 'lib/models/Type', 'ko-dragdrop'], function(ko, Addon, Type) {

    var obj = {};
    obj.types = ko.observableArray();
    Addon.findAllTypes().then(function(results) {
        var len = results.rows.length, i, types = [];
        for (i = 0; i < len; i++) {
            var row = results.rows.item(i);
            types.push(new Type({
                name: row.type,
                priority: row.priority
            }));
        }
        obj.types(types);
    });
    obj.reorder = function (event, dragData, zoneData) {
        if (dragData !== zoneData.item && zoneData.item.identifier == dragData.identifier) {
            var zoneDataIndex = zoneData.items.indexOf(zoneData.item);
            zoneData.items.remove(dragData);
            zoneData.items.splice(zoneDataIndex, 0, dragData);
            zoneData.items().forEach(function(item, index) {
                item.priority(index);
                item.save();
            });
        }
    };
    obj.dragStart = function (item) {
        item.dragging(true);
    };

    obj.dragEnd = function (item) {
        item.dragging(false);
    };
    return obj;
});