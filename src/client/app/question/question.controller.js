(function () {
    'use strict';

    angular
        .module('app.question')
        .controller('QuestionController', QuestionController);

    QuestionController.$inject = ['$q', 'dataservice', 'logger'];
    /* @ngInject */
    function QuestionController($q, dataservice, logger) {
        var vm = this;
        vm.questions = [];
        vm.title = 'Question';
        vm.qsearch = function() {
        	var promises = [getQuestions()];
        	return $q.all(promises);
        }
        
        activate();

        function activate() {
        	var promises = [getQuestions()];
        	return $q.all(promises).then(function() {
        		logger.info('Activated Question View');
            });
        }
        
        function getQuestions() {
            return dataservice.getQuestions(vm.qtitle).then(function (data) {
                vm.questions = data;
                return vm.questions;
            });
        }
    }
})();
