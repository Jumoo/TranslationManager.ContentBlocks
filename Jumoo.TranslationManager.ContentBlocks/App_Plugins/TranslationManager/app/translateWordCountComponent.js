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

    function translateWordCountController(translateNodeService) {

        var vm = this;
        vm.loading = true;
        vm.counts = {};

        vm.$onInit = function () {
            getWordCountInfo(vm.contentId);
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