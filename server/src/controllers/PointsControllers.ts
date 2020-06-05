import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  //Cria um novo point
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;
    //Faz com que as duas funções assíncronas dependam uma da outra
    const trx = await knex.transaction();

    const point = {
      image:
        "https://images.unsplash.com/photo-1573481078935-b9605167e06b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };
    //Toda vez que uma nova linha é inserida a uma tabela a função retorna os ids das linhas adicionadas em forma de lista.
    const insertedIds = await trx("points").insert(point);

    const id = insertedIds[0];

    const pointItems = items.map((item_id: number) => {
      return {
        item_id: item_id,
        point_id: id,
      };
    });

    await trx("points_items")
      .insert(pointItems)
      .catch((error) => console.log(error));

    await trx.commit();

    return res.json({ id: id, ...point });
  }
  //Busca um point pelo id
  async show(req: Request, res: Response) {
    const { id } = req.params;
    const point = await knex("points").where("id", id).first();

    if (!point) {
      return res.status(400).json({
        message: "Point not found",
      });
    } else {
      const items = await knex("items")
        .join("points_items", "items.id", "=", "points_items.item_id")
        .where("points_items.point_id", id)
        .select("items.title");

      return res.json({ point, items });
    }
  }
  //Filta os points usando alguns parametros
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;
    console.log(city, uf, items);

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));
    const points = await knex("points")
      .join("points_items", "point_id", "=", "points_items.point_id")
      .whereIn("points_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    return res.json({ points });
  }
}

export default PointsController;
