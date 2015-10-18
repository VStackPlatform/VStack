define(['app-lib/models/Project'], function(Project) {

    var gui = require('nw.gui');
    var win = gui.Window.get();


    // Get the minimize event
    //win.on('close', function () {
    //    this.hide();
    //});


    if (localStorage.taskMenuCreated == undefined || localStorage.taskMenuCreated == "false") {

        var project = new Project();
        project.findAll().then(function (results) {

            var menu = new gui.Menu();

            menu.append(new gui.MenuItem({label: 'Open VStack'}));
            menu.append(new gui.MenuItem({type: 'separator'}));

            var item = new gui.MenuItem({label: 'Projects'});
            var submenu = new gui.Menu();
            for (var i in results) {
                var subitem = new gui.MenuItem({label: results[i].name()});
                var actions = new gui.Menu();
                actions.append(new gui.MenuItem({
                    label: 'Up',
                    click: results[i].up.bind(results[i])
                }));
                actions.append(new gui.MenuItem({
                    label: 'Provision',
                    click: results[i].provision.bind(results[i])
                }));
                actions.append(new gui.MenuItem({
                    label: 'Reload',
                    click: results[i].reload.bind(results[i])
                }));
                actions.append(new gui.MenuItem({
                    label: 'Halt',
                    click: results[i].halt.bind(results[i])
                }));
                actions.append(new gui.MenuItem({
                    label: 'Destroy',
                    click: results[i].destroy.bind(results[i])
                }));
                subitem.submenu = actions;
                submenu.append(subitem);
            }

            item.submenu = submenu;
            menu.append(item);
            menu.append(new gui.MenuItem({type: 'separator'}));
            menu.append(new gui.MenuItem({label: 'Quit VStack'}));


            // Create a tray icon
            var tray = new gui.Tray({title: 'VStack', icon: 'images/stack.png'});

            tray.menu = menu;
            menu.items[0].click = function () {
                win.show();
            };

            menu.items[4].click = function () {
                window.localStorage.taskMenuCreated = "false";
                win.close(true);
            };

            tray.on('click', function () {
                win.show();
            });

        });
    }

});