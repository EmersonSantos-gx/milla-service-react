export default function Toast({ message, visible }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed top-5 left-1/2 z-[70] -translate-x-1/2 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-[#0E0820]/95 px-4 py-2 text-xs font-semibold text-white shadow-neon-cyan backdrop-blur-md">
        <i className="fa-solid fa-circle-check text-cyan-400" />
        <span>{message}</span>
      </div>
    </div>
  );
}
