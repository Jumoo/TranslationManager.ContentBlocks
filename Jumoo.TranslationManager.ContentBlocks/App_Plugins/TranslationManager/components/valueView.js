(function () {

    var valueViewComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/TranslationManager/components/valueView.html',
        bindings: {
            value: '=',
            editable: '<',
            isTarget: '<',
            isTop: '<',
            parentProperty: '<',
            onSave: '&',
            onRemove: '&'
        },
        controllerAs: 'vm',
        controller: valueViewController
    };

    function valueViewController($scope) {
        var vm = this;
        vm.edit = false;

        vm.hasChildren = hasChildren;
        vm.toggleEdit = toggleEdit;
        vm.saveProperty = saveProperty;
        vm.removeProperty = removeProperty;

        vm.$onInit = function () {
        };

        //////////


        function hasChildren(value) {
            return value.InnerValues !== null
                && !angular.equals(value.InnerValues, {});
        }

        function toggleEdit() {
            vm.edit = !vm.edit;
        }

        function saveProperty() {
            vm.edit = false;
            if (vm.onSave) {
                vm.onSave(vm.parentProperty);
            }
        }

        function removeProperty() {
            if (vm.onRemove) {
                vm.onRemove(vm.parentProperty);
            }
        }
    }

    angular.module('umbraco')
        .component('translateValueView', valueViewComponent);

})();