/**
  *  @ngdoc service
  *  @name translateSettingsService
  *  @function 
  *  
  *  @description
  *    Settings, saving and getting 
  */

(function () {

    'use strict';

    function settingsService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.translationManager.settingsService;

        var service = {
            getTabs: getTabs,
            getUpdate: getUpdate,
            getSetup: getSetup,

            getSettings: getSettings,
            saveSettings: saveSettings
        };

        return service;

        ///////////////

        function getTabs() {
            return $http.get(serviceRoot + "GetTabs");
        }

        function getUpdate() {
            return $http.get(serviceRoot + "GetUpdate");
        }

        function getSetup() {
            return $http.get(serviceRoot + "GetSetup");
        }

        function getSettings() {
            return $http.get(serviceRoot + "GetSettings");
        }

        function saveSettings(settings) {
            return $http.post(serviceRoot + "SaveSettings", settings);
        }
    }

    angular.module('umbraco.services')
        .factory('translateSettingsService', settingsService);

})();