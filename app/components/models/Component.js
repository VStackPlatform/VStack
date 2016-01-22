/**
 * Component Model
 *
 * Base library for reusable component methods.
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout',
            'app-lib/models/Class',
            'jquery',
            'ko-mapping',
            'lodash'
        ], factory);
    }
}(this, function(ko, Class, $, mapping, _) {

    var Component = Class.extend({
        init: function() {

        },

        /**
         * Converts nodes to html string.
         *
         * @param {array} nodes array of DOM nodes.
         * @returns {string}
         */
        nodesToHtml: function(nodes) {
            var div = $('<div />');
            nodes.forEach(function(value) {
                div.append(value);
            });
            return div[0].innerHTML;
        },

        /**
         * Sets defaults and maps the data.
         *
         * @param params
         * @param map
         * @param defaults
         */
        mapData: function(params, map, defaults) {
            params = _.merge(defaults, params);
            mapping.fromJS(params, map, this);
        },

        /**
         * Adds parameters to child components.
         *
         * @param {string} componentTag The tag of the child component.
         * @param {string} paramName The parameter to add to the child component.
         * @param {string} paramValue The value to add to the child component
         * @param {object} componentInfo The componentInfo object from the parent component.
         * @param {boolean} paramLiteral Whether the paramValue should be a string or an observable of the parent component.
         * @returns {*}
         */
        addParamToSubComponent: function(componentTag, paramName, paramValue, componentInfo, paramLiteral) {

            paramLiteral = paramLiteral || false;

            var nameValue = paramName + ': \'' + paramValue + '\'';
            if (paramLiteral) {
                nameValue = paramName + ':' + paramValue;
            }

            //Add required data to other components.
            componentInfo.templateNodes.forEach(function (value) {

                var element = $(value);
                var subParams = element.attr('params');
                var subComponents;

                // Transform component to include data.
                var componentElement = [componentTag.toUpperCase()].indexOf(value.tagName);
                if (componentElement != -1) {
                    if (!subParams) {
                        element.attr('params', nameValue);
                    } else {
                        if (!subParams.match(new RegExp(paramName + ':'))) {
                            element.attr('params', element.attr('params') + ', ' + nameValue);
                        }
                    }
                } else {
                    subComponents = element.find(componentTag);

                    if (subComponents.length > 0) {
                        $.each(subComponents, function (key, sub) {
                            var subCompParams = $(sub).attr('params');
                            if (!subCompParams) {
                                $(sub).attr('params', nameValue);
                            } else {
                                if (!subCompParams.match(new RegExp(paramName + ':'))) {
                                    $(sub).attr('params', $(sub).attr('params') + ', ' + nameValue);
                                }
                            }
                        }.bind(this));
                    }
                }

            });
            return componentInfo;
        }
    });

    /**
     * Makes validation for component args simple.
     *
     * @param {object} rules The rules that are added to the component.
     * @param {object} params The parameters that were passed through.
     * @param {string} name The name of the component.
     * @returns {boolean} If the validation was successful.
     */
    Component.validate = function(rules, params, name) {
        var validated = true;
        ko.utils.objectForEach(rules, function(type, args) {
            switch (type) {
                case 'required':
                    args.forEach(function(arg) {
                        if (params[arg] === undefined) {
                            console.error(name + ' component requires that parameter "' + arg + '" be defined.');
                            validated = false;
                        }
                    });
                    break;
            }
        });
        return validated;
    };

    return Component;

}));