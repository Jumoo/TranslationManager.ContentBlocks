(function () {

    'use strict';

    function jobsController($routeParams, $timeout, navigationService,
        localizationService, notificationsService,
        translateJobService, translateCultureService) {

        var vm = this;
        vm.checkButtonState = 'init';

        vm.page = {
            title: 'Submitted Jobs : ',
            description: 'Jobs that have been submitted for translation'
        };

        vm.cultureId = $routeParams.id;
        vm.statusRange = [1, 9];
        vm.loaded = true;

        vm.checkJobs = checkJobs;

        getCultureInfo(vm.cultureId);

        $timeout(function () {
            navigationService.syncTree({ tree: "submitted", path: ['-1', vm.cultureId] });
        });


        function getCultureInfo(cultureId) {
            translateCultureService.getCultureInfo(cultureId)
                .then(function (result) {
                    vm.page.title += result.data.DisplayName;
                });
        }

        function checkJobs() {

            vm.checkButtonState = 'busy';

            translateJobService.checkAll()
                .then(function (result) {
                    vm.checkButtonState = 'success';
                }, function (error) {
                    vm.checkButtonState = 'error';
                    notificationsService.error('error',
                        'Unable to check jobs ' + error.data.ExceptionMessage);

                });
        }
    }

    angular.module('umbraco')
        .controller('translateJobsSubmittedController', jobsController);

})();