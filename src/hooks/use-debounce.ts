
import { useState, useEffect } from 'react';

/**
 * Hook customizado para "atrasar" a atualização de um valor.
 * Isso é útil para evitar chamadas de API ou cálculos pesados a cada tecla digitada.
 * @param value O valor a ser "atrasado".
 * @param delay O tempo de atraso em milissegundos.
 * @returns O valor "atrasado".
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para armazenar o valor "atrasado".
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura um temporizador para atualizar o valor "atrasado" após o delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o temporizador se o valor mudar (ou o componente for desmontado).
    // Isso evita que o valor seja atualizado se o usuário continuar digitando.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda o efeito novamente apenas se o valor ou o delay mudarem.

  return debouncedValue;
}
