// import React, { useState, useEffect, useRef } from "react";
// import * as mapboxgl from "mapbox-gl";
// import ReactMapGL, {
//     Layer,
//     LayerProps,
//     MapEvent,
//     NavigationControl,
//     Popup,
//     Source,
//     Marker
//   } from "react-map-gl";




import React, { useState, useEffect, useRef } from "react";
import ReactMapGL, {Marker, NavigationControl, FlyToInterpolator} from 'react-map-gl';
import useSwr from 'swr'
import useSupercluster from "use-supercluster";
import './Marker-cluster.css'
import custody from './custody.svg';
import {
    DEFAULT_VIEWPORT,
    MAPBOX_STYLES,
  } from '../../constant/constant'



function MarkerCluster(){

    // const [viewport, setViewport] = useState(DEFAULT_VIEWPORT)
    const [mapboxStyle, setMapboxStyle] = useState(MAPBOX_STYLES['Dark'])

    const [viewport, setViewport] = useState({
        latitude: 52.6373,
        longitude: -1.135171,
        width: "100vw",
        height: "100vh",
        zoom: 12,
    })
    // position setting for navigation control
    const navControlStyle= {
        bottom: 10,
        margin: '1.3rem',
        opacity: 0.85,
      };
    // Using useRef() to access the DOM
    const mapRef = useRef();

    const url = "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10";

    // Using swr to read the data from the url
    const {data, error} = useSwr(url, (...args)=>fetch(...args).then(response=> response.json()))
    //If there is no data or if there is an error we set crimes to an empty array
    const crimes = (data && !error) ? data.slice(0) : []

    // Create points for the marker cluster
    const points = crimes.map((crime)=>({
        type: 'Feature',
        properties: {
            cluster: false,
            crimeId: crime.id,
            category: crime.category
        },
        geometry: {type: 'Point', coordinates: [parseFloat(crime.location.longitude), parseFloat(crime.location.latitude)]}
    }))
    // Create the bounds for the marker cluster from the DOM
    const bounds = mapRef.current
    ? mapRef.current
        .getMap()
        .getBounds()
        .toArray()
        .flat()
    : null;

    // Create the marker cluster
    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom: viewport.zoom,
        options: { radius: 50, maxZoom: 20 }
    });

    //https://github.com/mapbox/supercluster#getleavesclusterid-limit--10-offset--0 super cluster doc
    
    return(
        <div>
            <div className="sidebar">
                Longitude: {viewport.longitude.toFixed(4)}| Latitude: {' '}
                {viewport.latitude.toFixed(4)}| Zoom: {viewport.zoom.toFixed(2)}
            </div>
            <div className='mapStyle'>
                {
                    Object.entries(MAPBOX_STYLES).map((styles, index)=>{
                    return(
                        <button className={styles[1]===mapboxStyle? styles[0]+' active': styles[0]}
                            style={{cursor: 'pointer'}} 
                            onClick={()=>setMapboxStyle(styles[1])} 
                            key={index}
                        >
                        {styles[0]}
                        </button>
                    )
                    })
                }
            </div>
            <ReactMapGL 
                {...viewport}
                width='100vw'
                height='100vh'
                maxZoom={20} 
                mapboxApiAccessToken="pk.eyJ1Ijoib21vYm9sYWppLWtveWkiLCJhIjoiY2txZm50eWUwMHQ1bzJxcGd1ODBxM2d1bSJ9.HTGUO42-AiI6NwJf-oZ5vw"
                onViewportChange = {(newViewPort) => setViewport({...newViewPort})}
                asyncRender={true}
                transitionDuration={100} 
                transitionInterpolator={new FlyToInterpolator()}
                ref = {mapRef}
                mapStyle={mapboxStyle}
            
            >{clusters.map((cluster)=>{
                const [longitude, latitude] = cluster.geometry.coordinates;
                const { cluster: isCluster, point_count: pointCount } = cluster.properties; //destructuring and renaming cluster as isCluster

                //if we are in a cluster we render👇
                if(isCluster){
                    return <Marker key={cluster.id} latitude={latitude} longitude={longitude}>
                        <div className='cluster-marker' onClick={()=>{
                            const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20); // we get the cluster expansion zoom by passing cluster.id as argument and choosing between the number and 20, depending on which one is smaller
                            setViewport({
                                ...viewport, 
                                latitude, 
                                longitude, 
                                zoom: expansionZoom,
                            })
                        }}
                        style={{width: `${10 + (pointCount/points.length) * 30}px`, height: `${10 + (pointCount/points.length) * 30}px`, cursor: 'pointer'}}
                        >{pointCount}</div>
                    </Marker>
                }

                // else, if we are not in a cluster we render 👇
                    return (
                        <Marker key={Math.random()} latitude={latitude} longitude={longitude} >
                            <button className='crime-marker'>
                                <img src={custody} alt='Crime doesnt pay'/>
                            </button>
                        </Marker>

                    )}
            )}
            <NavigationControl style={navControlStyle} />
            </ReactMapGL>

        </div>
    
    )

}
export default MarkerCluster
