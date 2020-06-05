import knex from "knex";
import path from "path";

const connection = knex({
  client: "sqlite3",
  connection: {
    filename: path.resolve(__dirname, "database.sqlite"),
  },
  useNullAsDefault: true,
});

export default connection;

//Migration é o histórico do banco de dados
//create table points
//create table users
//create table points_users

//Fundamental methods
//UP - adiciona uma tabela
//DOWN - apaga a última tabela
