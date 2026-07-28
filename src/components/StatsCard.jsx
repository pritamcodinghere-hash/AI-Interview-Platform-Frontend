function StatsCard({

    icon,
    title,
    value,
    color

}){

    return(

        <div className="stat-card">

            <div
                className="stat-icon"
                style={{color}}
            >

                {icon}

            </div>

            <h2>{value}</h2>

            <p>{title}</p>

        </div>

    );

}

export default StatsCard;