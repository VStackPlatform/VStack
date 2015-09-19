define(['app-lib/models/Vstack', 'v-config'], function(Vstack, config) {
    var db = 'vstack';
    switch (config.environment) {
        case 'test':
            db += '_test';
            break;
    }
    return new Vstack(db);
});