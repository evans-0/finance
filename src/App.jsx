import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

// Eagerly load home — it's the entry point
import Home from './pages/Home'

// Lazy load everything else
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const CalculatorsHub = lazy(() => import('./pages/CalculatorsHub'))
const Glossary       = lazy(() => import('./pages/Glossary'))
const HowMarketsWork = lazy(() => import('./pages/HowMarketsWork'))
const SIP            = lazy(() => import('./pages/calculators/SIP'))
const EMI            = lazy(() => import('./pages/calculators/EMI'))
const Compound       = lazy(() => import('./pages/calculators/Compound'))
const StockReturn    = lazy(() => import('./pages/calculators/StockReturn'))
const Portfolio      = lazy(() => import('./pages/calculators/Portfolio'))
const Options        = lazy(() => import('./pages/calculators/Options'))
const NetWorth       = lazy(() => import('./pages/calculators/NetWorth'))
const CreditCard     = lazy(() => import('./pages/calculators/CreditCard'))
const Inflation      = lazy(() => import('./pages/calculators/Inflation'))
const FDvsMF         = lazy(() => import('./pages/calculators/FDvsMF'))
const ULIPvsTermMF   = lazy(() => import('./pages/calculators/ULIPvsTermMF'))
const MFNav          = lazy(() => import('./pages/MFNav'))
const BuyVsRent		 = lazy(() => import('./pages/calculators/BuyVsRent'))
const FIRE			 = lazy(() => import('./pages/calculators/FIRE'))
const FutureNetWorth = lazy(() => import('./pages/calculators/FutureNetWorth'))

const Loader = () => (
  <div style={{ background: '#020c18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#506888', fontSize: 12, letterSpacing: 2 }}>
    LOADING...
  </div>
)

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"                          element={<Home />} />
          <Route path="/dashboard"                 element={<Dashboard />} />
          <Route path="/calculators"               element={<CalculatorsHub />} />
          <Route path="/calculators/sip"           element={<SIP />} />
          <Route path="/calculators/emi"           element={<EMI />} />
          <Route path="/calculators/compound"      element={<Compound />} />
          <Route path="/calculators/returns"       element={<StockReturn />} />
          <Route path="/calculators/portfolio"     element={<Portfolio />} />
          <Route path="/calculators/options"       element={<Options />} />
          <Route path="/calculators/networth"      element={<NetWorth />} />
          <Route path="/calculators/creditcard"    element={<CreditCard />} />
          <Route path="/calculators/inflation"     element={<Inflation />} />
          <Route path="/calculators/fdvsmf"        element={<FDvsMF />} />
          <Route path="/calculators/ulipvstermmf"  element={<ULIPvsTermMF />} />
          <Route path="/glossary"                  element={<Glossary />} />
          <Route path="/how-markets-work"          element={<HowMarketsWork />} />
          <Route path="/mf-nav"                     element={<MFNav />} />
		  <Route path="/calculators/buyvsrent" element={<BuyVsRent />} />
		  <Route path="/calculators/fire" element={<FIRE />} />
		  <Route path="/calculators/futurenetworth" element={<FutureNetWorth />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
