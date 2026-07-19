export function PlaceholderApp({ title }: { title: string }) {
  return (
    <div className="text-center text-white">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-gray-300">This training module is still being configured.</p>
    </div>
  );
}
