/**
  *  @ngdoc service
  *  @name translateCultureService
  *  @function 
  *  
  *  @description
  *    Service for getting culture infomation from umbraco
  */

(function () {

    'use strict';

    function cultureService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translationManager.cultureService;

        var service = {
            getCultureInfo: getCultureInfo,
        };

        return service;
        ///////////////

        /**
         * Gets the culture information based on the culture id
         * @param {int} id umbraco culture id
         * @returns {cultureInfoView} cultureInfoView object based on id
         */
        function getCultureInfo(id) {
            return $http.get(serviceRoot + "GetCultureInfo/" + id);                
        }
    }

    angular.module('umbraco.services')
        .factory('translateCultureService', cultureService);

})();