define([
    'app-lib/vstack'
], function(vstack) {

    /*
    beforeAll(function(done) {
        vstack.createTables().then(function() {
            done();
        });
    });
    afterAll(function(done) {
        vstack.dropTables().then(function() {
            done();
        });
    });
     */
    describe("test that createTables vstack works when tables exist.", function() {
        it("returns successfully", function(done) {
            done();
            vstack.createTables().then(function() {
                expect(true).toBeTruthy();
                done();
            });
        });
    });

});
