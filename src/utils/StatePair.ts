export type StatePair<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export type SimpleStatePair<T> = [T, (newData: T) => unknown];
