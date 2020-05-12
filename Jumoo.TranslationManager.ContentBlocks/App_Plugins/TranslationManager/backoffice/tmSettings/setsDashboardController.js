(function () {
    'use strict';
    
    function setsDashboardController($scope, $location, $timeout,
        navigationService,
        translateSetService) {

        var vm = this;
        vm.loading = true;
        vm.viewSet = viewSet;

        translateSetService.list()
            .then(function (result) {
                vm.sets = result.data;
                vm.loading = false;
            });


        $timeout(function () {
            navigationService.syncTree({ tree: "tmSettings", path: ['-1', '100'] });
        });


        function viewSet(id) {
            $location.path('/settings/tmSettings/setEdit/' + id);
        }



    }

    angular.module('umbraco')
        .controller('translate.setsDashboardController', setsDashboardController);
})();