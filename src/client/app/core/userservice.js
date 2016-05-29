(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('userservice', userservice);

    userservice.$inject = ['$http', '$q', 'exception', 'logger', 'config'];
    /* @ngInject */
    function userservice($http, $q, exception, logger, config) {
        var service = {
            getUsers: getUsers,
            findUser: findUser,
            getPending: getPending
        };

        return service;

        function getUsers(keyword, page, sortBy) {
            return $http.get(config.host + '/users?page=' + page + '&keyword=' + (keyword ? keyword : '') + "&sortBy=" + (sortBy ? sortBy : ''))
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getUser')(e);
            }
        }
        
        function findUser(id) {
        	return $http.get(config.host + '/users/' + id)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getUser')(e);
            }
        }
        
        function getPending(keyword) {
        	if (keyword == undefined)
        		keyword = "";
        	
        	return $http.get(config.host + '/pending?keyword=' + keyword)
            .then(success)
            .catch(fail);

	        function success(response) {
	            return response.data;
	        }
	
	        function fail(e) {
	            return exception.catcher('XHR Failed for getPending')(e);
	        }
        }
    }
})();
