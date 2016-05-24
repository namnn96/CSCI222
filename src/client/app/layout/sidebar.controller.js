(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$state', 'routerHelper', '$window', '$rootScope'];
    /* @ngInject */
    function SidebarController($state, routerHelper, $window, $rootScope) {
        var vm = this;
        var states = routerHelper.getStates();
        vm.isCurrent = isCurrent;

        $rootScope.$on("SuccessLogin", function() {
        	console.log("activate sidebar");
        	if ($rootScope.userType == "General admin" || $rootScope.userType == "System admin")
        		$state.get("admin").settings.nav = 2;
        	
        	getNavRoutes();
        });
        
        $rootScope.$on("SuccessLogout", function() {
        	$state.get("admin").settings.nav = 3;
        	
        	getNavRoutes();
        });
        
        activate();

        function activate() { 
        	getNavRoutes(); 
    	}

        function getNavRoutes() {
            vm.navRoutes = states.filter(function(r) {
                return r.settings && r.settings.nav <= 2;
            }).sort(function(r1, r2) {
                return r1.settings.nav - r2.settings.nav;
            });
        }

        function isCurrent(route) {
            if (!route.title || !$state.current || !$state.current.title) {
                return '';
            }
            var menuName = route.title;
            return $state.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
        }
    }
})();
