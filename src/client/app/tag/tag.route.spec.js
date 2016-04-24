/* jshint -W117, -W030 */
describe('tag routes', function () {
    describe('state', function () {
        var view = 'app/tag/tag.html';

        beforeEach(function() {
            module('app.tag', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state tag to url /tag ', function() {
            expect($state.href('tag', {})).to.equal('/tag');
        });

        it('should map /tag route to tag View template', function () {
            expect($state.get('tag').templateUrl).to.equal(view);
        });

        it('of tag should work with $state.go', function () {
            $state.go('tag');
            $rootScope.$apply();
            expect($state.is('tag'));
        });
    });
});
