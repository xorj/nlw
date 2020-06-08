import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import "./CreatePoint.css";
import logo from "../../assets/logo.svg";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import api from "../../services";
import axios from "axios";

interface Item {
  id: number;
  name: string;
  image: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECITYResponse {
  nome: string;
}
interface FormData {
  name: string;
  email: string;
  whatsapp: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [inicialPosition, setInicialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [selectedItems, setSelectedItems] = useState<Number[]>([]);

  const history = useHistory();

  //Sempre que se cria um estado para um array ou um objeto é necessário definir manualmente o tipo

  //Carrega posição inicial

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((currentLocation) => {
      console.log(currentLocation);
      const position = currentLocation.coords;
      setInicialPosition([position.latitude, position.longitude]);
    });
  });

  //Carrega os items que podem ser escolhidos
  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);

  //Carrega as UF's do Brasil
  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufinitials = response.data.map((uf) => uf.sigla);
        setUfs(ufinitials);
      });
  }, []);

  const handleSelectedUf = (event: ChangeEvent<HTMLSelectElement>) => {
    const uf = event.target.value;
    setSelectedUf(uf);
  };

  //Carrega as cidades de cada UF
  useEffect(() => {
    axios
      .get<IBGECITYResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);
        setCities(cityNames);
      });
  }, [selectedUf]);

  const handleSelectedCity = (event: ChangeEvent<HTMLSelectElement>) => {
    const city = event.target.value;
    setSelectedCity(city);
  };

  //Seleciona ponto no mapa
  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectedItem = (id: number) => {
    const alreadySlected = selectedItems.findIndex((item) => item === id);
    if (alreadySlected !== -1) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };

    api.post("/points", data).then(() => {
      alert("Cadastro efetuado com sucesso.");
      setTimeout(() => history.push("/"), 1 * 1000);
    });
  };

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br />
          Ponto de coleta
        </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereços</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={inicialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="estado(uf)">Estado</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectedUf}
              >
                <option>Selecione um Estado</option>
                {ufs.map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="cidade">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectedCity}
              >
                <option value="">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Items de coleta</h2>
            <span>Selecione um ou mais items abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectedItem(item.id)}
                className={selectedItems.includes(item.id) ? "selected" : ""}
              >
                <img src={"http://" + item.image} alt={item.name} />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
