import React, { useState, useEffect,} from "react";
import './map.css';
import ReactMapGL, {Marker, Popup, NavigationControl} from 'react-map-gl'
import parkData from '../../data/skateboard-parks.json'


const MAPBOX_STYLES = {
	'Dark': 'mapbox://styles/mapbox/dark-v10',
	'Light': 'mapbox://styles/mapbox/light-v10',
	'Outdoors': 'mapbox://styles/mapbox/outdoors-v11',
	'Satellite': 'mapbox://styles/mapbox/satellite-streets-v11',
	'Streets': 'mapbox://styles/mapbox/streets-v11'
}

function Map() {
  const [viewport, setViewport] = useState({
    latitude: 45.4211,
    longitude: -75.6903,
    width: '100vw',
    height: '100vh',
    zoom: 10,
    
  })
  const [selectedPark, setSelectedPark] = useState(null);
  const [mapStyle, setMapStyle] = useState(MAPBOX_STYLES['Dark'])
  const [mapStyleIcon, showMapStyle] = useState(false)

  // position setting for navigation control
  const navControlStyle= {
    bottom: 10,
    margin: '1.3rem',
    opacity: 0.85,
  };

  // close the popup when escape key is clicked. useEffect is only called once
  useEffect(()=>{
    const listener = (e)=>{
      if(e.key === 'Escape'){
        setSelectedPark(null)
      }
    };
    //adding a listener
    window.addEventListener('keydown', listener)
    // removing the listener
    return()=>{
      window.removeEventListener('keydown', listener)
    }
  },[])

  return (
  <div className="MapWrapper">
    <div className="sidebar">
      Longitude: {viewport.longitude.toFixed(4)}| Latitude: {' '}
      {viewport.latitude.toFixed(4)}| Zoom: {viewport.zoom.toFixed(2)}
    </div>
  <div className='dashBoard'>
    <h4>Wind Turbines in Germany</h4>
  </div>
  <div>{!mapStyleIcon? 
  <div className='mapStyle-icon' onClick={()=> showMapStyle(true)}><i className="fas fa-folder-open" style={{fontSize:'24px'}}></i></div>:
  <div className='mapStyle'>
      {
        Object.entries(MAPBOX_STYLES).map((styles, index)=>{
          return(
            <button className={styles[1]===mapStyle? styles[0]+' active': styles[0]}
                style={{cursor: 'pointer'}} 
                onClick={()=>{
                  setMapStyle(styles[1])
                  showMapStyle(false)
                }} 
                key={index}
            >
              {styles[0]}
            </button>
          )
        })
      }
    </div>
    }
  </div>
    
    <ReactMapGL {...viewport}
    mapStyle= {mapStyle}
    mapboxApiAccessToken= "pk.eyJ1Ijoib21vYm9sYWppLWtveWkiLCJhIjoiY2txZm50eWUwMHQ1bzJxcGd1ODBxM2d1bSJ9.HTGUO42-AiI6NwJf-oZ5vw"
    // mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
    onViewportChange = {(newViewport) => {
      return setViewport({...newViewport})
    }}
    >
      Marker goes here
      <NavigationControl style={navControlStyle} />
    </ReactMapGL>
  </div>
)};



export default Map;
