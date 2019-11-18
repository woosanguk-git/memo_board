const mysql = require("mysql");
const db_config = require("./db_info").local;

module.exports = function() {
  return {
    init: function() {
      return mysql.createConnection({
        host: db_config.host,
        user: db_config.user,
        password: db_config.password,
        database: db_config.database,
        dateString: db_config.dateString
      });
    },
    db_open : function(con) {
      con.connect(function(error){
          if(error){
              console.log(error);
          }else {
              console.log("DB connect sucess!");
          }
      });
    }
  };
};
