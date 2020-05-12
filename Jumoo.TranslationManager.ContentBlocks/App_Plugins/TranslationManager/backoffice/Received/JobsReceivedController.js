(function () {

    'use strict';

    function jobsController($routeParams,
        $timeout, navigationService,
        localizationService,
        notificationsService,
        translateCultureService) {

        var vm = this;

        vm.page = {
            title: 'Received Jobs : ',
            description: 'Jobs that have been returned from translation'
        };

        vm.cultureName = $routeParams.id;
        vm.statusRange = [10, 19];
        vm.loaded = true;

        getCultureInfo(vm.cultureName);

        $timeout(function () {
            navigationService.syncTree({ tree: "received", path: ['-1', vm.cultureName] });
        });


        function getCultureInfo(cultureName) {
            translateCultureService.getCultureInfo(cultureName)
                .then(function (result) {
                    vm.page.title += result.data.DisplayName;
                });

        }
    }

    angular.module('umbraco')
        .controller('translateJobsReceivedController', jobsController);

})();