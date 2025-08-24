import { useEffect } from "react";
import { useURLState } from "../utils/useURLState";

const axisSeparator = "."; // Would use comma but it's escaped
const coordSeparator = "_";

export interface Coordinate {
  x: number;
  y: number;
}
function serialiseCoordinate(coords: null | Coordinate[]) {
  const strings = coords?.flatMap((coord) => {
    const { x, y } = coord;
    if (typeof x !== "number" || Number.isNaN(x)) return [];
    if (typeof y !== "number" || Number.isNaN(y)) return [];
    return [`${x}${axisSeparator}${y}`];
  });
  return strings?.join(coordSeparator) ?? "";
}

const deserialiseCoordinate = (str: string): null | Coordinate[] => {
  if (!str || str.trim() === "") return null;
  return str.split(coordSeparator).map((inner) => {
    const [x, y] = inner.split(axisSeparator);
    return { x: parseInt(x), y: parseInt(y) };
  });
};

export const coordinateSerialisation = {
  serialize: serialiseCoordinate,
  deserialize: deserialiseCoordinate,
};

export function useURLCoordinates(
  urlParam: string,
  thisCoordinate: Coordinate,
  defaultActivated: boolean
) {
  // Always use null as the hook's default to avoid conflicts
  const [coordinates, setCoordinates] = useURLState<null | Coordinate[]>(
    urlParam,
    null,
    coordinateSerialisation
  );

  const isThisOne = (coord: Coordinate) =>
    coord.x === thisCoordinate.x && coord.y === thisCoordinate.y;

  // Handle the actual default logic after URL state is established
  const actualCoordinates =
    coordinates ?? (defaultActivated ? [thisCoordinate] : []);
  const activated = actualCoordinates.some(isThisOne);

  useEffect(() => {
    if (coordinates === null && defaultActivated) {
      setCoordinates([thisCoordinate]);
    }
  }, [coordinates, defaultActivated, thisCoordinate, setCoordinates]);

  function toggleCoordinate() {
    const currentCoordinates = actualCoordinates;

    if (!activated) {
      return setCoordinates([...currentCoordinates, thisCoordinate]);
    }

    const filtered = currentCoordinates.filter((coord) => !isThisOne(coord));
    setCoordinates(filtered.length > 0 ? filtered : null);
  }

  return [activated, toggleCoordinate] as const;
}
