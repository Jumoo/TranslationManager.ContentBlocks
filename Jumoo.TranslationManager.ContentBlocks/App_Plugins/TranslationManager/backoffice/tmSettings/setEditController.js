/**
 * 
 * 
 */

(function () {
    'use strict';


    function setEditController($scope, $routeParams, $q, $timeout,
        localizationService,
        navigationService, 
        notificationsService,
        translateSetService,
        translateProviderService) {

        var vm = this;
        vm.loading = true;
        vm.title = 'create a new translation set';

        vm.page = {
            title: 'Create a new Translation set',
            description: '',
            navigation: [
                {
                    'name': 'Set',
                    'alias': 'set',
                    'icon': 'icon-molecular',
                    'view': Umbraco.Sys.ServerVariables.translationManager.plugin + 'sets/set.html',
                    'active': true
                },
                {
                    'name': 'Notifications',
                    'alias': 'notify',
                    'icon': 'icon-message',
                    'view': Umbraco.Sys.ServerVariables.translationManager.plugin + 'sets/notify.html',
                }/*,
                {
                    'name': 'Permissions',
                    'alias': 'permissions',
                    'icon': 'icon-lock',
                    'view': Umbraco.Sys.ServerVariables.translationManager.plugin + 'sets/permissions.html',
                }*/
            ]
        };


        vm.buttonState = 'init';
        vm.isLoopback = false;
        vm.isValid = false;

        vm.set = {
            Name: '',
            MasterSite: [],
            Sites: []
        };

        vm.notify = {
            Inherit: true,
            NotifyCreator: true,
            pending: '',
            submitted: '',
            received: ''
        };

        vm.setId = -1;

        if ($routeParams.id !== undefined) {
            vm.setId = $routeParams.id * 1;
        }
        if ($scope.model !== undefined) { vm.setId = $scope.model.setId * 1; }

        if (vm.setId !== -1) {
            vm.title = 'Edit translation set';
        }
        else {
            // defaults. 
            vm.set.TranslateNodeName = true;
            vm.set.Properties = '*';
            vm.set.CopyOnCreate = true;
            vm.set.AutoSend = true;
        }

        vm.isVisible = isVisible;
        vm.save = save;
        vm.close = close; 

        if (vm.setId !== '-1' && vm.setId !== -1) {
            loadSettings(vm.setId);
        }
        else {
            initPickers();
            translateProviderService.getProviders()
                .then(function (result) {
                    vm.providers = result.data;
                    vm.loading = false;
                });
        }

        $scope.$watch('vm.set', function (newValue, oldValue) {
            if (newValue !== undefined && !vm.loading) {
                checkSet(newValue);
            }
        }, true);

        $timeout(function () {
            navigationService.syncTree({ tree: "tmSettings", path: ['-1', '100', vm.setId] });
        });


        //////////////
        function checkSet(set) {

            vm.isLoopback = false;
            vm.isValid = true;
            vm.validationMsg = '';

            if (set.Name === undefined || set.Name.length === 0) {
                vm.isValid = false; 
                return;
            }

            let diffrentSets = false;

            if (set.MasterSite !== undefined && set.MasterSite.length === 1) {
                let masterId = set.MasterSite[0].Id * 1;

                if (set.Sites !== undefined && set.Sites.length > 0) {
                    for (var i = 0; i < set.Sites.length; i++) {
                        if ((set.Sites[i].Id * 1) === masterId) {
                            vm.isLoopback = true;

                            if (set.Sites[i].CultureName === set.MasterSite[0].CultureName) {
                                vm.isValid = false;
                                vm.validationMsg = "You can't have the master and target be the same site and language";
                            }
                        }
                        else {
                            diffrentSets = true;
                        }
                    }
                }
                else {
                    vm.isValid = false;
                }
            }
            else {
                // no master
                vm.isValid = false;
            }

            if (vm.isLoopback === true && diffrentSets === true) {
                vm.isValid = false;
                vm.validationMsg = 'mix of circular and non circular sites';
            }
        }

        //////////////

        function loadSettings(id) {

            $q.all([
                translateSetService.get(id)
                    .then(function (result) {
                        vm.set = result.data;
                        vm.set.MasterSite = [{
                            Id: vm.set.MasterId,
                            CultureName: vm.set.Culture.Name
                        }];
                        checkSet(vm.set);
                    }, function (error) {
                        notificationsService.error("Error", "Failed to load set");
                    }),

                translateProviderService.getProviders()
                    .then(function (result) {
                        vm.providers = result.data;
                    })
            ]).then(function () {
                initPickers();
                initNotify();
                vm.loading = false;
            });
        }

        function initPickers() {
            vm.masterPicker = {
                value: vm.set.MasterSite,
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'sitepicker/picker.html',
                validation: {
                    mandatory: true
                },
                config: {
                    multiPicker: false
                }
            };

            vm.sitePicker = {
                value: vm.set.Sites,
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'sitepicker/picker.html',
                validation: {
                    mandatory: false
                },
                config: {
                    multiPicker: true
                }
            };
        }

        function initNotify() {

            translateSetService.getNotifySettings(vm.set.Key)
                .then(function (result) {
                    vm.notify = result.data;
                });
        }

        function saveNotify() {
            translateSetService.saveNotifySettings(vm.notify)
                .then(function (result) {
                    // save notify. console.log(result);
                });
        }

        function isVisible(control) {
            return true;
        }

        function save() {
            vm.buttonState = 'busy';

            translateSetService.saveSettings(vm.setId, vm.set)
                .then(function (result) {
                    vm.buttonState = 'success';
                    $scope.setCreate.$dirty = false;
                    notificationsService.success("Set Saved", "Set saved");
                    if (vm.setId === -1) { 
                        window.location = '#/settings/tmSettings/setEdit/' + result.data;
                    }
                    close();
                }, function (error) {
                    vm.buttonState = "error";
                    notificationsService.error("Save Failed", error.data.ExceptionMessage);
                    });

            saveNotify();
        }

        function close() {
            if ($scope.model !== undefined && $scope.model.close) {
                $scope.model.close();
            }
        }
    }

    angular.module('umbraco')
        .controller('translate.setEditController', setEditController);
})();