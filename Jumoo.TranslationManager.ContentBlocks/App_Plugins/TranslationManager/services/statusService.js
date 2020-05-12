(function () {

    'use strict';

    function statusService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translationManager.StatusService;

        var service = {
            getStatus : getStatus
        };

        return service; 

        ////////////////////

        function getStatus(id) {
            return $http.get(serviceRoot + "GetStatus/" + id);
        }
    }

    angular.module('umbraco.services')
        .factory('translateStatusService', statusService);
})();