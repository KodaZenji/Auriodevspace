export default function UserProfileCard({ username }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700 text-center">
      <img
        src={`https://unavatar.io/twitter/${username}`}
        alt={username}
        className="w-16 h-16 rounded-full mx-auto mb-3 border-4"
        style={{ borderColor: 'rgba(52, 211, 153, 0.5)' }}
        onError={(e) => {
          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${username}&size=160&backgroundColor=1f2937`;
        }}
      />
      <h2 className="text-xl font-bold text-white">{username}</h2>
    </div>
  );
}
