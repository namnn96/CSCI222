(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$q', 'dataservice', 'logger', '$state', '$filter', '$window', '$rootScope'];
    /* @ngInject */
    function DashboardController($q, dataservice, logger, $state, $filter, $window, $rootScope) {
        var vm = this;
        
        vm.today = new Date();
        vm.people = [];
        vm.title = 'Dashboard';
        
        // Handle login - signup - logout
        vm.login = login;
        vm.signup = signup;
        vm.logout = logout;
        
        // Function buttons
        vm.showForm = showForm;
        vm.showEditForm = showEditForm;
        vm.submitEdit = submitEdit;
        vm.cancelEdit = cancelEdit;
        
        // Boolean for ng-if
        vm.showsignin = ($window.sessionStorage.getItem('login') == undefined) ? true : false;
        vm.showsignup = false;
        vm.showCurrentUser = ($window.sessionStorage.getItem('login') == undefined) ? false : true;
        vm.showEdit = false;
        
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
        	
            var promises = [getPeople()];
            return $q.all(promises).then(function() {
                logger.info('Activated Dashboard View');
            });
        }

        function getPeople() {
            return dataservice.getPeople().then(function (data) {
                vm.people = data;
                return vm.people;
            });
        }
        
        function login(email, password) {
        	return dataservice.login(email, password).then(function (data) {
        		if (!data) {
        			logger.error("Invalid email or password!");
        			return;
        		}
        		
        		vm.loginUser = data;
                if (vm.loginUser.type == 0)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 1)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
                
                $window.sessionStorage.setItem('login', JSON.stringify(vm.loginUser));
                
                $rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
        		$rootScope.$broadcast("SuccessLogin");
        		
                vm.showsignin = false;
                vm.showCurrentUser = true;
            });
        }
        
        function signup() {
        	return dataservice.signup(vm.newuser).then(function (data) {
        		vm.showsignin = true;
        		vm.showsignup = false;
        	});
        }
        
        function showForm() {
        	vm.showsignin = vm.showsignin == false ? true : false;
        	vm.showsignup = vm.showsignup == false ? true : false;
        }
        
        function logout() {
        	$window.sessionStorage.clear();
        	
        	$rootScope.userType = null;
        	$rootScope.loginUser = null;
        	$rootScope.$broadcast("SuccessLogout");
        	
        	vm.showCurrentUser = false;
        	vm.showsignin = true;
        }
        
        function showEditForm() {
        	vm.showEdit = true;
        }
        
        function cancelEdit() {
        	vm.showEdit = false;
        }
        
        function submitEdit() {
        	return dataservice.submitEdit(vm.loginUser).then(function (data) {
        		vm.showEdit = false;
        		
        		return data;
        	});
        }
    }
})();
