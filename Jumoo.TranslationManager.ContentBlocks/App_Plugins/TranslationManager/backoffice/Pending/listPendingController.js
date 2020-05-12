(function () {
    'use strict';

    function listController(
        $scope,
        $rootScope,
        $routeParams,
        $timeout,
        navigationService,
        editorService,
        translateSetService) {

        var vm = this;

        vm.page = {
            title: 'Pending Items',
            description: 'content items that can be sent for translation'
        };

        vm.cultureName = $routeParams.id;
        vm.status = 0;

        vm.createOptions = {};
        cleanSelection(true);

        vm.refresh = refresh;
        vm.create = create;

        $timeout(function () {
            navigationService.syncTree({ tree: "pending", path: ['-1', vm.cultureName] });
        });


        $scope.$watch("vm.createOptions.items", function (newVal, oldVal) {
            if (newVal !== undefined && newVal.length > 0)
            {
                checkSets(newVal);
            }
            else if (newVal !== oldVal)
            {
                cleanSelection(false);
            }
        });

        /////////////

        function create() {
            editorService.open({
                createOptions: vm.createOptions,
                title: 'Create Job',
                view: Umbraco.Sys.ServerVariables.translationManager.Plugin + 'jobs/createDialog.html',
                size: 'small',
                submit: function () {
                    refresh();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });           
        }

        function refresh() {
            $rootScope.$broadcast('translate-reloaded');
        }

        ////////////

        function cleanSelection(cleanItems) {
            vm.createOptions.set = {};
            vm.createOptions.cultureName = vm.cultureName;

            if (cleanItems) {
                vm.createOptions.items = [];
            }
        }

        function checkSets(items) {
            var sets = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].selected === true) {
                    if (sets.indexOf(items[i].SetKey) < 0) {
                        sets.push(items[i].SetKey);
                    }
                }
            }

            if (sets.length === 1) {
                if (vm.createOptions.set === undefined || vm.createOptions.set.Key !== sets[0]) {
                    loadSet(sets[0]);
                }
            }
            else {
                vm.createOptions.set = undefined;
            }
        }

        function loadSet(key) {
            translateSetService.getByKey(key)
                .then(function (result) {
                    vm.createOptions.set = result.data;
                });
        }
    
    }

    angular.module('umbraco')
        .controller('translateListPendingController', listController);
})();