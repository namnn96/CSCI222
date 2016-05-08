(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('userservice', userservice);

    userservice.$inject = ['$http', '$q', 'exception', 'logger', 'config'];
    /* @ngInject */
    function userservice($http, $q, exception, logger, config) {
        var service = {
            getUsers: getUsers
        };

        return service;

        function getUsers(keyword) {
            return $http.get(config.host + '/users?keyword=' + (keyword ? keyword : ''))
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getUser')(e);
            }
        }
    }
})();
