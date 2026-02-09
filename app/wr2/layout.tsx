import "@/app/globals.css";

export default function WR2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen wr2-panel-bg">
      {children}
    </div>
  );
}
