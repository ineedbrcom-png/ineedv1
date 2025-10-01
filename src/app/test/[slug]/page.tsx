export default function TestPage({ params }: { params: { slug: string } }) {
  return <div>Test page: {params.slug}</div>;
}