(function () {
    'use strict';

    angular
        .module('app.tag')
        .controller('TagController', TagController);

    TagController.$inject = ['$q', 'logger', 'tagservice', '$window', '$rootScope', '$state'];
    /* @ngInject */
    function TagController($q, logger, tagservice, $window, $rootScope, $state) {
        var vm = this;
        vm.title = 'Tag';

        vm.searchTag = searchTag;
        vm.findTag = findTag;
        
        /***********Pagination**************/
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
        	
        	if ($window.sessionStorage.getItem('tagsPage'))
        		vm.page = JSON.parse($window.sessionStorage.getItem('tagsPage'));
        	else
        		vm.page = 1;
        	
        	vm.firstpage = (vm.page == 1 || vm.page == undefined) ? true : false;
//        	if ($window.sessionStorage.getItem('tags')) {
//            	vm.tags = JSON.parse($window.sessionStorage.getItem('tags'));
//            	return logger.info('Activated Tag View');
//        	}
        	
        	var promises = [getTags()];
        	return $q.all(promises).then(function() {
        		logger.info('Activated Tag View');
            });
        }
        
        function searchTag() {
        	var promises = [getTags()];
        	return $q.all(promises);
        }
        
        function getTags() {
            return tagservice.getTags(vm.keyword, vm.page).then(function (data) {
                vm.tags = data;
                $window.sessionStorage.setItem('tagsPage', JSON.stringify(vm.page));
//                $window.sessionStorage.setItem('tags', JSON.stringify(vm.tags));
                return vm.tags;
            });
        }  
        
        function findTag(tag){
        	var tagObj = [{
        			"text": tag.substr(1, tag.length-2)
        	}];
        	
        	$window.sessionStorage.setItem('tags', JSON.stringify(tagObj));
        	$state.transitionTo('question');
        }
        
        function next() {
        	vm.page++;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getTags();
        }
        
        function last() {
        	vm.page--;
        	vm.firstpage = vm.page == 1 ? true : false;
        	return getTags();
        }
    }
})();
