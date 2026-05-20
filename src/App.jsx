import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CalculatorsHub from './pages/CalculatorsHub'
import SIP from './pages/calculators/SIP'
import EMI from './pages/calculators/EMI'
import Compound from './pages/calculators/Compound'
import StockReturn from './pages/calculators/StockReturn'
import Portfolio from './pages/calculators/Portfolio'
import Options from './pages/calculators/Options'
import NetWorth from './pages/calculators/NetWorth'

export default function App() {
  return (
    <Routes>
      <Route path="/"                      element={<Home />} />
      <Route path="/dashboard"             element={<Dashboard />} />
      <Route path="/calculators"           element={<CalculatorsHub />} />
      <Route path="/calculators/sip"       element={<SIP />} />
      <Route path="/calculators/emi"       element={<EMI />} />
      <Route path="/calculators/compound"  element={<Compound />} />
      <Route path="/calculators/returns"   element={<StockReturn />} />
      <Route path="/calculators/portfolio" element={<Portfolio />} />
      <Route path="/calculators/options"   element={<Options />} />
      <Route path="/calculators/networth"  element={<NetWorth />} />
    </Routes>
  )
}
