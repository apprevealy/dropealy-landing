import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'

function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Hero>
        <Navbar />
      </Hero>
      <Features />
    </div>
  )
}

export default App
