import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import X3Chat from "./pages/X3Chat";
import Legacy from "./pages/Legacy";
import Simulator from "./pages/Simulator";
import AnalisisIsapre from "./pages/AnalisisIsapre";
import ComparativoIsapres from "./pages/ComparativoIsapres";
import LandingGenerator from "./pages/LandingGenerator";
import APVShield from "./pages/APVShield";
import OptimizadorBlindaje from "./pages/OptimizadorBlindaje";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={X3Chat} />
      {/* Ruta del Legado — realidad exclusiva para los hijos de Alexander */}
      <Route path={"/legado"} component={Legacy} />
      {/* Simulador de Quiebre */}
      <Route path={"/simulador"} component={Simulator} />
      {/* Análisis de Plan Isapre */}
      <Route path={"/analisis-isapre"} component={AnalisisIsapre} />
      {/* Comparativo de Planes */}
      <Route path={"/comparativo"} component={ComparativoIsapres} />
      {/* Generador de Landing Pages 3D */}
      <Route path={"/landing-generator"} component={LandingGenerator} />
      {/* APV Tax-Shield — Artículo 42 bis */}
      <Route path={"/apv-shield"} component={APVShield} />
      {/* Optimizador Automático de Blindaje + Modo Presentación */}
      <Route path={"/optimizador"} component={OptimizadorBlindaje} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: 'oklch(0.09 0.03 260)',
                border: '1px solid oklch(0.18 0.04 260)',
                color: 'oklch(0.95 0.02 200)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
