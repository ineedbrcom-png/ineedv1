
// CORRIGIDO: Removido 'async' e o tipo 'Promise' dos parâmetros.
export default function TestPage({ params }: { params: { slug: string } }) {
  // CORRIGIDO: Removido 'await' da desestruturação.
  const { slug } = params;
  return <div>Test page: {slug}</div>;
}
