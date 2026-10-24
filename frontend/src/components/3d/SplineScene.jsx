import React, { Suspense, lazy, Component } from 'react';
import HolographicCore from './HolographicCore';

// Lazy-load Spline only when URL is present to prevent bundle weight
const Spline = lazy(() => import('@splinetool/react-spline'));

class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('Spline runtime error, falling back to 3D Holographic Core:', error);
  }

  render() {
    if (this.state.hasError) {
      return <HolographicCore />;
    }
    return this.props.children;
  }
}

/**
 * SplineScene component renders a 3D scene using Spline if VITE_SPLINE_SCENE_URL is configured,
 * otherwise renders the interactive 3D Holographic Core.
 */
export const SplineScene = () => {
  const sceneUrl = import.meta.env.VITE_SPLINE_SCENE_URL?.trim();

  if (!sceneUrl) {
    return <HolographicCore />;
  }

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[620px] rounded-3xl overflow-hidden border border-white/10 bg-[#080B14]/40 shadow-glass-lg">
      <SplineErrorBoundary>
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-slate-400">Loading 3D Canvas...</span>
            </div>
          }
        >
          <Spline scene={sceneUrl} />
        </Suspense>
      </SplineErrorBoundary>
    </div>
  );
};

export { HolographicCore };
export const Interactive3DTechCore = HolographicCore;
export default SplineScene;
