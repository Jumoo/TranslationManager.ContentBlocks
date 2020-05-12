(function () {
    'use strict';

    function pickerDialog($scope, translateSetService) {
        var vm = this;

        vm.section = 'content';
        vm.treealias = 'content';
        vm.treeParams = '';
        vm.selected = false;

        vm.site = {};
        vm.languages = [];

        // 
        vm.close = close;
        vm.submit = submit;
        vm.toggle = toggle;
        vm.dialogTreeApi = {};

        vm.isValid = isValid;

        vm.onTreeInit = onTreeInit;

        function isValid() {
            if (Object.keys(vm.site).length === 0 || vm.site.CultureName === '') {
                return false;
            }

            return true;
        }

        function submit() {
            if ($scope.model.submit) {
                $scope.model.submit(vm.site);
            }
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function toggle(cultureName) {
            vm.site.CultureName = cultureName;
        }
        
        translateSetService.getInstalledCultures()
            .then(function (result) {
                vm.languages = result.data;
            });

        function onTreeInit() {
            vm.dialogTreeApi.callbacks.treeLoaded(treeLoadedHandler);
            vm.dialogTreeApi.callbacks.treeNodeExpanded(nodeExpandedHandler);
            vm.dialogTreeApi.callbacks.treeNodeSelect(nodeSelectHandler);
        }

        //////////////////
        function treeLoadedHandler(ev, args) {
        }

        function nodeExpandedHandler(ev, args) {
        }

        function nodeSelectHandler(ev, args) {
            ev.event.preventDefault();
            ev.event.stopPropagation();

            // you need this bit for the tick.
            if ($scope.currentNode) {
                //un-select if there's a current one selected
                $scope.currentNode.selected = false;
            }

            $scope.currentNode = ev.node;
            $scope.currentNode.selected = true;
            ///

            var newSiteId = ev.node.id * 1;

            if (vm.site.Id !== newSiteId) {
                vm.site.Id = newSiteId;
                vm.site.CultureName = '';

                translateSetService.getContentInfo(vm.site.Id)
                    .then(function (result) {
                        vm.cultures = result.data;
                        if (vm.cultures.length > 0) {
                            vm.site.CultureName = vm.cultures[0].Name;
                        }
                        vm.selected = true;
                    }, function (error) {

                    });
            }
        }



    }

    angular.module('umbraco')
        .controller('translateSitepickerDialog.Controller', pickerDialog);

})();