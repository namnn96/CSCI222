(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', '$q', 'exception', 'logger', 'config'];
    /* @ngInject */
    function dataservice($http, $q, exception, logger, config) {
        var service = {
            getPeople: getPeople,
            getQuestions: getQuestions,
            findQuestion: findQuestion,
            login: login,
            signup: signup,
            submitEdit: submitEdit
        };

        return service;

        function getPeople() {
            return $http.get('/api/people')
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getPeople')(e);
            }
        }
        
        function getQuestions(keyword) {
            return $http.get(config.host + '/questions?keyword=' + (keyword ? keyword : ''))
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for getQuestions')(e);
            }
        }
        
        function findQuestion(id) {
        	return $http.get(config.host + '/questions/' + id)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for findQuestion')(e);
            }
        }
        
        function login(email, password) {
        	return $http.get(config.host + '/login?email=' + email + '&password=' + password)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
            	return null;
//                return exception.catcher('XHR Failed for login')(e);
            }
        }
        
        function signup(obj) {
        	return $http.post(config.host + '/users', obj)
                .then(success)
                .catch(fail);

            function success(data, status, header, config) {
            	console.log(data);
            	
                return data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for signup')(e);
            }
        }
        
        function submitEdit(obj) {
        	return $http.put(config.host + '/users/' + obj.id, obj)
                .then(success)
                .catch(fail);

            function success(data, status, header, config) {
            	console.log(data);
            	
                return data;
            }

            function fail(e) {
                return exception.catcher('XHR Failed for signup')(e);
            }
        }
    }
})();
