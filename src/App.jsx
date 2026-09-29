import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import { CheckoutProvider } from './components/CheckoutProvider'

function App() {
  return (
    <CheckoutProvider>
      <div className="min-h-screen w-full overflow-x-hidden">
        <Hero>
          <Navbar />
        </Hero>
        <Features />
      </div>
    </CheckoutProvider>
  )
}

export default App
