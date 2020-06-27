# node-red-contrib-storagemodule-postgres
A module to provide Node-RED persistence using a postgres database instead of the default filesystem.

More info here: [Node-RED Storage API](https://nodered.org/docs/api/storage/)

### How to use:
Add to your settings.js:
``` js
    storageModule: require("node-red-contrib-storagemodule-postgres"),
    postgresURI: "postgres://username:password@postgressIP:5432/database",
    postgresSchema: "public",   //optional, defaults to the public schema

    userDir: '/home/yourHomeDirectory/.node-red/', //required at the moment to install nodes via the palette manager
```

### How it works:
This module creates 2 new tables in your postgres database:
- nodered
- noderedlibrary

### Currently not implemented:
- sessions
- projects
- Doesn't log nicely, doesn't throw errors (just prints them)

### Currently not working/bugs:
- Installing nodes via the palette manager works (if a userDir is specified in settings.js), but installed nodes have no persistence, and are lost on a Node-RED reboot. On reboot, flows that contain missing nodes will then stop. Since installed nodes are managed purely in the Node-RED local filesystem The workaround is not pretty, requiring modification of the @node-red/registry/lib, which isn't just drop in.
- The queries have been hacked together and probably aren't safe from SQL injection.