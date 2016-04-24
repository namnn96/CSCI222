(function () {
    'use strict';

    angular
        .module('app.tag')
        .controller('TagController', TagController);

    TagController.$inject = ['logger'];
    /* @ngInject */
    function TagController(logger) {
        var vm = this;
        vm.title = 'Tag';

        activate();

        function activate() {
            logger.info('Activated Tag View');
        }
    }
})();
