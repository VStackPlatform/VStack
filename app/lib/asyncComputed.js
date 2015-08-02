define(['knockout'], function(ko) {
    return function (evaluator, owner) {
        var result = ko.observableArray();

        ko.computed(function() {
            // Get the $.Deferred value, and then set up a callback so that when it's done,
            // the output is transferred onto our "result" observable
            evaluator.call(owner).done(result);
        });

        return result;
    }
});