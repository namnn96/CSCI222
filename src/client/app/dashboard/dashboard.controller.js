(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$q', 'dataservice', 'logger', '$state', '$filter', '$window'];
    /* @ngInject */
    function DashboardController($q, dataservice, logger, $state, $filter, $window) {
        var vm = this;
        vm.news = {
            title: 'QnA System',
            description: 'Hot Towel Angular is a SPA template for Angular developers.'
        };
        vm.people = [];
        vm.title = 'Dashboard';
        
        // Handle login - signup - logout
        vm.login = login;
        vm.signup = signup;
        vm.logout = logout;
        
        // Toggle green boxes
        vm.showForm = showForm;
        vm.showsignin = ($window.sessionStorage.length == 0) ? true : false;
        vm.showsignup = false;
        vm.showCurrentUser = ($window.sessionStorage.length == 0) ? false : true;
        
        activate();

        function activate() {
        	console.log("Window: " + $window.sessionStorage.length);
        	
        	if ($window.sessionStorage.length > 0) {
            	vm.loginUser = JSON.parse($window.sessionStorage.getItem(1));
            	if (vm.loginUser.type == 1)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 2)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
        	}
        	
        	vm.windowSessionLength = $window.sessionStorage.length;
        	if (vm.windowSessionLength == 0)
        		$state.get("admin").settings.nav = 3;
        	else 
        		$state.get("admin").settings.nav = 2;
        	
            var promises = [getMessageCount(), getPeople()];
            return $q.all(promises).then(function() {
                logger.info('Activated Dashboard View');
            });
        }

        function getMessageCount() {
            return dataservice.getMessageCount().then(function (data) {
                vm.messageCount = data;
                return vm.messageCount;
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
                vm.loginUser = data;
                if (vm.loginUser.type == 1)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 2)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
                
                vm.showsignin = false;
                vm.showCurrentUser = true;
                
                $window.sessionStorage.setItem(1, JSON.stringify(vm.loginUser));
                
                $state.reload();
            });
        	
        	$state.transitionTo('question');
        }
        
        function signup() {
        	return dataservice.signup(vm.newuser).then(function (data) {
        		return data;
        	});
        }
        
        function showForm() {
        	vm.showsignin = vm.showsignin == false ? true : false;
        	vm.showsignup = vm.showsignup == false ? true : false;
        }
        
        function logout() {
        	$window.sessionStorage.removeItem(1);
        	
        	vm.showCurrentUser = false;
        	vm.showsignin = true;
        }
    }
})();
