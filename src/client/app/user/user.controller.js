(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('UserController', UserController);

    UserController.$inject = ['$q', 'dataservice', 'logger'];
    /* @ngInject */
    function UserController($q, dataservice, logger) {
        var vm = this;
        vm.users = [];
        vm.title = 'User';
        
        activate();

        function activate() {
        	var promises = [getUsers()];
            return $q.all(promises).then(function() {
                logger.info('Activated User View');
            });
        }
        
        function getUsers() {
            return dataservice.getUsers().then(function (data) {
                vm.users = data;
                return vm.users;
            });
        }
    }
})();
