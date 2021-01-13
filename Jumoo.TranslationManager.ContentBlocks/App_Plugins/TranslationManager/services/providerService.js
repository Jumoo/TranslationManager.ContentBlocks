/**
  *  @ngdoc service
  *  @name translateProviderService
  *  @function 
  *  
  *  @description
  *    Service for managing providers and their settings
  */

(function () {

    'use strict';

    function providerService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translationManager.providerService;

        var service = {
            getProviders: getProviders,
            getProvider: getProvider,

            getSettings: getSettings,
            saveSettings: saveSettings
        };

        return service;

        ///////////////

        function getProviders() {
            return $http.get(serviceRoot + "GetProviders");
        }

        function getProvider(key) {
            return $http.get(serviceRoot + "GetProvider/" + key);
        }

        function getSettings(key) {
            return $http.get(serviceRoot + "GetSettings/" + key);
        }

        function saveSettings(key, settings) {
            return $http.post(serviceRoot + "SaveSettings/" + key, settings);
        }

    }

    angular.module('umbraco.services')
        .factory('translateProviderService', providerService);

})();