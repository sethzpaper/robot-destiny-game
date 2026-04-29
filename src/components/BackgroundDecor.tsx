export default function BackgroundDecor() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
      />
    </div>
  );
}
