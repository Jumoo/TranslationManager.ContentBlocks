(function () {
    'use strict';

    function itemViewController($scope,
        $location,
        $routeParams,
        notificationsService,
        editorService,
        translateNodeService,
        localizationService) {

        var vm = this;
        vm.loading = true;

        vm.id = $routeParams.id;
        if ($scope.model !== undefined) { vm.id = $scope.model.nodeId; }

        vm.activeTab = 0;

        vm.canEdit = true;

        vm.page = {
            title: 'Item view',
            description: 'Some item to be viewed'
        };

        vm.saveProperty = saveProperty;
        vm.removeProperty = removeProperty;
        vm.close = close;
        vm.editContent = editContent;

        vm.debugMode = false;
        if ($location.search().tm !== undefined) {
            vm.debugMode = $location.search().tm == 'debug';
        }

        vm.$onInit = function () { loadItem(vm.id); localizeText(); };

        ///// 
        function loadItem(id) {
            vm.loading = true;
            translateNodeService.getNode(id)
                .then(function (result) {
                    vm.item = result.data;
                    vm.page.title = vm.item.MasterNodeName + ' to ' + vm.item.TargetNodeName;
                    vm.page.description = vm.item.Status;

                    vm.canEdit = isEditable(vm.item.Status);

                    vm.loading = false;
                }, function (error) {
                    notificationsService.error('Failed', error.data.ExceptionMessage);
                });
        }

        function isEditable(status) {
            return vm.debugMode || status !== 'Approved' && status !== 'InProgress';
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function editContent(id, culture) {

            if (culture !== undefined) {
                $location.search("cculture", culture);
            }
            else {
                $location.search("cculture", "");
            }

            editorService.contentEditor({
                id: id,
                submit: function (model) {
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                    refresh();
                }
            });
        }

        function localizeText() {

            localizationService.localize("translateUpdates_properties").then(function (value) {
                vm.updatedText = value;
            });

            localizationService.localize("translateUpdates_propertyRemoved").then(function (value) {
                vm.removedText = value;
            });
        }

        function saveProperty(property) {
            translateNodeService.saveProperty(vm.item.Id, property)
                .then(function (result) {
                    notificationsService.success('Updated', vm.updatedText);
                });
        }

        function removeProperty(property) {
            translateNodeService.removeProperty(property.Id)
                .then(function () {
                    notificationsService.success("Removed", vm.removedText);
                    refresh();
                });
        }

        ////////////// Private functions
        function refresh() {
            loadItem(vm.id);
        }
    }

    angular.module('umbraco')
        .controller('translateItemViewController', itemViewController);

})();