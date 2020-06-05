import express from "express";
import PointsController from "./controllers/PointsControllers";
import ItemsController from "./controllers/itemsController";

const routes = express.Router();

//Cria uma instãncia da classe PointsController
const pointsController = new PointsController();

//Cria uma instâqncia da classe ItemsController
const itemsController = new ItemsController();

//Serve todos os items
routes.get("/items", itemsController.index);

//Selecia points por estado, cidade e items
routes.get("/points", pointsController.index);

//Adiciona um ponto de coleta
routes.post("/points", pointsController.create);

//Busca um point pelo id
routes.get("/points/:id", pointsController.show);

//Métodos de rotas; index, show, create, update e delete
//CORS - Cross Orgin Resource Sharing
export default routes;
