
import React, { useEffect, useRef, useState } from 'react';
import { ITINERARY, getIcon } from '../constants';
import { fetchPOIsForMaldivi, fetchDivePOIs } from '../services/overpassService';
import { 
  Map as MapIcon, 
  Waves, 
  Info, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  Anchor, 
  ChevronRight, 
  GraduationCap, 
  MapPin,
  ChevronDown,
  ArrowRight,
  Clock,
  Navigation,
  Layers,
  Search,
  Loader2,
  Coffee,
  Heart,
  Camera,
  ThermometerSun,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { fetchDiveSitesFromOsm } from '../services/apiService';
import { fetchDiveSites } from '../services/diveSitesService';
import { OsmDiveSite } from '../types';
import type { DiveSiteDetails } from '../services/diveSitesService';

declare const L: any;

const Itinerary: React.FC = () => {
  const mapRef = useRef<any | null>(null);
  const layersRef = useRef<{ base: any, marine: any } | null>(null);
  const poiLayersRef = useRef<{ restaurants: any, hotels: any, attractions: any, shops: any }>({
    restaurants: null,
    hotels: null,
    attractions: null,
    shops: null
  });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [osmDiveSites, setOsmDiveSites] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [marineOverlayActive, setMarineOverlayActive] = useState(false);
  const [restaurantsVisible, setRestaurantsVisible] = useState(false);
  const [hotelsVisible, setHotelsVisible] = useState(false);
  const [attractionsVisible, setAttractionsVisible] = useState(false);
  const [diveSitesData, setDiveSitesData] = useState<Map<string, DiveSiteDetails>>(new Map());
  const [loadingDiveSites, setLoadingDiveSites] = useState(true);

  useEffect(() => {
    // Load dive sites with details from API
    const loadDiveSitesDetails = async () => {
      try {
        const allDiveSites = await fetchDiveSites();
        const sitesMap = new Map<string, DiveSiteDetails>();
        
        allDiveSites.forEach(site => {
          sitesMap.set(site.id, site);
          // Also add by name for compatibility
          sitesMap.set(site.name.toLowerCase().replace(/\s+/g, '-'), site);
        });
        
        setDiveSitesData(sitesMap);
      } catch (error) {
        console.error('Error loading dive sites:', error);
      } finally {
        setLoadingDiveSites(false);
      }
    };

    loadDiveSitesDetails();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      const sites = await fetchDiveSitesFromOsm();
      setOsmDiveSites(sites);

      // Load POI data - fetch specific categories
      const pharmacies = await fetchPOIsForMaldivi('pharmacy');
      const hospitals = await fetchPOIsForMaldivi('hospital');
      const restaurants = await fetchPOIsForMaldivi('restaurant');
      const hotels = await fetchPOIsForMaldivi('accommodation');
      const attractions = await fetchPOIsForMaldivi('attraction');

      if (typeof L !== 'undefined') {
        const container = document.getElementById('dive-map');
        if (container) {
          setTimeout(() => {
            if (!mapRef.current) {
              const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              });

              const marineLayer = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
                attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
              });

              mapRef.current = L.map('dive-map', { 
                scrollWheelZoom: false,
                zoomControl: false,
                layers: [baseLayer]
              }).setView([3.9446, 73.4891], 11);

              layersRef.current = { base: baseLayer, marine: marineLayer };
              L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

              // Create POI layers
              const restaurantsLayer = L.featureGroup();
              const hotelsLayer = L.featureGroup();
              const attractionsLayer = L.featureGroup();
              const pharmaciesLayer = L.featureGroup();
              const hospitalsLayer = L.featureGroup();

              // Add pharmacy markers
              pharmacies.forEach(poi => {
                const icon = L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2VlMzAzMCIvPjwvc3ZnPg==',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                const marker = L.marker([poi.lat, poi.lon], { icon }).bindPopup(`<b>${poi.name}</b><br>Pharmacy`);
                pharmaciesLayer.addLayer(marker);
              });

              // Add hospital markers
              hospitals.forEach(poi => {
                const icon = L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2QzMjYyNiIvPjwvc3ZnPg==',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                const marker = L.marker([poi.lat, poi.lon], { icon }).bindPopup(`<b>${poi.name}</b><br>Hospital`);
                hospitalsLayer.addLayer(marker);
              });

              // Add restaurant markers
              restaurants.forEach(poi => {
                const icon = L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2ZmNjkwMCIvPjwvc3ZnPg==',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                const marker = L.marker([poi.lat, poi.lon], { icon }).bindPopup(`<b>${poi.name}</b><br>Restaurant`);
                restaurantsLayer.addLayer(marker);
              });

              // Add hotel markers
              hotels.forEach(poi => {
                const icon = L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzBhOTM5NiIvPjwvc3ZnPg==',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                const marker = L.marker([poi.lat, poi.lon], { icon }).bindPopup(`<b>${poi.name}</b><br>Hotel`);
                hotelsLayer.addLayer(marker);
              });

              // Add attraction markers
              attractions.forEach(poi => {
                const icon = L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2VlOWIwMCIvPjwvc3ZnPg==',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                const marker = L.marker([poi.lat, poi.lon], { icon }).bindPopup(`<b>${poi.name}</b><br>Attraction`);
                attractionsLayer.addLayer(marker);
              });

              poiLayersRef.current = { 
                restaurants: restaurantsLayer,
                hotels: hotelsLayer,
                attractions: attractionsLayer,
                shops: pharmaciesLayer
              };

              sites.forEach(site => {
                const markerIcon = L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="background-color: #0a9396; border: 2px solid #fff; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                });

                // Generate dive site details
                const safetyContext = `Safety First Protocol: Always dive with a buddy and strictly follow the Dive Master's briefing. The Maldives South Malé Atoll is renowned for its strong tidal currents, especially in the channels (kandus). Divers must monitor their air consumption and NDL limits continuously. For this specific site [${site.name}], neutral buoyancy is critical to protect fragile coral structures. All KVS divers must carry a Surface Marker Buoy (SMB) for drift dive scenarios. If you feel tired or cold, signal your buddy and end the dive safely. Respect all marine life: take only pictures, leave only bubbles.`;
                
                const popupContent = `
                  <div class="p-5" style="min-width: 320px; font-family: 'Inter', sans-serif;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                       <span style="background: #ee9b00; color: white; font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 99px; text-transform: uppercase;">VERIFIED OSM DATA</span>
                       <span style="background: #f0f9fa; color: #005f73; font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 99px; text-transform: uppercase;">${site.type.toUpperCase()}</span>
                    </div>
                    <h4 style="margin: 0 0 8px; font-size: 20px; font-weight: 900; color: #001219;">${site.name}</h4>
                    <div style="background: #f8fdff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
                       <p style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Coordinates</p>
                       <p style="margin: 4px 0 0; font-size: 13px; font-weight: 800; color: #0a9396;">LAT: ${site.lat.toFixed(4)} / LON: ${site.lon.toFixed(4)}</p>
                    </div>
                    <div style="margin-bottom: 12px;">
                       <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Safety & Context</p>
                       <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6; max-height: 150px; overflow-y: auto;">${safetyContext}</p>
                    </div>
                    <div style="border-top: 1px solid #f1f5f9; pt: 12px; font-size: 10px; color: #94a3b8; font-style: italic;">
                      Source: Overpass API / OpenStreetMap Contributors (OSM Data Source). This data is provided in real-time to ensure maximum navigational awareness for the KVS SCUBA Maldives 2026 Private Expedition.
                    </div>
                  </div>
                `;

                const marker = L.marker([site.lat, site.lon], { icon: markerIcon }).addTo(mapRef.current!);
                marker.bindPopup(popupContent);
              });
              setLoadingMap(false);
            }
          }, 100);
        }
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const toggleMarineLayer = () => {
    if (mapRef.current && layersRef.current) {
      if (marineOverlayActive) {
        mapRef.current.removeLayer(layersRef.current.marine);
      } else {
        layersRef.current.marine.addTo(mapRef.current);
      }
      setMarineOverlayActive(!marineOverlayActive);
    }
  };

  const togglePOILayer = (layerType: 'restaurants' | 'hotels' | 'attractions') => {
    if (!mapRef.current || !poiLayersRef.current[layerType]) return;
    
    const layer = poiLayersRef.current[layerType];
    if (layerType === 'restaurants') {
      if (restaurantsVisible) {
        mapRef.current.removeLayer(layer);
      } else {
        layer.addTo(mapRef.current);
      }
      setRestaurantsVisible(!restaurantsVisible);
    } else if (layerType === 'hotels') {
      if (hotelsVisible) {
        mapRef.current.removeLayer(layer);
      } else {
        layer.addTo(mapRef.current);
      }
      setHotelsVisible(!hotelsVisible);
    } else if (layerType === 'attractions') {
      if (attractionsVisible) {
        mapRef.current.removeLayer(layer);
      } else {
        layer.addTo(mapRef.current);
      }
      setAttractionsVisible(!attractionsVisible);
    }
  };

  const getRecommendedCourses = (difficulty: string) => {
    if (difficulty.includes('napredni')) return ['SSI Decompression Diving'];
    if (difficulty.includes('srednji')) return ['SSI Advanced Adventurer'];
    return ['SSI Open Water Diver'];
  };

  // Get dive site details from API data
  const getDiveSiteInfo = (diveName: string): DiveSiteDetails | null => {
    // Try exact name match first
    const exactMatch = diveSitesData.get(diveName);
    if (exactMatch) return exactMatch;

    // Try normalized name match
    const normalized = diveName.toLowerCase().replace(/\s+/g, '-');
    const normalizedMatch = diveSitesData.get(normalized);
    if (normalizedMatch) return normalizedMatch;

    // Try finding by substring
    for (const [, site] of diveSitesData) {
      if (site.name.toLowerCase().includes(diveName.toLowerCase())) {
        return site;
      }
    }

    return null;
  };

  const toggleAccordion = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-[#f8fdff] min-h-screen pb-24">
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6 bg-[#f0f9fa] border-b border-cyan-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="space-y-6">
            <span className="text-[#ee9b00] font-black text-xs uppercase tracking-[0.4em]">Official Itinerary</span>
            <h1 className="text-5xl md:text-8xl font-black text-[#001219] tracking-tight leading-none">YOUR DAILY<br/><span className="text-[#0a9396]">DIVE LOG</span></h1>
            <p className="text-gray-500 max-w-2xl text-lg font-medium leading-relaxed">
              Detaljan 12-dnevni plan ekspedicije za KVS tim. Svaka lokacija na mapi je povučena uživo sa OpenStreetMap platforme.
            </p>
          </div>
          <div className="bg-[#005f73] text-white p-10 rounded-[50px] shadow-2xl flex items-center gap-10 border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            <div className="text-center relative z-10">
               <div className="text-5xl font-black tracking-tighter">12</div>
               <div className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-300 mt-1">Dana</div>
            </div>
            <div className="w-px h-16 bg-white/20 relative z-10" />
            <div className="text-center relative z-10">
               <div className="text-5xl font-black tracking-tighter">{osmDiveSites.length}+</div>
               <div className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-300 mt-1">Urona</div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#ee9b00] p-4 rounded-[24px] shadow-lg shadow-[#ee9b00]/20">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 id="strategic-dive-map" className="text-3xl font-black text-[#001219] tracking-tight">Strategic Expedition Map</h3>
                <p className="text-xs font-black text-[#0a9396] uppercase tracking-[0.2em] mt-1">OpenStreetMap + OpenSeaMap + POI Data</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={toggleMarineLayer}
                className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all border shadow-sm whitespace-nowrap ${
                  marineOverlayActive ? 'bg-[#005f73] text-white border-[#005f73]' : 'bg-white text-[#005f73] border-gray-100'
                }`}
              >
                <Layers className="w-4 h-4" /> Marine
              </button>
              <button 
                onClick={() => togglePOILayer('restaurants')}
                className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all border shadow-sm whitespace-nowrap ${
                  restaurantsVisible ? 'bg-[#ff6900] text-white border-[#ff6900]' : 'bg-white text-[#ff6900] border-gray-100'
                }`}
              >
                <Coffee className="w-4 h-4" /> Restaurants
              </button>
              <button 
                onClick={() => togglePOILayer('hotels')}
                className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all border shadow-sm whitespace-nowrap ${
                  hotelsVisible ? 'bg-[#0a9396] text-white border-[#0a9396]' : 'bg-white text-[#0a9396] border-gray-100'
                }`}
              >
                <MapPin className="w-4 h-4" /> Hotels
              </button>
              <button 
                onClick={() => togglePOILayer('attractions')}
                className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all border shadow-sm whitespace-nowrap ${
                  attractionsVisible ? 'bg-[#ee9b00] text-white border-[#ee9b00]' : 'bg-white text-[#ee9b00] border-gray-100'
                }`}
              >
                <Camera className="w-4 h-4" /> Attractions
              </button>
              <button 
                onClick={() => togglePOILayer('shops')}
                className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all border shadow-sm whitespace-nowrap ${
                  'bg-white text-[#d32626] border-gray-100 hover:bg-[#d32626] hover:text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4" /> Pharmacies & Hospitals
              </button>
            </div>
          </div>
          <div className="relative h-[70vh] w-full rounded-[60px] border border-cyan-50 shadow-2xl overflow-hidden group">
            {loadingMap && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#0a9396] animate-spin mb-4" />
                <p className="text-sm font-black text-[#005f73] uppercase tracking-widest">Učitavanje mape...</p>
              </div>
            )}
            <div id="dive-map" className="h-full w-full z-10" />
            <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur p-4 rounded-3xl border border-gray-100 shadow-xl hidden md:block">
              <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Mapa Legenda</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#0a9396]" />
                  <span className="text-[10px] font-bold text-[#001219]">Dive Site</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#ff6900]" />
                  <span className="text-[10px] font-bold text-[#001219]">Restaurant</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#0a9396]" />
                  <span className="text-[10px] font-bold text-[#001219]">Hotel</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#ee9b00]" />
                  <span className="text-[10px] font-bold text-[#001219]">Attraction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="itinerary" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute left-[26px] md:left-[30px] top-8 bottom-8 w-1.5 bg-gradient-to-b from-[#005f73] via-[#0a9396] to-transparent rounded-full opacity-30" />

          <div className="space-y-16">
            {ITINERARY.map((item, idx) => (
              <div key={idx} className="relative flex gap-8 md:gap-14 group">
                <div className={`
                  relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-[24px] flex items-center justify-center border-[6px] shadow-2xl transition-all duration-500 shrink-0
                  ${item.type === 'Dive' ? 'bg-[#005f73] border-white scale-110 rotate-3' : 'bg-white border-[#f0f9fa] hover:rotate-3'}
                `}>
                  {React.cloneElement(getIcon(item.type) as React.ReactElement<any>, { 
                    className: `w-6 h-6 md:w-8 md:h-8 ${item.type === 'Dive' ? 'text-white' : 'text-[#005f73]'}` 
                  })}
                  {item.type === 'Dive' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ee9b00] rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>

                <div className={`
                  flex-1 bg-white rounded-[50px] p-8 md:p-12 border border-cyan-50 shadow-sm transition-all duration-500 relative
                  ${expandedIndex === idx ? 'shadow-2xl border-cyan-200/50 scale-[1.02]' : 'hover:shadow-xl hover:border-cyan-100'}
                `}>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[#0a9396] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] bg-cyan-50 px-4 py-1.5 rounded-full border border-cyan-100">
                          Dan {item.day} • {item.date}
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5" /> {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between cursor-pointer group/title" onClick={() => toggleAccordion(idx)}>
                      <h3 className="text-3xl md:text-4xl font-black text-[#001219] tracking-tight group-hover/title:text-[#005f73] transition-colors">
                        {item.title}
                      </h3>
                      {(item.dives && item.dives.length > 0) && (
                        <div className={`p-2 rounded-full bg-gray-50 transition-all duration-300 ${expandedIndex === idx ? 'bg-[#005f73] text-white rotate-180' : 'text-gray-400 group-hover/title:bg-[#f0f9fa]'}`}>
                          <ChevronDown className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <p className="text-gray-500 leading-relaxed text-lg font-medium">
                      {item.description}
                    </p>

                    {expandedIndex === idx && item.dives && item.dives.length > 0 && (
                      <div className="mt-10 pt-10 border-t border-gray-100 space-y-10 animate-in fade-in slide-in-from-top-6 duration-500">
                        {item.dives.map((dive, dIdx) => {
                          const siteInfo = getDiveSiteInfo(dive.site);
                          
                          return (
                            <div key={dIdx} className="bg-[#f8fcfd] rounded-[40px] p-8 md:p-12 space-y-8 border border-cyan-50 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                              
                              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                                    <Waves className="w-8 h-8 text-[#005f73]" />
                                  </div>
                                  <div>
                                    <h4 className="text-2xl font-black text-[#001219] uppercase tracking-tight">{dive.site}</h4>
                                    <span className="text-[10px] font-black text-[#0a9396] uppercase tracking-[0.3em]">Official Dive Spot</span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-gray-600 text-lg italic font-medium leading-relaxed pl-6 border-l-4 border-[#ee9b00] relative z-10">
                                {dive.description}
                              </p>

                              {/* API-Enhanced Dive Site Details */}
                              {siteInfo && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                  {/* Depth Information */}
                                  {siteInfo.depth && (
                                    <div className="bg-white p-6 rounded-[24px] border border-cyan-50">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#005f73]/10 rounded-lg">
                                          <Anchor className="w-5 h-5 text-[#005f73]" />
                                        </div>
                                        <span className="text-xs font-black text-[#001219] uppercase tracking-[0.2em]">Diving Depth</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Min Depth</span>
                                          <span className="font-black text-[#005f73]">{siteInfo.depth.min}m</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Max Depth</span>
                                          <span className="font-black text-[#005f73]">{siteInfo.depth.max}m</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Visibility Information */}
                                  {siteInfo.visibility && (
                                    <div className="bg-white p-6 rounded-[24px] border border-cyan-50">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#ee9b00]/10 rounded-lg">
                                          <Eye className="w-5 h-5 text-[#ee9b00]" />
                                        </div>
                                        <span className="text-xs font-black text-[#001219] uppercase tracking-[0.2em]">Visibility</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Min Visibility</span>
                                          <span className="font-black text-[#ee9b00]">{siteInfo.visibility.min}m</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-gray-600">Max Visibility</span>
                                          <span className="font-black text-[#ee9b00]">{siteInfo.visibility.max}m</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Water Temperature */}
                                  {siteInfo.waterTemperature && (
                                    <div className="bg-white p-6 rounded-[24px] border border-cyan-50">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#0a9396]/10 rounded-lg">
                                          <ThermometerSun className="w-5 h-5 text-[#0a9396]" />
                                        </div>
                                        <span className="text-xs font-black text-[#001219] uppercase tracking-[0.2em]">Water Temperature</span>
                                      </div>
                                      <span className="font-black text-2xl text-[#0a9396]">{siteInfo.waterTemperature}°C</span>
                                    </div>
                                  )}

                                  {/* Difficulty Level */}
                                  {siteInfo.difficulty && (
                                    <div className="bg-white p-6 rounded-[24px] border border-cyan-50">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#ee9b00]/10 rounded-lg">
                                          <TrendingUp className="w-5 h-5 text-[#ee9b00]" />
                                        </div>
                                        <span className="text-xs font-black text-[#001219] uppercase tracking-[0.2em]">Difficulty</span>
                                      </div>
                                      <span className="font-black text-lg text-[#ee9b00] uppercase tracking-wider">{siteInfo.difficulty}</span>
                                    </div>
                                  )}

                                  {/* Season Information */}
                                  {siteInfo.season && (
                                    <div className="bg-white p-6 rounded-[24px] border border-cyan-50 md:col-span-2">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#005f73]/10 rounded-lg">
                                          <Clock className="w-5 h-5 text-[#005f73]" />
                                        </div>
                                        <span className="text-xs font-black text-[#001219] uppercase tracking-[0.2em]">Best Season</span>
                                      </div>
                                      <span className="text-gray-700 font-semibold">{siteInfo.season}</span>
                                    </div>
                                  )}

                                  {/* Marine Life */}
                                  {siteInfo.marineLife && siteInfo.marineLife.length > 0 && (
                                    <div className="bg-white p-6 rounded-[24px] border border-cyan-50 md:col-span-2">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#0a9396]/10 rounded-lg">
                                          <Heart className="w-5 h-5 text-[#0a9396]" />
                                        </div>
                                        <span className="text-xs font-black text-[#001219] uppercase tracking-[0.2em]">Marine Life</span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {siteInfo.marineLife.map((species, i) => (
                                          <span key={i} className="bg-[#f0f9fa] text-[#005f73] text-[10px] font-bold px-4 py-2 rounded-full border border-cyan-100">
                                            {species}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Recommended Courses */}
                              <div className="bg-white p-8 rounded-[32px] border border-[#0a9396]/20 relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-[#ee9b00]/10 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-[#ee9b00]" />
                                  </div>
                                  <span className="text-xs font-black text-[#001219] uppercase tracking-[0.2em]">Preporučeni treninzi za ovu lokaciju</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {getRecommendedCourses(dive.difficulty || '').map((course, i) => (
                                    <a 
                                      key={i} 
                                      href="https://www.divessi.com" 
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-[#f0f9fa] hover:bg-[#005f73] hover:text-white text-[#005f73] text-[10px] font-black px-6 py-3 rounded-2xl transition-all uppercase tracking-widest shadow-sm border border-cyan-100"
                                    >
                                      {course}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Itinerary;
