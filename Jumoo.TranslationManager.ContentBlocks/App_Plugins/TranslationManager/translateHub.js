(function () {
    'use strict';

    function translateHub($rootScope, $q, assetsService) {

        var scripts = [
            Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/lib/signalr/jquery.signalR.js',
            Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/backoffice/signalr/hubs'];

        return {
            initHub: initHub
        };

        ////////////////

        function initHub(callback) {

            if ($.connection === undefined) {
                var p = [];
                scripts.forEach(function (script) {
                    p.push(assetsService.loadJs(script));
                });

                $q.all(p)
                    .then(function () {
                        setupHub(callback);
                    });
            }
            else {
                setupHub(callback);
            }
        }

        function setupHub(callback) {

            if ($.connection.translationHub === undefined) {
                console.warn('unable to load umbraco signalR hub');
            }
            else {

                var proxy = $.connection.translationHub;

                var hub = {
                    start: function () {
                        $.connection.hub.start();
                    },
                    on: function (event, callback) {
                        proxy.on(event, function (result) {
                            $rootScope.$apply(function () {
                                if (callback) {
                                    callback(result);
                                }
                            });
                        });
                    },
                    invoke: function (method, callback) {
                        proxy.invoke(method)
                            .done(function (result) {
                                $rootScope.$apply(function () {
                                    if (callback) {
                                        callback(result);
                                    }
                                });
                            });
                    }
                };

                return callback(hub);
            }
        }
    }

    angular.module('umbraco.resources')
        .factory('translateHub', translateHub);

})();