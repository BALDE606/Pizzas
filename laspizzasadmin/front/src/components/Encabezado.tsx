import './encabezado.css'
import logoPizza from '../assets/images/LogoPizzas.svg'

function Encabezado(){
    return(
        <div className="encabezado">
            <img src={logoPizza} alt="Logo" className='logo'/>
            <h2 className='slogan'> El secreto de la felicidad tiene forma redonda y mucho queso derretido</h2>
        </div>
    )
}

export default Encabezado;