export default function Footer({ nextUpdateIn }) {
  return (
    <div className="mt-8 text-center text-gray-500 text-sm pb-8">
      <p>
        {nextUpdateIn 
          ? `Data syncs daily at 12 PM UTC • Next update in ${nextUpdateIn}`
          : 'Data syncs daily at 12 PM UTC'}
      </p>
    </div>
  );
}
