(function () {
    'use strict';

    angular
        .module('app.tag')
        .controller('TagController', TagController);

    TagController.$inject = ['logger', '$window', '$rootScope', '$state'];
    /* @ngInject */
    function TagController(logger, $window, $rootScope, $state) {
        var vm = this;
        vm.title = 'Tag';

        activate();

        function activate() {
        	if ($window.sessionStorage.getItem('login')) {
            	vm.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
            	if (vm.loginUser.type == 1)
                	vm.userType = "General user";
            	else if (vm.loginUser.type == 2)
            		vm.userType = "General admin";
        		else 
        			vm.userType = "System admin";
            	
            	$rootScope.userType = vm.userType;
                $rootScope.loginUser = JSON.parse($window.sessionStorage.getItem('login'));
         		$rootScope.$broadcast("SuccessLogin");
        	}
        	else 
        		$state.get("admin").settings.nav = 3;
        	
            logger.info('Activated Tag View');
        }
    }
})();
