/**
 * @ngdoc controller
 * @name translate.setsDeleteController
 * @function
 * 
 * @description
 * Controller for delete command on sets context menu
 */
(function () {
    'use strict';

    function deleteController(
        $scope,
        translateSetService,
        treeService,
        localizationService,
        navigationService,
        notificationsService) {

        var vm = this;
        vm.loaded = false;
        vm.id = $scope.currentNode.id;

        vm.performDelete = performDelete;
        vm.cancel = cancel;

        localizationService.localize("translateUpdates_setDelete")
            .then(function (result) {
                vm.deleteMsg = result;
            });


        //////////

        function performDelete() {
            translateSetService.delete(vm.id)
                .then(function (result) {

                    var rootNode = treeService.getTreeRoot($scope.currentNode);
                    treeService.removeNode($scope.currentNode);
                    navigationService.hideMenu();

                    notificationsService.success("deleted", vm.deleteMsg);
                });

        };

        function cancel() {
            navigationService.hideDialog();
        }
    }

    angular.module('umbraco')
        .controller('translate.setDeleteController', deleteController);

})();