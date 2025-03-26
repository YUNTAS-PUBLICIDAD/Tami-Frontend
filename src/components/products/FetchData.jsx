import { useEffect, useState } from 'react';

export default function ComponenteDePrueba() {
    const [mostrar, setMostrar] = useState([]);

    const obtenerDatos = async () => {
        const data = await fetch("https://apitami.tami-peru.com/api/v1/productos");
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