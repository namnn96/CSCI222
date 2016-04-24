(function() {
    'use strict';

    angular
        .module('app.tag')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'tag',
                config: {
                    url: '/tag',
                    templateUrl: 'app/tag/tag.html',
                    controller: 'TagController',
                    controllerAs: 'vm',
                    title: 'Tag',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-lock"></i> Tag'
                    }
                }
            }
        ];
    }
})();
