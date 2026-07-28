import { Link } from "react-router-dom";

function FeatureCard({

    icon,
    title,
    description,
    button,
    link

}){

    return(

        <div className="feature-card">

            <div className="feature-icon">

                {icon}

            </div>

            <h2>{title}</h2>

            <p>{description}</p>

            <Link
                to={link}
                className="feature-btn"
            >

                {button}

            </Link>

        </div>

    );

}

export default FeatureCard;