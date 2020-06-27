const { Pool } = require('pg')

//let log = require("@node-red/util").log;

//using json instead of jsonb because I will not be querying inside the json, just returning it
const databaseColumns = `(
    flows json,
    credentials json,
    settings json
  )`

const libraryColumns = `(
    filepath varchar,
    filename varchar,
    meta json,
    file json
  )`

let settings;

let postgresfilesystem = {
    //pool,
    schema: "public",
    init: async function(_settings, runtime) {
        settings = _settings;

        if (!settings.postgresURI) {
            console.log("No settings.postgresURI Found!");
        } else {
            try {
                this.pool = new Pool({
                    'connectionString': settings.postgresURI,
                    //max: 10, //default
                    //idleTimeoutMillis: 10000, //default   //(10 seconds)
                    //connectionTimeoutMillis: 0, //default
                });
                if (settings.postgresSchema) {
                    this.schema = settings.postgresSchema;
                }

                await this.pool.query(`CREATE TABLE IF NOT EXISTS ${this.schema}.nodered ${databaseColumns}`);

                if ((await this.pool.query(`SELECT * FROM ${this.schema}.nodered`)).rowCount === 0) {
                    await this.pool.query(`INSERT INTO ${this.schema}.nodered (flows, credentials, settings) VALUES ('[]','{}','{}')`);
                }
                await this.pool.query(`CREATE TABLE IF NOT EXISTS ${this.schema}.noderedlibrary ${libraryColumns}`);


            } catch(err) {
                console.log("Failed to connect to postgres DB",err);
            }
        }
        return;
    },

    getFlows: async function() {
        return this.pgGet('flows');
    },
    saveFlows: async function(flows) {
        return this.pgSave('flows',JSON.stringify(flows));
    },
    getCredentials: async function() {
        return this.pgGet('credentials');
    },
    saveCredentials: async function(credentials) {
        return this.pgSave('credentials',JSON.stringify(credentials));
    },
    getSettings: async function() {
        return this.pgGet('settings');
    },
    saveSettings: async function(settings) {
        return this.pgSave('settings',JSON.stringify(settings));
    },

    pgGet: async function(get) {
        return (await this.pool.query(`SELECT ${get} FROM ${this.schema}.nodered`)).rows[0][get];
    },

    pgSave: async function(save, json) {
        return this.pool.query(`UPDATE ${this.schema}.nodered SET ${save} = '${json}'`);
    },

    //getSessions: sessions.getSessions,
    //saveSessions: sessions.saveSessions,
    //projects: projects

    getLibraryEntry: async function(type,path) {
        console.log('getLibraryEntry',type,path);
        if (type !== "flows") {
            return; //throw new err;
        }
        let toReturn = [];
        let foldersPushed = new Set();
        const sqlRes = (await this.pool.query(`SELECT * FROM ${this.schema}.noderedlibrary`)).rows;
        for (let row of sqlRes) {
            if (path == `${row.filepath}${row.filename}`) {
                return row.file;
            } else if (path == row.filepath) {
                toReturn.push({'fn': row.filename});
            } else if (row.filepath.startsWith(path)) {
                const folderName = row.filepath.replace(path,'').split('/')[0];
                if (!(foldersPushed.has(folderName))) {
                    foldersPushed.add(folderName);
                    toReturn.push(folderName);
                }
            } 
        }
        return toReturn;
    },

    saveLibraryEntry: async function(type,path,meta,body) {
        console.log('saveLibraryEntry',type,path,meta,body);
        if (type !== "flows") {
            return; //throw new err;
        }
        let splitPath = path.split('/');
        const filename = splitPath[splitPath.length-1];
        const filepath = path.replace(filename,'');
        return await this.pool.query(`INSERT INTO ${this.schema}.noderedlibrary (filepath, filename, meta, file) VALUES ('${filepath}','${filename}','${JSON.stringify(meta)}', '${JSON.stringify(body)}')`);
    }
    
};

module.exports = postgresfilesystem;