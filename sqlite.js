/**
 * Module handles database management
 *
 * The sample data is for a chat log with one table:
 * Messages: id + message text
 */

const path = require("path");
const fs = require("fs");
const dbFile = path.resolve(process.env.DATA_FILE, "hits2.db") ||"./.data/hits2.db";
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
const { create } = require("domain");
let db;


// Server script calls these methods to connect to the db
module.exports = {

  // setup the database
  initialize: async() => {
    console.log("Initializing database");
    //SQLite wrapper for async / await connections https://www.npmjs.com/package/sqlite
    dbWrapper
      .open({
        filename: dbFile,
        driver: sqlite3.Database,
      })
      .then(async (dBase) => {
        db = dBase;
        create_sql =  "CREATE TABLE IF NOT EXISTS Hits (id INTEGER PRIMARY KEY AUTOINCREMENT, userAgent TEXT,referrer TEXT,url TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)"       
        try {
            await db.run(create_sql);
        } catch (dbError) {
          console.error(dbError);
        }
      });
    },

  // Get the hits in the database
  getHits: async () => {
    try {
      return await db.all("SELECT * from Hits order by createdAt");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  // Add new hit
  addHit: async (ua, ref, url) => {
    if (ua == null) {
      ua = "-";
    }
    if (ref == null) {
      ref = "";
    }
    if (url == null) {
      url = "-";
    }
    console.log("Hit write received: [" + ua + "],[" + ref + "],[" + url + "]");
    let success = false;
    try {
      success = await db.run(
        "INSERT INTO Hits (userAgent, referrer, url) VALUES (?,?,?)",
        [ua, ref, url]
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
      success = await db.run("Delete from Hits WHERE 1=1");
    } catch (dbError) {
      console.error(dbError);
    }
    return success.changes > 0 ? true : false;
  },
};
