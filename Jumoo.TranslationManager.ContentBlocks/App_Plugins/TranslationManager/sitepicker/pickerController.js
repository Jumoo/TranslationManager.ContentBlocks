/**
 * @ngdoc 
 * 
 * 
 */
(function () {
    'use strict';

    function pickerController($scope, editorService,
        entityResource, translateCultureService) {
        var vm = this;

        vm.loaded = false;

        vm.multi = $scope.model.config.multiPicker;

        vm.value = $scope.model.value;
        vm.nodes = [];

        vm.getTargetLanguage = getTargetLanguage;
        vm.remove = remove;

        vm.open = open;


        getNodes();

        ///////////////////////////////
        function open() {
            var options = {
                title: 'Site / Lanaugage Picker',
                view: Umbraco.Sys.ServerVariables.translationManager.plugin + 'sitepicker/sitepickerDialog.html',
                size: 'small',
                submit: function (site) {
                    editorService.close();

                    if (site !== undefined) {

                        site.Id = site.Id * 1;
                        site.CultureName = site.CultureName;

                        vm.loaded = false;
                        vm.value.push(site);
                        entityResource.getById(site.Id, 'Document')
                            .then(function (content) {
                                if (vm.multi) {
                                    vm.nodes.push(content);
                                }
                                else {
                                    vm.nodes[0] = content;
                                }
                                vm.loaded = true;
                            });
                    }
                },
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        }

        function getNodes() {
            if (vm.value === undefined || vm.value.length === 0) {
                vm.loaded = true;
                return;
            }
            else {
                var nodeIds = vm.value.map(function (v) {
                    return v.Id * 1;
                });

                entityResource.getByIds(nodeIds, 'Document')
                    .then(function (contentArray) {
                        vm.nodes = contentArray;
                        vm.loaded = true;
                    });
            }
        }

        function remove(node) {
            for (let i = 0; i < vm.nodes.length; i++) {
                if (vm.nodes[i].id === node.id && vm.nodes[i].tptargetName === node.tptargetName) {
                    vm.nodes.splice(i, 1);
                    break;
                }
            }

            for (let i = 0; i < $scope.model.value.length; i++) {
                if (vm.value[i].Id === node.id && vm.value[i].CultureName === node.tptargetName) {
                    vm.value.splice(i, 1);
                    break;
                }
            }       
        }

        function getTargetLanguage(node, index) {
            if (node.tptarget === undefined) {
                node.tptarget = "...";

                node.tptargetName = vm.value[index].CultureName;

                translateCultureService.getCultureInfo(node.tptargetName)
                    .then(function (result) {
                        node.tptarget = result.data.DisplayName;
                    });
            }

            return node.tptarget;
        }

    }

    angular.module('umbraco')
        .controller('translateSitePicker.Controller', pickerController);
})();