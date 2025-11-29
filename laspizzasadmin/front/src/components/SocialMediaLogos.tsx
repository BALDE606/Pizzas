import './SocialMediaLogos.css'
import type React from "react";

interface MediaProps{
    logo: string;
    text: string;
}

const LogoMedia: React.FC<MediaProps> = ({logo, text}) =>{
    return(
        <div className='social'>
            <a href="#">
                <img src={logo} alt={text} />
                <p>{text}</p>
            </a>
        </div>
    )
}

export default LogoMedia;