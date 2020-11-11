(function () {
    'use strict';

    var translateWordCountComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/app/translateWordCount.html',
        bindings: {
            contentId: '<'
        },
        controllerAs: 'vm',
        controller: translateWordCountController
    };

    function translateWordCountController(translateNodeService, eventsService, $timeout) {

        var vm = this;
        vm.loading = true;
        vm.counts = {};
        vm.counted = false;

        vm.$onInit = function () {

            eventsService.on("app.tabChange", function (event, args) {
                $timeout(function () {

                    if (args.alias === 'tmContent') {
                        if (!vm.counted) {
                            getWordCountInfo(vm.contentId);
                            vm.counted = true;
                        }
                    }
                });
            });
            
        };

        ///////////
        function getWordCountInfo(contentId) {

            translateNodeService.getWordCountInfo(contentId)
                .then(function (result) {
                    vm.loading = false;
                    vm.counts = result.data;
                });
        }

    }

    angular.module('umbraco')
        .component('translateWordCount', translateWordCountComponent);


})();