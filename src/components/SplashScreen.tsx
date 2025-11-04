export default function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto">
            <span className="text-6xl font-bold text-blue-600">M</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Megapro Innovation</h1>
        <p className="text-blue-100 text-lg">Field Force Automation</p>
        <div className="mt-8">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
