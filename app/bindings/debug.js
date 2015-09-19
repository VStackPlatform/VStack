define(['knockout'], function(ko) {

    ko.bindingHandlers.debug = {
        update: function(element, valueAccessor, allBindingsAccessor) {
            var $el = $(element);
            var data = ko.toJS(valueAccessor());
            var all = allBindingsAccessor();

            switch (all.level) {
                case 'bold':
                    if (typeof data !== 'string') {
                        data = ko.toJSON(data);
                    }
                    console.log('%c' + data, 'background: #222; color: #bada55');
                    break;
                case 'error':
                    console.error(data);
                    break;
                case 'warn':
                    console.warn(data);
                    break;
                default:
                    console.log(data);
                    break;
            }
        }
    };
    ko.virtualElements.allowedBindings.debug = true;
});