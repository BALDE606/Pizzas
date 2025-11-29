import './Pie.css'
import LogoMedia from "./SocialMediaLogos";

import faceImg from '../assets/images/facebook.svg'
import instaImg from '../assets/images/insta.svg'
import whatsImg from '../assets/images/whatsapp.svg'

function Pie(){
    return(
        <div className="pie">
            <div className="media">
                <LogoMedia logo={faceImg} text="Las Pizzassss"></LogoMedia>
                <LogoMedia logo={instaImg} text="Las Pizzass_08"></LogoMedia>
                <LogoMedia logo={whatsImg} text="+52 429 125 7289"></LogoMedia>
            </div>
            <div className="credits">
                <p>© 2025 Las pizasss. Todos los derechos reservados.</p>
                <p>Créditos del desarrollo para Yovani, Alexis, Baldemar y Luis.</p>
            </div>
        </div>
    )
}

export default Pie