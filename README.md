# node-red-contrib-storagemodule-postgres
A module to provide Node-RED persistence using a postgres database instead of the default filesystem.

More info here: [Node-RED Storage API](https://nodered.org/docs/api/storage/)

### How to use:
Add to your settings.js (normally found in '/home/yourHomeDirectory/.node-red/'):
``` js
    storageModule: require("node-red-contrib-storagemodule-postgres"),
    postgresURI: "postgres://username:password@postgressIP:5432/database",
    postgresSchema: "public",   //optional, defaults to the public schema
    // Enable module reinstalls on start-up; this ensures modules installed post-deploy are restored after a restage
    autoInstallModules: true,

    userDir: '/home/yourHomeDirectory/.node-red/', //required to install nodes via the palette manager
```
In the same directory ('/home/yourHomeDirectory/.node-red/'), run:
```sh
npm install node-red-contrib-storagemodule-postgres
```

### How it works:
This module creates 2 new tables in your postgres database:
- nodered
- noderedlibrary

### Currently not implemented:
- sessions
- projects
- Doesn't log nicely, doesn't throw errors (just prints them)
