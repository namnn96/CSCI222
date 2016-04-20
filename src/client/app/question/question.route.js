(function() {
    'use strict';

    angular
        .module('app.question')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'question',
                config: {
                    url: '/question',
                    templateUrl: 'app/question/question.html',
                    controller: 'QuestionController',
                    controllerAs: 'vm',
                    title: 'Question',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-lock"></i> Question'
                    }
                }
            }
        ];
    }
})();
