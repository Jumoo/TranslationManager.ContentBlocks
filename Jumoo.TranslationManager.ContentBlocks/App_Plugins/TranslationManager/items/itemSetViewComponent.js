(function () {
    'use strict';

    var itemSetViewComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/items/itemSetView.html',
        bindings: {
            nodeId: '<',
            canEdit: '<'
        },
        controllerAs: 'vm',
        controller: itemSetViewController
    };

    function itemSetViewController($scope,
        translateSetService,
        translateDialogManager) {

        var vm = this;
        vm.loading = true;

        vm.getSetInfo = getSetInfo;
        vm.viewSet = viewSet;

        vm.$onInit = function () {
            vm.getSetInfo(vm.nodeId);
        };

        ////////// 

        function getSetInfo(id) {
            vm.loading = true;

            translateSetService.getByNode(id)
                .then(function (result) {
                    vm.loading = false;
                    vm.sets = result.data;
                });
        }

        function viewSet(setId, $event) {
            if ($event !== undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            translateDialogManager.openSet(setId, function () {
                // refresh
                vm.getSetInfo(vm.nodeId);
            });
        }

    }

    angular.module('umbraco')
        .component('translateItemSetView', itemSetViewComponent);
})();