import { useEffect, useState } from 'react';
import {config, getApiUrl} from "../../../config.js";

export default function ComponenteDePrueba() {
    const [mostrar, setMostrar] = useState([]);

    const obtenerDatos = async () => {
        const data = await fetch(getApiUrl(config.endpoints.productos.list));
        const productoData = await data.json();
        const mostrarMapeado = productoData.data.map((x)=>{
            return <Parrafo key={x.id} {...x} />
        })
        setMostrar(mostrarMapeado);
        console.log(productoData);
        console.log(mostrar);
    }

    useEffect(() => {
        obtenerDatos();
    }, []);
    return (
        <div>
            {mostrar}
        </div>
    )
}

function Parrafo(props) {
    return (
        <p>{props.title}</p>
    )
}