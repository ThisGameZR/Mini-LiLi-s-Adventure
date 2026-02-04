export interface ClickEffect {
  id: number;
  x: number;
  y: number;
  text: string;
}

export const createClickEffect = (
  x: number,
  y: number,
  text: string,
  effects: ClickEffect[],
  setEffects: React.Dispatch<React.SetStateAction<ClickEffect[]>>
) => {
  const id = Date.now();
  setEffects(prev => [...prev, { id, x, y, text }]);
  
  setTimeout(() => {
    setEffects(prev => prev.filter(item => item.id !== id));
  }, 800);
};
