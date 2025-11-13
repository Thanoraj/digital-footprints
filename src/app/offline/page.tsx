export default function Offline() {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">🌐</div>
        <h1 className="text-2xl font-bold">You're Offline</h1>
        <p className="text-muted-foreground max-w-md">
          Digital Footprints requires an internet connection to function. 
          Please check your connection and try again.
        </p>
      </div>
    </div>
  );
}


