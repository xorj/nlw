import { Request, Response } from "express";
import knex from "../database/connection";

class ItemsController {
  async index(req: Request, res: Response) {
    //Sempre que usar uma query para o banco de dados use "await"
    const items = await knex("items").select("*");
    const serializedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.title,
        image: `http://192.168.1.6:3333/uploads/${item.image}`,
      };
    });
    return res.json(serializedItems);
  }
}

export default ItemsController;
