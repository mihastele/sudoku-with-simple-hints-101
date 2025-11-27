import Game from './components/Game';
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Sudoku Guide</h1>
      </header>
      <main>
        <Game />
      </main>
    </div>
  )
}

export default App
