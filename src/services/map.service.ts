import { View, Map, Feature } from "ol";
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { Point } from "ol/geom";
import { useGeographic } from "ol/proj";
import type { Coordinates } from "../interfaces/coordinates.interface.js";

export class MapService {
  #map: Map;
  #view: View;
  #vectorLayer: VectorLayer<VectorSource>;

  constructor(
    { latitude, longitude }: Coordinates,
    divMapId: string,
    zoom: number = 14
  ) {
    useGeographic();

    this.#view = new View({
      center: [longitude, latitude],
      zoom,
    });

    this.#map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: divMapId,
      view: this.#view,
    });

    this.#vectorLayer = new VectorLayer({
      map: this.#map,
      source: new VectorSource({
        features: [],
      }),
    });
  }

  get view(): View {
    return this.#view;
  }

  createMarker(
    { latitude, longitude }: Coordinates,
    color: string = "#3399CC",
    fill: string = "#fff"
  ): Feature<Point> {
    const positionFeature = new Feature({
      geometry: new Point([longitude, latitude]),
    });

    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 9,
          fill: new Fill({
            color,
          }),
          stroke: new Stroke({
            color: fill,
            width: 3,
          }),
        }),
      })
    );

    this.#vectorLayer.getSource()?.addFeature(positionFeature);

    return positionFeature;
  }
}
