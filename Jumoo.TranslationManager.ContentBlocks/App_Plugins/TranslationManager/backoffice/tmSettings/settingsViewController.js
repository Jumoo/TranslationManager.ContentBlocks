(function () {

    'use strict';

    function settingsController(
        $scope, $timeout,
        navigationService,
        notificationsService,
        translateSettingsService) {

        var vm = this;

        vm.saveSettings = saveSettings;
        vm.isValidLicence = isValidLicence;

        vm.saveButtonState = 'init';

        vm.page = {
            title: 'Translation Manager settings',
            description: '',
            navigation: [
                {
                    'name': 'Settings',
                    'alias': 'settings',
                    'icon': 'icon-settings',
                    'view': Umbraco.Sys.ServerVariables.translationManager.Plugin + 'settings/settings.html',
                    'active': true
                },
                {
                    'name': 'licence',
                    'alias': 'licence',
                    'icon': 'icon-lock',
                    'view': Umbraco.Sys.ServerVariables.translationManager.Plugin + 'settings/licence.html'
                },
                {
                    'name': 'Notifications',
                    'alias': 'notifications',
                    'icon': 'icon-message',
                    'view': Umbraco.Sys.ServerVariables.translationManager.Plugin + 'settings/notifications.html'
                },
                {
                    'name': 'Diagnostics',
                    'alias': 'diagnostics',
                    'icon': 'icon-lab',
                    'view': Umbraco.Sys.ServerVariables.translationManager.Plugin + 'settings/diagnostics.html'
                }
            ]
        };

        init();


        $timeout(function () {
            navigationService.syncTree({ tree: "tmSettings", path: ['-1'] });
        });


        ////////////////////////

        function saveSettings() {
            vm.saveButtonState = 'busy';
            translateSettingsService.saveSettings(vm.settings)
                .then(function (result) {
                    notificationsService.success('Saved', 'Settings saved');
                    vm.saveButtonState = 'success';
                    getSettings();
                }, function (error) {
                    vm.saveButtonState = 'error';
                    notificationsService.error('Error', error.data.ExceptionMessage);
                });
        }

        function isValidLicence() {
            if (vm.settings.Licence.Key !== null && vm.settings.Licence.Key !== '') {
                return vm.settings.Licence.Licenced && vm.settings.Licence.Valid;
            }

            return false;
        }

        ////////////////////////
        function init() {
            getSettings();
        }

        function getSettings() {
            vm.loading = true;
            translateSettingsService.getSettings()
                .then(function (result) {
                    vm.loading = false;
                    vm.settings = result.data;
                }, function (error) {
                    vm.loading = false;
                    notificationsService.error('Error', error.data.ExceptionMessage);
                });
        }
    }

    angular.module('umbraco')
        .controller('translateSettingsViewController', settingsController);

})();