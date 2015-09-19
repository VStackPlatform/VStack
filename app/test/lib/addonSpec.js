define(['app-lib/models/Addon'], function(Addon) {

    describe("test that addons are loaded correctly.", function() {
        it("loads a single addon from the database.", function(done) {
            Addon.findOne().then(function(result) {
                expect(typeof result).toBe('object');
                done();
            });
        });
        it("loads all enabled addons from the database.", function(done) {
            Addon.findEnabled().then(function(result) {
                expect(result.forEach).toBeDefined();
                done();
            });
        });
        it("loads all addons from the database.", function(done) {
            Addon.findAll().then(function(result) {
                expect(result.forEach).toBeDefined();
                done();
            });
        });
        it("finds all types available with addons.", function(done) {
            Addon.findAllTypes().then(function(result) {
                expect(result.rows).toBeDefined();
                done();
            });
        });
        it("finds addons that have the Target type.", function(done) {
            Addon.findByType('Target').then(function(result) {
                expect(typeof result).toBe('object');
                done();
            });
        });
        it("finds addons that have the Target type. return Addon model.", function(done) {
            Addon.findByType('Target', false).then(function(result) {
                expect(typeof result).toBe('object');
                done();
            });
        });
        /*it("extends the Addon model, initiates it and saves it.", function(done) {
            var Local = Addon.extend({
                init: function() {
                    this._super('local').then(function() {
                        this.priority(5);
                        this.save().then(function() {
                            done();
                        });
                        this.enableLiveUpdates();
                    }.bind(this));
                }
            });
            var local = new Local();
        });
         */
    });
});