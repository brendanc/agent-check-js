/**
 * Module handles database management
 *
 * The sample data is for a chat log with one table:
 * Messages: id + message text
 */

const fs = require("fs");
const dbFile = "./.data/hits2.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

//SQLite wrapper for async / await connections https://www.npmjs.com/package/sqlite
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database,
  })
  .then(async (dBase) => {
    db = dBase;

    try {
      if (!exists) {
        await db.run(
          "CREATE TABLE Hits (id INTEGER PRIMARY KEY AUTOINCREMENT, userAgent TEXT,referrer TEXT,url TEXT, ipAddress TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)"
        );
      }
      console.log(
        await db.all("SELECT * from Hits order by createdAt desc limit 10")
      );
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Server script calls these methods to connect to the db
module.exports = {
  // Get the hits in the database
  getHits: async () => {
    try {
      return await db.all("SELECT * from Hits order by createdAt");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  // Add new hit
  addHit: async (ua, ref, url, ip) => {
    if (ua == null) {
      ua = "-";
    }
    if (ref == null) {
      ref = "";
    }
    if (url == null) {
      url = "-";
    }
    if (ip == null) {
      ip = "-";
    }
    console.log("Hit write received: [" + ua + "],[" + ref + "],[" + url + "],[" + ip + "]");
    let success = false;
    try {
      success = await db.run(
        "INSERT INTO Hits (userAgent, referrer, url,ipAddress) VALUES (?,?,?,?)",
        [ua, ref, url,ip]
      );
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },

  // clear hits
  deleteAllHits: async () => {
    let success = false;
    try {
      success = await db.run("Drop Table If Exists Hits;");
        await db.run(
          "CREATE TABLE Hits (id INTEGER PRIMARY KEY AUTOINCREMENT, userAgent TEXT,referrer TEXT,url TEXT, ipAddress TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)"
        );

    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },
};
