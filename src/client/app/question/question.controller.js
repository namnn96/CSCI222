(function () {
    'use strict';

    angular
        .module('app.question')
        .controller('QuestionController', QuestionController);

    QuestionController.$inject = ['logger'];
    /* @ngInject */
    function QuestionController(logger) {
        var vm = this;
        vm.title = 'Question';

        activate();

        function activate() {
            logger.info('Activated Question View');
        }
    }
})();
