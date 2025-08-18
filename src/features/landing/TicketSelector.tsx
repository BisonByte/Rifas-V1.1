'use client'

import { useState } from 'react'

export function TicketSelector() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [manualEntry, setManualEntry] = useState('')

  const generateNumbers = () => {
    const numbers: number[] = []
    for (let i = 1; i <= 100; i++) {
      numbers.push(i)
    }
    return numbers
  }

  const toggleNumber = (num: number) => {
    setSelectedNumbers(prev => 
      prev.includes(num) 
        ? prev.filter(n => n !== num)
        : [...prev, num]
    )
  }

  const handleManualEntry = () => {
    const numbers = manualEntry.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 100)
    setSelectedNumbers(numbers)
    setManualEntry('')
  }

  const selectRandom = (count: number) => {
    const available = Array.from({ length: 100 }, (_, i) => i + 1)
    const shuffled = available.sort(() => Math.random() - 0.5)
    setSelectedNumbers(shuffled.slice(0, count))
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-center text-yellow-300">Selecciona tus números</h3>
      
      {/* Botones de selección rápida */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button 
          onClick={() => selectRandom(1)}
          className="bg-yellow-500 text-black font-semibold py-2 rounded-lg text-sm hover:bg-yellow-400 transition-colors"
        >
          1 número
        </button>
        <button 
          onClick={() => selectRandom(3)}
          className="bg-yellow-500 text-black font-semibold py-2 rounded-lg text-sm hover:bg-yellow-400 transition-colors"
        >
          3 números
        </button>
        <button 
          onClick={() => selectRandom(5)}
          className="bg-yellow-500 text-black font-semibold py-2 rounded-lg text-sm hover:bg-yellow-400 transition-colors"
        >
          5 números
        </button>
      </div>

      {/* Entrada manual */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={manualEntry}
            onChange={(e) => setManualEntry(e.target.value)}
            placeholder="Ej: 1,23,45,67,89"
            className="flex-1 px-3 py-2 bg-red-700 border border-red-500 rounded-lg text-white placeholder-red-300 text-sm"
          />
          <button 
            onClick={handleManualEntry}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-500 transition-colors"
          >
            OK
          </button>
        </div>
      </div>

      {/* Grilla de números */}
      <div className="grid grid-cols-10 gap-1 mb-4 max-h-60 overflow-y-auto">
        {generateNumbers().map(num => (
          <button
            key={num}
            onClick={() => toggleNumber(num)}
            className={`
              aspect-square flex items-center justify-center text-xs font-bold rounded
              transition-colors
              ${selectedNumbers.includes(num)
                ? 'bg-yellow-500 text-black'
                : 'bg-red-700 text-white hover:bg-red-600'
              }
            `}
          >
            {num.toString().padStart(2, '0')}
          </button>
        ))}
      </div>

      {/* Números seleccionados */}
      {selectedNumbers.length > 0 && (
        <div className="bg-red-700 p-3 rounded-lg">
          <p className="text-sm mb-2">Números seleccionados ({selectedNumbers.length}):</p>
          <div className="flex flex-wrap gap-1">
            {selectedNumbers.sort((a, b) => a - b).map(num => (
              <span key={num} className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                {num.toString().padStart(2, '0')}
              </span>
            ))}
          </div>
          <p className="text-yellow-300 font-semibold mt-2">
            Total: {selectedNumbers.length * 40} Bs
          </p>
        </div>
      )}
    </div>
  )
}
