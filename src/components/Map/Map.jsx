import React, { useState, useEffect, useRef, useCallback} from "react";
import './map.css';
import ReactMapGL, {Marker, Popup, NavigationControl} from 'react-map-gl'
import turbines from '../../data/wind-turbine.json'
import turbine from './windTurbine1.png'
import { MAPBOX_STYLES, DEFAULT_VIEWPORT} from "../../constant/constant";
import useSupercluster from "use-supercluster";

function Map() {
const [viewport, setViewport] = useState({...DEFAULT_VIEWPORT, zoom: 6})
  const [selectedTurbine, setSelectedTurbine] = useState({
    properties: null,
    coordinates: null
  });
  const [mapStyle, setMapStyle] = useState(MAPBOX_STYLES['Streets'])
  const [mapStyleIcon, showMapStyle] = useState(false)
  const [showPopup, togglePopup] = useState(false);

  // position setting for navigation control
  const navControlStyle= {
    bottom: 10,
    margin: '1.3rem',
    opacity: 0.85,
  };
  let newTurbines = turbines.features.slice(300)
  // console.log(newTurbines)

      // Using useRef() to access the DOM
      const mapRef = useRef();

      // Create points for the marker cluster
      const points = newTurbines.map((turbine)=>({
        type: 'Feature',
        properties: {
            cluster: false,
            turbineId: turbine.id,
            genMethod: turbine.properties['generator:method'],
            source: turbine.properties['generator:source'],
            genOutput: turbine.properties['generator:output:electricity'],
            genType: turbine.properties['generator:type'],
            note: turbine.properties['note'],
            manufacturer: turbine.properties['manufacturer'],
            model: turbine.properties['manufacturer:type'],
        },
        geometry: {type: 'Point', coordinates: [turbine.geometry.coordinates[0], turbine.geometry.coordinates[1]]}
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
    // console.log(clusters)

  // close the popup when escape key is clicked. useEffect is only called once
  useEffect(()=>{
    const listener = (e)=>{
      if(e.key === 'Escape'){
        // setSelectedTurbine(null)
        togglePopup(false)
      }
    };
    //adding a listener
    window.addEventListener('keydown', listener)
    // removing the listener (Effect cleanup)
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
  <h4 className="title">Wind Turbines in Germany</h4>
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
        maxZoom={20}
        asyncRender={true}
        transitionDuration={100} 
        mapboxApiAccessToken= "pk.eyJ1Ijoib21vYm9sYWppLWtveWkiLCJhIjoiY2txZm50eWUwMHQ1bzJxcGd1ODBxM2d1bSJ9.HTGUO42-AiI6NwJf-oZ5vw"
        // mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange = {(newViewport) => {
          return setViewport({...newViewport})
        }}
        width='100vw'
        height='100vh'
        ref = {mapRef}
    >
      {clusters.map((data)=>{
        const [longitude, latitude]= data.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = data.properties;
        // console.log(data)
        
        //if we are in a cluster we render👇
        if(isCluster){
          return <Marker key={data.id} latitude={latitude} longitude={longitude}>
              <div className='cluster-marker' onClick={()=>{
                  const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(data.id), 20); // we get the cluster expansion zoom by passing cluster.id as argument and choosing between the number and 20, depending on which one is smaller
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
        return(
          <Marker key={Math.random()} longitude={longitude} latitude={latitude} draggable={true}>
            <div onClick={()=>{
              setSelectedTurbine({
                ...selectedTurbine,
                properties: data.properties,
                coordinates: [longitude, latitude]
              })
              togglePopup((val)=>val=true)
              // console.log(selectedTurbine)
            }}>
              <img style={{width:'30px', cursor: 'pointer'}} src={turbine} alt="Wind turbine" />
            </div>
          </Marker>
        )

      })}
      {showPopup && <Popup 
                    longitude={selectedTurbine.coordinates[0]} 
                    latitude={selectedTurbine.coordinates[1]}
                    closeButton = {true}
                    closeOnClick={true}
                    onClose={() => togglePopup(false)}
                    anchor = "bottom"
                >
                    <div className="popup">
                        <span><b>Longitude</b>: {selectedTurbine.coordinates[0]}</span><br />
                        <span><b>Latitude</b>: {selectedTurbine.coordinates[1]}</span><br />
                        <span><b>Manufacturer</b>: {selectedTurbine.properties.manufacturer??'N/A'}</span><br />
                        <span><b>Model</b>: {selectedTurbine.properties.model??'N/A'}</span><br />
                        <span><b>Output</b>: {selectedTurbine.properties.genOutput??'N/A'}</span><br />
                        <span><b>Type</b>: {selectedTurbine.properties.genType??'N/A'}</span>
                    </div>
                </Popup>
                }

      <NavigationControl style={navControlStyle} />
    </ReactMapGL>
  </div>
)};



export default Map;
