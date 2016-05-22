(function () {
    'use strict';

    var app = angular
        .module('app.user', [])
        
    app.controller('UserController', UserController);
    app.controller('UserDetailController', UserDetailController);

    UserController.$inject = ['$q', 'userservice', 'logger', '$state', 'routerHelper', '$filter', '$window'];
    /* @ngInject */
    function UserController($q, userservice, logger, $state, routerHelper, $filter, $window) {
        var vm = this;
        var states = routerHelper.getStates();
        
        vm.users = [];
        vm.title = 'User';
        vm.usearch = function() {
        	var promises = [getUsers()];
            return $q.all(promises);
        }
        vm.viewUser = viewUser;
        vm.resort = resort;
        
        /************************************/
        vm.order = function(predicate) {
            vm.predicate = predicate;
            vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
            vm.users = $filter('orderBy')(vm.users, predicate, vm.reverse);
          };
        /***********************************/
          
        activate();

        function activate() {
        	if ($window.sessionStorage.getItem('users')) {
            	vm.users = JSON.parse($window.sessionStorage.getItem('users'));
            	vm.order('name', true);
            	return logger.info('Activated User View');
        	}
        	
        	var promises = [getUsers()];
            return $q.all(promises).then(function() {
            	vm.order('name', true);
                logger.info('Activated User View');
            });
        }
        
        function getUsers() {
            return userservice.getUsers(vm.uname).then(function (data) {
                vm.users = data;
                console.log(data);
                $window.sessionStorage.setItem('users', JSON.stringify(vm.users));
                return vm.users;
            });
        }
        
        function viewUser(id) {
        	$state.transitionTo('userDetail', {id: id});
        }
        
        function resort() {
        	//$filter('orderBy')(vm.users, 'name', false);
        }
    }
    
    UserDetailController.$inject = ['$q', 'userservice', 'logger', '$window', '$state'];
    /* @ngInject */
    function UserDetailController($q, userservice, logger, $window, $state, $stateParams) {
        var vm = this;
        vm.title = 'User detail';
        vm.back = back;
        
        activate();

        function activate() {
        	var promises = [findUser()];
            return $q.all(promises).then(function() {
                logger.info('Activated User Detail View');
            });
        }
        
        function findUser() {
        	if (vm.userDetail = JSON.parse($window.sessionStorage.getItem('targetUserDetail'))) {
        		console.log($state);
        		$window.sessionStorage.removeItem('targetUserDetail');
        		return vm.userDetail;
        	}
        	
            return userservice.findUser($state.params['id']).then(function (data) {
                vm.userDetail = data;
                return vm.userDetail;
            });
        }
        
        function back() {
        	$state.transitionTo('user');
        }
    }
})();
