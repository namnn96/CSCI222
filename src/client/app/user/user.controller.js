(function () {
    'use strict';

    var app = angular
        .module('app.user', [])
        
    app.controller('UserController', UserController);
    app.controller('UserDetailController', UserDetailController);

    UserController.$inject = ['$q', 'userservice', 'logger', '$rootScope', '$state', 'routerHelper', '$filter', '$window'];
    /* @ngInject */
    function UserController($q, userservice, logger, $rootScope, $state, routerHelper, $filter, $window) {
        var vm = this;
        var states = routerHelper.getStates();
        
        vm.users = [];
        vm.title = 'User';
        vm.usearch = function() {
        	var promises = [getUsers()];
            return $q.all(promises);
        }
        vm.viewUser = viewUser;
        
        /************************************/
        vm.order = function(predicate) {
            vm.predicate = predicate;
            vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
            vm.users = $filter('orderBy')(vm.users, predicate, vm.reverse);
          };
        /***********************************/
          
        /***********************************/
        vm.firstpage = true;
        vm.lastpage = false;
        vm.next = next;
        vm.last = last;
        /***********************************/
          
        activate();

        function activate() {
        	if ($window.sessionStorage.getItem('login')) {
            	vm.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
            	if (vm.loginUser.type == 0)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 1)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
            	
            	$rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
         		$rootScope.$broadcast("SuccessLogin");
        	}
        	else 
        		$state.get("admin").settings.nav = 3;
        	
        	vm.page = 1;
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
            return userservice.getUsers(vm.uname, vm.page).then(function (data) {
                vm.users = data;
                $window.sessionStorage.setItem('users', JSON.stringify(vm.users));
                return vm.users;
            });
        }
        
        function viewUser(id) {
        	$state.transitionTo('userDetail', {id: id});
        }
        
        function next() {
        	vm.page++;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getUsers();
        }
        
        function last() {
        	vm.page--;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getUsers();
        }
    }
    
    UserDetailController.$inject = ['$q', 'userservice', 'logger', '$window', '$rootScope', '$state'];
    /* @ngInject */
    function UserDetailController($q, userservice, logger, $window, $rootScope, $state, $stateParams) {
        var vm = this;
        vm.title = 'User detail';
        vm.back = back;
        
        activate();

        function activate() {
        	if ($window.sessionStorage.getItem('login')) {
            	vm.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
            	if (vm.loginUser.type == 0)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 1)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
            	
            	$rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
         		$rootScope.$broadcast("SuccessLogin");
        	}
        	else 
        		$state.get("admin").settings.nav = 3;
        	
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
