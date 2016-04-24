/* jshint -W117, -W030 */
describe('user routes', function () {
    describe('state', function () {
        var view = 'app/user/user.html';

        beforeEach(function() {
            module('app.user', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state user to url /user ', function() {
            expect($state.href('user', {})).to.equal('/user');
        });

        it('should map /user route to user View template', function () {
            expect($state.get('user').templateUrl).to.equal(view);
        });

        it('of user should work with $state.go', function () {
            $state.go('user');
            $rootScope.$apply();
            expect($state.is('user'));
        });
    });
});
